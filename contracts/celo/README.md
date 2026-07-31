# DailyRoomPool — Celo contracts

One shared prize pool per `(dayId, token)`. Players pay a fixed entry fee to join
a day's room; when the day closes the backend ranks every escape and signs one
claim per winner.

- **Self-funding.** The pool can never pay out more than it took in, so there is
  no house float and no solvency reserve.
- **The backend never holds player funds.** A signature only authorises a
  withdrawal from one specific day's pool.
- **Overdraw is impossible** even if the signer is buggy or compromised: `claim`
  independently checks the day's remaining balance on-chain. A bad signer can
  misallocate one day's pool, but can never mint value or reach another day.
- **Pausing blocks entries, never claims.** Earned winnings always stay
  withdrawable.
- **No `personal_sign`** anywhere — MiniPay does not support it.

## Develop

```shell
forge build
forge test
forge fmt
```

CI runs `forge fmt --check`, `forge build --sizes` and `forge test -vvv`.

## Deploy

The signer is a separate hot key from the owner. If they were the same, leaking
the backend key would also hand over the treasury — the script refuses to deploy
in that configuration.

```shell
export PRIVATE_KEY=0x...        # deployer; becomes owner unless OWNER_ADDRESS is set
export SIGNER_ADDRESS=0x...     # backend claim signer, never holds funds
# optional: OWNER_ADDRESS, RAKE_BPS (default 500 = 5%), CLAIM_WINDOW (default 30d)

# Simulate first — this runs against live chain state and costs nothing.
forge script script/Deploy.s.sol:Deploy \
  --rpc-url https://forno.celo-sepolia.celo-testnet.org/

# Then broadcast.
forge script script/Deploy.s.sol:Deploy \
  --rpc-url https://forno.celo-sepolia.celo-testnet.org/ \
  --broadcast --verify
```

Deploying costs roughly **0.26 CELO** at 100 gwei.

Stablecoin addresses are hardcoded per chain id in the script, so a mistyped env
var cannot enable a token that does not exist. Every address was read back
on-chain (`symbol`, `decimals`) before being committed — note that the celopedia
reference table lists `0xEF4d55…` as Sepolia USDm, but that contract actually
reports `cUSD`. The real USDm is `0xdE9e4C…`.

After deploying, set `NEXT_PUBLIC_POOL_ADDRESS` for the app, then open a day:

```shell
cast send $POOL "setEntryFee(uint32,address,uint256)" $DAY_ID $TOKEN $FEE \
  --rpc-url $RPC --private-key $PRIVATE_KEY
```

`dayId` is the UTC day number — `floor(unixMillis / 86_400_000)` — matching
`currentDayId()` in `lib/contract.ts`.
