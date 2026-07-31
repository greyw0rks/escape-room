// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {DailyRoomPool} from "../src/DailyRoomPool.sol";

/**
 * Deploys DailyRoomPool and enables the day-one stablecoins.
 *
 * Token addresses are hardcoded per chain id rather than passed in, so a
 * fat-fingered env var cannot enable a token that does not exist. Every address
 * below was read back on-chain (symbol + decimals) before being written here.
 *
 * Usage:
 *   forge script script/Deploy.s.sol:Deploy \
 *     --rpc-url https://forno.celo-sepolia.celo-testnet.org/ \
 *     --broadcast --verify
 *
 * Required env:
 *   PRIVATE_KEY   deployer; becomes owner unless OWNER_ADDRESS is set
 *   SIGNER_ADDRESS  backend key that authorises claims (never holds funds)
 * Optional env:
 *   OWNER_ADDRESS   defaults to the deployer
 *   RAKE_BPS        defaults to 500 (5%)
 *   CLAIM_WINDOW    seconds before unclaimed prizes may be swept; default 30 days
 */
contract Deploy is Script {
    uint256 constant CELO_MAINNET = 42220;
    uint256 constant CELO_SEPOLIA = 11142220;

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);

        address signer = vm.envAddress("SIGNER_ADDRESS");
        address owner = vm.envOr("OWNER_ADDRESS", deployer);
        uint16 rakeBps = uint16(vm.envOr("RAKE_BPS", uint256(500)));
        uint64 claimWindow = uint64(vm.envOr("CLAIM_WINDOW", uint256(30 days)));

        // The signer must be a separate hot key. If it were the owner, a leak of
        // the backend key would also hand over the treasury.
        require(signer != owner, "signer must not be the owner");

        address[] memory tokens = _tokensFor(block.chainid);

        vm.startBroadcast(pk);

        DailyRoomPool pool = new DailyRoomPool(owner, signer, rakeBps, claimWindow);
        for (uint256 i = 0; i < tokens.length; i++) {
            pool.enableToken(tokens[i], true);
        }

        vm.stopBroadcast();

        console2.log("DailyRoomPool:", address(pool));
        console2.log("chainId:      ", block.chainid);
        console2.log("owner:        ", owner);
        console2.log("signer:       ", signer);
        console2.log("rakeBps:      ", rakeBps);
        console2.log("claimWindow:  ", claimWindow);
        for (uint256 i = 0; i < tokens.length; i++) {
            console2.log("enabled token:", tokens[i]);
        }
    }

    function _tokensFor(uint256 chainId) internal pure returns (address[] memory tokens) {
        tokens = new address[](3);
        if (chainId == CELO_MAINNET) {
            tokens[0] = 0x765DE816845861e75A25fCA122bb6898B8B1282a; // USDm, 18
            tokens[1] = 0xcebA9300f2b948710d2653dD7B07f33A8B32118C; // USDC, 6
            tokens[2] = 0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e; // USDT, 6
        } else if (chainId == CELO_SEPOLIA) {
            tokens[0] = 0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b; // USDm, 18
            tokens[1] = 0x01C5C0122039549AD1493B8220cABEdD739BC44E; // USDC, 6
            tokens[2] = 0xd077A400968890Eacc75cdc901F0356c943e4fDb; // USDT, 6
        } else {
            revert("unsupported chain");
        }
    }
}
