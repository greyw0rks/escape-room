// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// ─────────────────────────────────────────────────────────────────────────────
// DailyRoomPool
//
// One shared prize pool per (day, stablecoin). Players pay a fixed entry fee to
// enter that day's room; when the day closes the backend ranks every escape and
// signs a claim for each winner.
//
// Design notes:
//  • Self-funding. Unlike a stake x multiplier game, the pool can never pay out
//    more than it took in, so there is no house float and no solvency reserve.
//  • The backend signs claims but never holds player funds — a signature only
//    authorises a withdrawal from that specific day's pool.
//  • Overdraw is impossible even if the signer is buggy or compromised: `claim`
//    checks the day's remaining balance on-chain. A bad signer can misallocate a
//    day's pool, but can never mint value or touch another day.
//  • No `personal_sign` anywhere — MiniPay does not support it. The player's only
//    transactions are `checkIn`, `enterRoom` and `claim`.
//  • `checkIn` is the free path: it moves no tokens and touches no accounting, so
//    it can never affect pool solvency.
// ─────────────────────────────────────────────────────────────────────────────

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract DailyRoomPool is Ownable, Pausable, ReentrancyGuard, EIP712 {
    using SafeERC20 for IERC20;

    // ── Constants ────────────────────────────────────────────────────────────

    uint256 public constant BPS = 10_000;
    /// Hard ceiling on the platform fee. Cannot be raised by the owner.
    uint16 public constant MAX_RAKE_BPS = 2_000; // 20%

    bytes32 private constant CLAIM_TYPEHASH =
        keccak256("Claim(uint32 dayId,address token,address player,uint256 amount)");

    // ── Config ───────────────────────────────────────────────────────────────

    /// Backend key that authorises claims. Never holds funds.
    address public trustedSigner;

    /// Platform fee, taken at entry.
    uint16 public rakeBps;

    /// Seconds after a room opens before the owner may sweep unclaimed winnings.
    uint64 public claimWindow;

    mapping(address => bool) public tokenEnabled;

    /// Fixed entry price per (day, token). Set by the owner before a day opens.
    mapping(uint32 => mapping(address => uint256)) public entryFee;

    // ── Accounting ───────────────────────────────────────────────────────────

    /// Prize money available for a given day, net of rake and already-paid claims.
    mapping(uint32 => mapping(address => uint256)) public pool;

    /// Timestamp of the first entry for a day — starts the claim window clock.
    mapping(uint32 => mapping(address => uint64)) public openedAt;

    mapping(uint32 => mapping(address => uint32)) public entrants;

    /// One entry and one claim per wallet per day.
    mapping(uint32 => mapping(address => mapping(address => bool))) public entered;
    mapping(uint32 => mapping(address => mapping(address => bool))) public claimed;

    /// One free check-in per wallet per day. Not keyed by token: a check-in
    /// registers the wallet for the day's room, it does not buy into a pool.
    mapping(uint32 => mapping(address => bool)) public checkedIn;
    mapping(uint32 => uint32) public checkIns;

    /// Accumulated platform fees, withdrawable by the owner.
    mapping(address => uint256) public treasury;

    // ── Errors ───────────────────────────────────────────────────────────────

    error ZeroAddress();
    error TokenNotEnabled(address token);
    error EntryFeeNotSet(uint32 dayId, address token);
    error AlreadyEntered();
    error AlreadyCheckedIn();
    error AlreadyClaimed();
    error BadSignature();
    error ZeroClaim();
    error PoolExhausted(uint256 requested, uint256 available);
    error RakeTooHigh(uint16 provided, uint16 max);
    error ClaimWindowOpen(uint64 until);
    error NothingToSweep();
    error AmountExceedsTreasury(uint256 requested, uint256 available);

    // ── Events ───────────────────────────────────────────────────────────────

    /// The on-chain record of a player entering. Indexed for the stats page.
    event Entered(
        uint32 indexed dayId,
        address indexed player,
        address indexed token,
        uint256 fee,
        uint256 toPool
    );
    /// Emitted separately so protocol revenue is summable without parsing entries.
    event FeeCollected(uint32 indexed dayId, address indexed token, uint256 amount);
    /// The on-chain proof that a wallet opened a day's room. Indexed so the
    /// backend and the stats page can count distinct wallets per day.
    event CheckedIn(uint32 indexed dayId, address indexed player, uint64 at);
    event Claimed(
        uint32 indexed dayId, address indexed player, address indexed token, uint256 amount
    );
    event PoolFunded(uint32 indexed dayId, address indexed token, address funder, uint256 amount);
    event Swept(uint32 indexed dayId, address indexed token, uint256 amount, address to);
    event TreasuryWithdrawn(address indexed token, uint256 amount, address to);
    event SignerUpdated(address oldSigner, address newSigner);
    event TokenEnabled(address indexed token, bool enabled);
    event EntryFeeSet(uint32 indexed dayId, address indexed token, uint256 fee);

    // ── Constructor ──────────────────────────────────────────────────────────

    constructor(address owner_, address signer_, uint16 rakeBps_, uint64 claimWindow_)
        Ownable(owner_)
        EIP712("DailyRoomPool", "1")
    {
        if (signer_ == address(0)) revert ZeroAddress();
        if (rakeBps_ > MAX_RAKE_BPS) revert RakeTooHigh(rakeBps_, MAX_RAKE_BPS);
        trustedSigner = signer_;
        rakeBps = rakeBps_;
        claimWindow = claimWindow_;
    }

    // ── Check-in ─────────────────────────────────────────────────────────────

    /**
     * @notice Register for a day's room. Free — no tokens move, and the player
     *         pays only the network fee.
     * @dev This is the app's proof of wallet ownership. MiniPay supports neither
     *      `personal_sign` nor `eth_signTypedData`, so a transaction is the only
     *      way a player can demonstrate they control an address — `msg.sender`
     *      is the proof. It is also what opens their ranked attempt for the day,
     *      so the on-chain record is a byproduct of a real action rather than an
     *      end in itself.
     *
     *      Deliberately not `nonReentrant`: there is no external call and no
     *      token transfer here, so there is nothing to re-enter. It *is*
     *      `whenNotPaused`, because pausing must stop new players arriving and
     *      this is now an entry path. (`claim` stays unpausable — winnings must
     *      always be withdrawable — but a check-in is not a withdrawal.)
     */
    function checkIn(uint32 dayId) external whenNotPaused {
        if (checkedIn[dayId][msg.sender]) revert AlreadyCheckedIn();

        checkedIn[dayId][msg.sender] = true;
        checkIns[dayId] += 1;

        emit CheckedIn(dayId, msg.sender, uint64(block.timestamp));
    }

    // ── Entry ────────────────────────────────────────────────────────────────

    /**
     * @notice Pay the entry fee for a day's room. One entry per wallet per day.
     * @dev The fee is fixed on-chain rather than passed in, so a player can never
     *      underpay their way onto the leaderboard.
     */
    function enterRoom(uint32 dayId, address token) external nonReentrant whenNotPaused {
        if (!tokenEnabled[token]) revert TokenNotEnabled(token);
        if (entered[dayId][token][msg.sender]) revert AlreadyEntered();

        uint256 fee = entryFee[dayId][token];
        if (fee == 0) revert EntryFeeNotSet(dayId, token);

        entered[dayId][token][msg.sender] = true;

        IERC20(token).safeTransferFrom(msg.sender, address(this), fee);

        uint256 rake = (fee * rakeBps) / BPS;
        uint256 toPool = fee - rake;

        treasury[token] += rake;
        pool[dayId][token] += toPool;
        entrants[dayId][token] += 1;

        if (openedAt[dayId][token] == 0) openedAt[dayId][token] = uint64(block.timestamp);

        emit Entered(dayId, msg.sender, token, fee, toPool);
        if (rake > 0) emit FeeCollected(dayId, token, rake);
    }

    /**
     * @notice Add sponsor money to a day's pool. Takes no rake — a sponsor's
     *         contribution goes entirely to players.
     */
    function fundPool(uint32 dayId, address token, uint256 amount) external nonReentrant {
        if (!tokenEnabled[token]) revert TokenNotEnabled(token);
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        pool[dayId][token] += amount;
        if (openedAt[dayId][token] == 0) openedAt[dayId][token] = uint64(block.timestamp);
        emit PoolFunded(dayId, token, msg.sender, amount);
    }

    // ── Claim ────────────────────────────────────────────────────────────────

    /**
     * @notice Withdraw a winning share, authorised by a backend signature.
     * @dev The signature binds dayId, token, player and amount together, so it
     *      cannot be replayed against another day, token or wallet. The pool
     *      balance check is the backstop: even a compromised signer cannot draw
     *      more than the day actually collected.
     *
     *      Anyone may submit the transaction; the signature is the authorisation.
     */
    function claim(uint32 dayId, address token, uint256 amount, bytes calldata signature)
        external
        nonReentrant
    {
        if (amount == 0) revert ZeroClaim();
        if (claimed[dayId][token][msg.sender]) revert AlreadyClaimed();

        bytes32 structHash = keccak256(abi.encode(CLAIM_TYPEHASH, dayId, token, msg.sender, amount));
        if (ECDSA.recover(_hashTypedDataV4(structHash), signature) != trustedSigner) {
            revert BadSignature();
        }

        uint256 available = pool[dayId][token];
        if (amount > available) revert PoolExhausted(amount, available);

        claimed[dayId][token][msg.sender] = true;
        pool[dayId][token] = available - amount;

        IERC20(token).safeTransfer(msg.sender, amount);
        emit Claimed(dayId, msg.sender, token, amount);
    }

    // ── Owner ────────────────────────────────────────────────────────────────

    /// @notice Fix the entry price for a day before it opens.
    function setEntryFee(uint32 dayId, address token, uint256 fee) external onlyOwner {
        entryFee[dayId][token] = fee;
        emit EntryFeeSet(dayId, token, fee);
    }

    /**
     * @notice Recover prize money nobody claimed, once the window has passed.
     * @dev Swept funds go to the treasury rather than an arbitrary address, so
     *      they stay auditable.
     */
    function sweepUnclaimed(uint32 dayId, address token) external onlyOwner {
        uint64 opened = openedAt[dayId][token];
        uint64 until = opened + claimWindow;
        if (opened == 0 || block.timestamp < until) revert ClaimWindowOpen(until);

        uint256 remaining = pool[dayId][token];
        if (remaining == 0) revert NothingToSweep();

        pool[dayId][token] = 0;
        treasury[token] += remaining;
        emit Swept(dayId, token, remaining, owner());
    }

    function withdrawTreasury(address token, uint256 amount, address to) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        uint256 available = treasury[token];
        if (amount > available) revert AmountExceedsTreasury(amount, available);

        treasury[token] = available - amount;
        IERC20(token).safeTransfer(to, amount);
        emit TreasuryWithdrawn(token, amount, to);
    }

    function enableToken(address token, bool enabled) external onlyOwner {
        if (token == address(0)) revert ZeroAddress();
        tokenEnabled[token] = enabled;
        emit TokenEnabled(token, enabled);
    }

    function setSigner(address signer_) external onlyOwner {
        if (signer_ == address(0)) revert ZeroAddress();
        emit SignerUpdated(trustedSigner, signer_);
        trustedSigner = signer_;
    }

    function setRakeBps(uint16 rakeBps_) external onlyOwner {
        if (rakeBps_ > MAX_RAKE_BPS) revert RakeTooHigh(rakeBps_, MAX_RAKE_BPS);
        rakeBps = rakeBps_;
    }

    function setClaimWindow(uint64 window) external onlyOwner {
        claimWindow = window;
    }

    /// @dev Pausing stops new entries but never blocks claims — players must always
    ///      be able to withdraw winnings they have already earned.
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ── Views ────────────────────────────────────────────────────────────────

    function poolOf(uint32 dayId, address token) external view returns (uint256) {
        return pool[dayId][token];
    }

    function hasEntered(uint32 dayId, address token, address player) external view returns (bool) {
        return entered[dayId][token][player];
    }

    function hasCheckedIn(uint32 dayId, address player) external view returns (bool) {
        return checkedIn[dayId][player];
    }

    function hasClaimed(uint32 dayId, address token, address player) external view returns (bool) {
        return claimed[dayId][token][player];
    }

    /// @notice Exposed so the backend can build the exact digest it must sign.
    function claimDigest(uint32 dayId, address token, address player, uint256 amount)
        external
        view
        returns (bytes32)
    {
        return _hashTypedDataV4(keccak256(abi.encode(CLAIM_TYPEHASH, dayId, token, player, amount)));
    }
}
