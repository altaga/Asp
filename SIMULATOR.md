# Asp booth walkthrough

A short guide for Metropolis judges: three screens and one machine.

Live: [altaga-asp.expo.app](https://altaga-asp.expo.app)

---

## Screens

### 1. Get: `/`

Prove you're human once with World ID and the dispenser holds one item for you. You get a **winner ticket** (`WIN-…`). Bring the code to the kiosk, not the browser.

![Get ticket](images/shot-ticket.png)

### 2. Claim: `/claim`

Enter the ticket → confirm it's the same human → scan the **WalletConnect** QR with your phone wallet and pay USDC on Monad → the gachapon motor turns **once**.

![Claim](images/shot-claim.png)

### 3. NFT drop: `/test` → `/test/claim`

Same Get → Claim, but the item comes out on-chain: your paying wallet receives one numbered `AspDrop` edition on Monad. Editions come out in order, the shelf shows what's left, and the art is rendered by the contract.

![NFT drop](images/shot-nft.png)

### Backup: `/v1`

No pre-issued ticket. The same loop runs on the spot (World → pay → item). Useful if signup is busy.

---

## What you should see work

1. The face check completes (World sandbox / event path).
2. The ticket is unique, and reusing it is rejected.
3. The USDC transfer lands on Monad, and the gateway checks the real receipt instead of trusting a `paid=true`.
4. The motor turns **once** per successful claim, or exactly one edition is released per payment.
5. A MonadVision link to the payment (and the NFT) appears at the end.
6. Trying to claim again with the same ticket or the same face fails.

You need a phone wallet that speaks WalletConnect (MetaMask, Rainbow, Trust, …) holding a little USDC (0.002 per claim) and MON for gas on Monad mainnet.

---

## Local UI

```bash
cd asp-dapp
npx expo start --web --port 8087
```

| URL | Job |
|---|---|
| `http://localhost:8087/` | Get ticket |
| `http://localhost:8087/claim` | Kiosk claim (motor) |
| `http://localhost:8087/test/claim` | Kiosk claim (NFT drop) |
| `http://localhost:8087/v1` | Backup demo |
| `http://localhost:8087/kiosk` | Pay-only lab (no World, no motor) |

The motor path needs the gateway and the hardware running. Without them, the UI still walks through the full Asp claim flow, and the NFT path only needs the gateway.
