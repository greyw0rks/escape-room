// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {DailyRoomPool} from "../src/DailyRoomPool.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSD is ERC20 {
    constructor() ERC20("Mock USD", "mUSD") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

/**
 * NOTE ON TEST STYLE
 * Every signature is built into a local *before* any vm.prank / vm.expectRevert.
 * `_sign` calls `claimDigest` on the contract, and Solidity evaluates arguments
 * before the call — so an inline `_sign(...)` would consume the cheatcode and the
 * assertion would silently test the wrong call.
 */
contract DailyRoomPoolTest is Test {
    DailyRoomPool internal poolContract;
    MockUSD internal usd;
    MockUSD internal otherUsd;

    address internal owner = address(0xA11CE);
    uint256 internal signerKey = 0xBEEF;
    address internal signer;

    address internal alice = address(0xA1);
    address internal bob = address(0xB0B);
    address internal carol = address(0xCAB0);

    uint32 internal constant DAY = 20_300;
    uint256 internal constant FEE = 0.25e18;
    uint16 internal constant RAKE = 500; // 5%
    uint64 internal constant WINDOW = 7 days;

    function setUp() public {
        signer = vm.addr(signerKey);
        usd = new MockUSD();
        otherUsd = new MockUSD();

        poolContract = new DailyRoomPool(owner, signer, RAKE, WINDOW);

        vm.startPrank(owner);
        poolContract.enableToken(address(usd), true);
        poolContract.enableToken(address(otherUsd), true);
        poolContract.setEntryFee(DAY, address(usd), FEE);
        poolContract.setEntryFee(DAY, address(otherUsd), FEE);
        vm.stopPrank();

        address[3] memory players = [alice, bob, carol];
        for (uint256 i = 0; i < players.length; i++) {
            usd.mint(players[i], 100e18);
            otherUsd.mint(players[i], 100e18);
            vm.startPrank(players[i]);
            usd.approve(address(poolContract), type(uint256).max);
            otherUsd.approve(address(poolContract), type(uint256).max);
            vm.stopPrank();
        }
    }

    function _sign(uint32 dayId, address token, address player, uint256 amount)
        internal
        view
        returns (bytes memory)
    {
        bytes32 digest = poolContract.claimDigest(dayId, token, player, amount);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerKey, digest);
        return abi.encodePacked(r, s, v);
    }

    function _enter(address who) internal {
        vm.prank(who);
        poolContract.enterRoom(DAY, address(usd));
    }

    // ── Entry ────────────────────────────────────────────────────────────────

    function test_entry_splitsFeeBetweenPoolAndTreasury() public {
        _enter(alice);

        uint256 expectedRake = (FEE * RAKE) / 10_000;
        assertEq(poolContract.treasury(address(usd)), expectedRake);
        assertEq(poolContract.poolOf(DAY, address(usd)), FEE - expectedRake);
        assertEq(usd.balanceOf(address(poolContract)), FEE);
    }

    function test_entry_accumulatesAcrossPlayers() public {
        _enter(alice);
        _enter(bob);
        _enter(carol);

        uint256 rakePer = (FEE * RAKE) / 10_000;
        assertEq(poolContract.poolOf(DAY, address(usd)), (FEE - rakePer) * 3);
        assertEq(poolContract.entrants(DAY, address(usd)), 3);
    }

    function test_entry_rejectsSecondEntryFromSameWallet() public {
        _enter(alice);
        vm.prank(alice);
        vm.expectRevert(DailyRoomPool.AlreadyEntered.selector);
        poolContract.enterRoom(DAY, address(usd));
    }

    function test_entry_rejectsDisabledToken() public {
        MockUSD rogue = new MockUSD();
        rogue.mint(alice, 10e18);

        vm.startPrank(alice);
        rogue.approve(address(poolContract), type(uint256).max);
        vm.expectRevert(
            abi.encodeWithSelector(DailyRoomPool.TokenNotEnabled.selector, address(rogue))
        );
        poolContract.enterRoom(DAY, address(rogue));
        vm.stopPrank();
    }

    function test_entry_rejectsDayWithNoFeeSet() public {
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(DailyRoomPool.EntryFeeNotSet.selector, DAY + 1, address(usd))
        );
        poolContract.enterRoom(DAY + 1, address(usd));
    }

    function test_entry_blockedWhenPaused() public {
        vm.prank(owner);
        poolContract.pause();

        vm.prank(alice);
        vm.expectRevert();
        poolContract.enterRoom(DAY, address(usd));
    }

    // ── Claiming ─────────────────────────────────────────────────────────────

    function test_claim_paysSignedAmount() public {
        _enter(alice);
        _enter(bob);

        uint256 amount = 0.3e18;
        uint256 balanceBefore = usd.balanceOf(alice);
        bytes memory sig = _sign(DAY, address(usd), alice, amount);

        vm.prank(alice);
        poolContract.claim(DAY, address(usd), amount, sig);

        assertEq(usd.balanceOf(alice) - balanceBefore, amount);
        assertTrue(poolContract.hasClaimed(DAY, address(usd), alice));
    }

    function test_claim_reducesThePool() public {
        _enter(alice);
        _enter(bob);

        uint256 poolBefore = poolContract.poolOf(DAY, address(usd));
        uint256 amount = 0.2e18;
        bytes memory sig = _sign(DAY, address(usd), alice, amount);

        vm.prank(alice);
        poolContract.claim(DAY, address(usd), amount, sig);

        assertEq(poolContract.poolOf(DAY, address(usd)), poolBefore - amount);
    }

    function test_claim_rejectsSecondClaim() public {
        _enter(alice);
        _enter(bob);

        uint256 amount = 0.1e18;
        bytes memory sig = _sign(DAY, address(usd), alice, amount);

        vm.prank(alice);
        poolContract.claim(DAY, address(usd), amount, sig);

        vm.prank(alice);
        vm.expectRevert(DailyRoomPool.AlreadyClaimed.selector);
        poolContract.claim(DAY, address(usd), amount, sig);
    }

    function test_claim_rejectsUnsignedAmount() public {
        _enter(alice);

        // Signature authorises 0.1; the player attempts 0.2.
        bytes memory sig = _sign(DAY, address(usd), alice, 0.1e18);

        vm.prank(alice);
        vm.expectRevert(DailyRoomPool.BadSignature.selector);
        poolContract.claim(DAY, address(usd), 0.2e18, sig);
    }

    function test_claim_rejectsSignatureFromWrongKey() public {
        _enter(alice);

        uint256 amount = 0.1e18;
        bytes32 digest = poolContract.claimDigest(DAY, address(usd), alice, amount);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(0xDEAD, digest);
        bytes memory sig = abi.encodePacked(r, s, v);

        vm.prank(alice);
        vm.expectRevert(DailyRoomPool.BadSignature.selector);
        poolContract.claim(DAY, address(usd), amount, sig);
    }

    /// A signature issued to one player must not work for another.
    function test_claim_rejectsReplayAcrossWallets() public {
        _enter(alice);
        _enter(bob);

        uint256 amount = 0.1e18;
        bytes memory aliceSig = _sign(DAY, address(usd), alice, amount);

        vm.prank(bob);
        vm.expectRevert(DailyRoomPool.BadSignature.selector);
        poolContract.claim(DAY, address(usd), amount, aliceSig);
    }

    /// Yesterday's winning signature must not drain today's pool.
    function test_claim_rejectsReplayAcrossDays() public {
        _enter(alice);

        vm.prank(owner);
        poolContract.setEntryFee(DAY + 1, address(usd), FEE);
        vm.prank(bob);
        poolContract.enterRoom(DAY + 1, address(usd));

        uint256 amount = 0.1e18;
        bytes memory sigForToday = _sign(DAY, address(usd), alice, amount);

        vm.prank(alice);
        vm.expectRevert(DailyRoomPool.BadSignature.selector);
        poolContract.claim(DAY + 1, address(usd), amount, sigForToday);
    }

    /// A USDm claim must not be replayable against the USDC pool.
    function test_claim_rejectsReplayAcrossTokens() public {
        _enter(alice);
        vm.prank(alice);
        poolContract.enterRoom(DAY, address(otherUsd));

        uint256 amount = 0.1e18;
        bytes memory usdSig = _sign(DAY, address(usd), alice, amount);

        vm.prank(alice);
        vm.expectRevert(DailyRoomPool.BadSignature.selector);
        poolContract.claim(DAY, address(otherUsd), amount, usdSig);
    }

    /**
     * The critical invariant: even a compromised or buggy signer cannot draw more
     * than the day actually collected.
     */
    function test_claim_cannotOverdrawThePool() public {
        _enter(alice);

        uint256 available = poolContract.poolOf(DAY, address(usd));
        uint256 tooMuch = available + 1;
        bytes memory sig = _sign(DAY, address(usd), alice, tooMuch);

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(DailyRoomPool.PoolExhausted.selector, tooMuch, available)
        );
        poolContract.claim(DAY, address(usd), tooMuch, sig);
    }

    function test_claim_cannotDrainAnotherDaysPool() public {
        _enter(alice);

        vm.prank(owner);
        poolContract.setEntryFee(DAY + 1, address(usd), FEE);
        vm.prank(bob);
        poolContract.enterRoom(DAY + 1, address(usd));

        uint256 dayTwoPool = poolContract.poolOf(DAY + 1, address(usd));
        uint256 wholeBalance = usd.balanceOf(address(poolContract));
        assertGt(wholeBalance, dayTwoPool);

        bytes memory sig = _sign(DAY + 1, address(usd), bob, wholeBalance);

        vm.prank(bob);
        vm.expectRevert(
            abi.encodeWithSelector(DailyRoomPool.PoolExhausted.selector, wholeBalance, dayTwoPool)
        );
        poolContract.claim(DAY + 1, address(usd), wholeBalance, sig);
    }

    function test_claim_rejectsZeroAmount() public {
        _enter(alice);
        bytes memory sig = _sign(DAY, address(usd), alice, 0);

        vm.prank(alice);
        vm.expectRevert(DailyRoomPool.ZeroClaim.selector);
        poolContract.claim(DAY, address(usd), 0, sig);
    }

    /// Players must always be able to withdraw winnings, even while paused.
    function test_claim_worksWhilePaused() public {
        _enter(alice);
        _enter(bob);

        vm.prank(owner);
        poolContract.pause();

        uint256 amount = 0.1e18;
        bytes memory sig = _sign(DAY, address(usd), alice, amount);

        vm.prank(alice);
        poolContract.claim(DAY, address(usd), amount, sig);
        assertTrue(poolContract.hasClaimed(DAY, address(usd), alice));
    }

    /// Claiming the whole pool must leave exactly zero — no dust stranded.
    function test_claim_wholePoolLeavesZero() public {
        _enter(alice);
        _enter(bob);

        uint256 total = poolContract.poolOf(DAY, address(usd));
        uint256 half = total / 2;
        uint256 rest = total - half;

        bytes memory aliceSig = _sign(DAY, address(usd), alice, half);
        bytes memory bobSig = _sign(DAY, address(usd), bob, rest);

        vm.prank(alice);
        poolContract.claim(DAY, address(usd), half, aliceSig);
        vm.prank(bob);
        poolContract.claim(DAY, address(usd), rest, bobSig);

        assertEq(poolContract.poolOf(DAY, address(usd)), 0);
    }

    // ── Sponsorship ──────────────────────────────────────────────────────────

    function test_fundPool_takesNoRake() public {
        usd.mint(address(this), 10e18);
        usd.approve(address(poolContract), type(uint256).max);

        poolContract.fundPool(DAY, address(usd), 5e18);

        assertEq(poolContract.poolOf(DAY, address(usd)), 5e18);
        assertEq(poolContract.treasury(address(usd)), 0);
    }

    // ── Sweeping ─────────────────────────────────────────────────────────────

    function test_sweep_rejectedWhileClaimWindowOpen() public {
        _enter(alice);
        vm.prank(owner);
        vm.expectRevert();
        poolContract.sweepUnclaimed(DAY, address(usd));
    }

    function test_sweep_movesUnclaimedToTreasuryAfterWindow() public {
        _enter(alice);
        uint256 remaining = poolContract.poolOf(DAY, address(usd));
        uint256 treasuryBefore = poolContract.treasury(address(usd));

        vm.warp(block.timestamp + WINDOW + 1);
        vm.prank(owner);
        poolContract.sweepUnclaimed(DAY, address(usd));

        assertEq(poolContract.poolOf(DAY, address(usd)), 0);
        assertEq(poolContract.treasury(address(usd)), treasuryBefore + remaining);
    }

    function test_sweep_onlyOwner() public {
        _enter(alice);
        vm.warp(block.timestamp + WINDOW + 1);
        vm.prank(alice);
        vm.expectRevert();
        poolContract.sweepUnclaimed(DAY, address(usd));
    }

    // ── Config ───────────────────────────────────────────────────────────────

    function test_rakeCannotExceedHardCap() public {
        vm.prank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(DailyRoomPool.RakeTooHigh.selector, uint16(2001), uint16(2000))
        );
        poolContract.setRakeBps(2001);
    }

    function test_constructorRejectsExcessiveRake() public {
        vm.expectRevert(
            abi.encodeWithSelector(DailyRoomPool.RakeTooHigh.selector, uint16(5000), uint16(2000))
        );
        new DailyRoomPool(owner, signer, 5000, WINDOW);
    }

    function test_onlyOwnerCanChangeSigner() public {
        vm.prank(alice);
        vm.expectRevert();
        poolContract.setSigner(alice);

        vm.prank(owner);
        poolContract.setSigner(alice);
        assertEq(poolContract.trustedSigner(), alice);
    }

    function test_withdrawTreasury_cannotTakeMoreThanCollected() public {
        _enter(alice);
        uint256 available = poolContract.treasury(address(usd));

        vm.prank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(
                DailyRoomPool.AmountExceedsTreasury.selector, available + 1, available
            )
        );
        poolContract.withdrawTreasury(address(usd), available + 1, owner);
    }

    /// The owner must never be able to reach into an unswept prize pool.
    function test_withdrawTreasury_cannotTouchPrizePool() public {
        _enter(alice);
        _enter(bob);
        _enter(carol);

        uint256 rakeTotal = poolContract.treasury(address(usd));
        vm.prank(owner);
        poolContract.withdrawTreasury(address(usd), rakeTotal, owner);

        // Everything left in the contract is still owed to players.
        assertEq(usd.balanceOf(address(poolContract)), poolContract.poolOf(DAY, address(usd)));
        assertEq(poolContract.treasury(address(usd)), 0);
    }

    // ── Fuzz ─────────────────────────────────────────────────────────────────

    /// Whatever the fee and rake, pool + treasury must always equal what came in.
    function testFuzz_accountingIsConserved(uint96 fee, uint16 rake) public {
        fee = uint96(bound(fee, 1, 1_000e18));
        rake = uint16(bound(rake, 0, 2000));

        vm.startPrank(owner);
        poolContract.setRakeBps(rake);
        poolContract.setEntryFee(DAY + 5, address(usd), fee);
        vm.stopPrank();

        usd.mint(alice, fee);
        vm.prank(alice);
        poolContract.enterRoom(DAY + 5, address(usd));

        assertEq(
            poolContract.poolOf(DAY + 5, address(usd)) + poolContract.treasury(address(usd)),
            uint256(fee)
        );
    }

    /// No sequence of signed claims can withdraw more than the pool holds.
    function testFuzz_claimsNeverExceedPool(uint96 a, uint96 b) public {
        _enter(alice);
        _enter(bob);
        _enter(carol);

        uint256 available = poolContract.poolOf(DAY, address(usd));
        uint256 amountA = bound(a, 1, available);
        bytes memory sigA = _sign(DAY, address(usd), alice, amountA);

        vm.prank(alice);
        poolContract.claim(DAY, address(usd), amountA, sigA);

        uint256 left = poolContract.poolOf(DAY, address(usd));
        assertEq(left, available - amountA);

        uint256 amountB = bound(b, 1, type(uint96).max);
        bytes memory sigB = _sign(DAY, address(usd), bob, amountB);

        if (amountB > left) {
            vm.prank(bob);
            vm.expectRevert(
                abi.encodeWithSelector(DailyRoomPool.PoolExhausted.selector, amountB, left)
            );
            poolContract.claim(DAY, address(usd), amountB, sigB);
        } else {
            vm.prank(bob);
            poolContract.claim(DAY, address(usd), amountB, sigB);
            assertEq(poolContract.poolOf(DAY, address(usd)), left - amountB);
        }

        // The contract can never owe more than it holds.
        assertGe(usd.balanceOf(address(poolContract)), poolContract.poolOf(DAY, address(usd)));
    }
}
