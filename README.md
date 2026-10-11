# Asp — AntiScalper Protocol

<div align="center">
  <img src="images/brand/asp-lockup.png" alt="Asp 限定自販機" width="55%"/>
</div>

<div align="center">

**One human. One item.**  
Machines you can hire on Monad. Drops scalpers can't steal.

[Live demo](https://altaga-asp.expo.app) · [NFT drop](https://altaga-asp.expo.app/test/claim) · [AspDrop on MonadVision](https://monadvision.com/address/0x942c1a378b961fb7a95b83ecaf55fecee42c6187) · [World](#world) · [Monad](#monad)

</div>

---

## Metropolis submission

| | |
|---|---|
| Hackathon | [Monad Metropolis](https://monad.xyz/developers/hackathons/metropolis) (1 Sep – 13 Oct 2026) |
| Track | **03 · Social, Attention & Culture**: ticketing and access that follow a *person*, not an email or a wallet |
| Chain | Monad mainnet (`eip155:143`), USDC |
| Partner rail | World ID (Proof of Human) |
| Live app | [altaga-asp.expo.app](https://altaga-asp.expo.app) |
| On-chain drop | [`AspDrop` `0x942c…6187`](https://monadvision.com/address/0x942c1a378b961fb7a95b83ecaf55fecee42c6187), 20 limited editions with fully on-chain art |
| Hardware | XIAO ESP32-C5 gachapon on MQTT, one motor turn per paid claim |

Built inside the Metropolis window: this repo starts on 30 Sep 2026 and every commit is part of the build.

---

## The problem

A limited capsule drops. Fans line up, and so do bots and wallets.

A payment only tells you that someone *paid*. It doesn't tell you *who* paid or whether they *already claimed*.

| Question | Why a plain payment fails |
|---|---|
| **Who?** | A hot wallet is not a person |
| **What?** | One unit from *this* machine, this release |
| **Once?** | A second face, a second wallet or a retry all have to fail |

Asp runs two rails on one stack:

1. **World**, the fairness switch: ticket ↔ zk nullifier ↔ same human at claim time
2. **Monad**, the money rail: **x402** to hire machines, and a **WalletConnect USDC transfer** when a human pays at the booth

---

## The beat

```text
Win      World selfie → ticket WIN-… welded to your nullifier
Claim    Same human. Same nullifier. Otherwise the petition dies.
Pay      Monad: phone wallet over WalletConnect, tagged USDC transfer
Release  Gateway verifies the transfer on-chain → one motor turn (or one AspDrop edition)
```

**The twist:** every machine on Asp can be hired over **x402**, agents included.  
*This* machine is PoH-gated. An agent can knock, but it can't skip World. So for the drop, the human walks up, proves who they are and **pays on Monad from their own wallet**. Scalpers don't get a faster lane, and agents don't get a backdoor.

---

## Architecture

```mermaid
flowchart LR
  subgraph World["World"]
    IDKit[IDKit]
    Portal[verify]
  end

  subgraph Asp["Asp"]
    Dapp["Get / Claim"]
    GW[Gateway]
    Dev[Gachapon motor]
  end

  subgraph Monad["Monad"]
    USDC[USDC transfer]
    X402[x402 hire]
    Drop[AspDrop NFT]
  end

  Human((Human)) --> IDKit --> Dapp --> GW
  Human -->|WalletConnect| USDC --> GW
  Agent((Agent)) -->|HTTP 402| X402 --> GW
  GW -->|PoH ok + paid| Dev
  GW -->|PoH ok + paid| Drop
```

| Package | Job |
|---|---|
| [`asp-dapp`](asp-dapp) | Dispenser UI: Get ticket, Claim, World verify, WalletConnect pay (Reown AppKit + wagmi), NFT release API |
| [`asp-gateway`](asp-gateway) | Petitions, PoH gate, kiosk USDC verify, x402 hire, MQTT dispatch |
| [`asp-nft`](asp-nft) | `AspDrop.sol`: ERC-721 limited run, art rendered on-chain, one edition per paid claim |
| [`asp-devices`](asp-devices) | XIAO ESP32-C5 firmware, one stepper turn per authorized action |
| [`x402-examples`](x402-examples) | Monad x402 facilitator (pays gas to settle EIP-3009 USDC) plus buyer/seller samples |

---

## Demo surfaces

| Route | Flow |
|---|---|
| `/` **Get** | World Proof of Humanity → `WIN-…` ticket |
| `/claim` **Claim** | Ticket → same human → phone wallet pays USDC → the gachapon motor turns once |
| `/test`, `/test/claim` **NFT drop** | Same Get → Claim, but the payer receives one `AspDrop` edition on Monad instead of a motor turn |
| `/v1` **Backup** | World → phone wallet pay → item (no pre-issued ticket) |
| `/kiosk` **Pay lab** | WalletConnect pay only: no World, never runs the motor |
| `/chat` **Agent** | Agent discovers skills and hires over x402 (PoH-locked skills still need a human) |

<div align="center">
  <img src="images/shot-ticket.png" alt="Get ticket" width="90%"/>
</div>
<div align="center"><i>Get: prove you're human, the dispenser holds one item for you</i></div>

<br/>

<div align="center">
  <img src="images/shot-claim.png" alt="Claim" width="90%"/>
</div>
<div align="center"><i>Claim: same human, pay USDC on Monad, one item comes out</i></div>

<br/>

<div align="center">
  <img src="images/shot-nft.png" alt="NFT drop" width="90%"/>
</div>
<div align="center"><i>NFT drop: the shelf is the on-chain run, editions come out in order</i></div>

---

## The capsules

Ten colorways, twenty editions. The SVG is rendered by the contract itself (`tokenURI` → base64 JSON → base64 SVG), so there's no IPFS or server to go down.

<div align="center">
  <img src="images/capsules/capsule-01-monad-violet.png" width="18%"/>
  <img src="images/capsules/capsule-02-sakura.png" width="18%"/>
  <img src="images/capsules/capsule-03-metro-red.png" width="18%"/>
  <img src="images/capsules/capsule-04-matcha.png" width="18%"/>
  <img src="images/capsules/capsule-05-harbor-blue.png" width="18%"/>
  <br/>
  <img src="images/capsules/capsule-06-gold-leaf.png" width="18%"/>
  <img src="images/capsules/capsule-07-ice.png" width="18%"/>
  <img src="images/capsules/capsule-08-sunset.png" width="18%"/>
  <img src="images/capsules/capsule-09-chrome.png" width="18%"/>
  <img src="images/capsules/capsule-10-volt.png" width="18%"/>
</div>

---

<a id="world"></a>

# Rail 1: World (IDKit)

### Why World is essential

Without World, any hot wallet can claim and fair access to a scarce drop is gone.

World is the **zk credential that ties ticket → claim → same human**:

- enroll (ticket) binds a nullifier to `WIN-…`
- claim re-verifies against World's portal; the nullifier must match
- deny / cancel / fail ⇒ **no pay, no release** (fail-closed)

### End-to-end World flow

```mermaid
sequenceDiagram
  autonumber
  actor H as Human
  participant UI as asp-dapp
  participant IDKit as World IDKit
  participant API as dapp /api/world/*
  participant Portal as World /api/v4/verify
  participant GW as asp-gateway

  Note over H,GW: A · Get ticket (/)
  H->>UI: Confirm with World ID
  UI->>API: POST /api/world/rp-signature
  API-->>UI: RP signature
  UI->>IDKit: Selfie / uniqueness
  IDKit-->>UI: proof
  UI->>API: POST /api/world/enroll
  API->>Portal: verify(app_id|rp_id)
  Portal-->>API: success + nullifier
  API->>GW: POST /asp/winners/register (preverified)
  GW-->>UI: ticket WIN-…
  UI-->>H: show ticket

  Note over H,GW: B · Claim confirm (/claim)
  H->>UI: enter ticket + Start claim
  UI->>GW: POST /asp/petition → pending_human
  UI->>IDKit: same enroll action, signal=petition_id
  IDKit-->>UI: proof
  UI->>API: POST /api/world/poh-verify
  API->>Portal: verify
  Portal-->>API: nullifier
  API->>GW: POST /asp/proof-of-human/authorize-preverified
  GW-->>UI: petition authorized (or deny)
```

### Deny paths

| Error | Effect |
|---|---|
| `world-verify-failed` | Portal reject → no authorize |
| `nullifier-mismatch` | Different human than signup → no pay |
| `already-claimed` / `claim-already-used` | Entitlement burned → motor idle, no NFT |
| `signal-mismatch` | Proof not bound to this petition |
| cancelled / expired IDKit | Protected action never starts |

### World file map

| File | Role |
|---|---|
| [`asp-dapp/src/features/world/WorldVerifyModal.tsx`](asp-dapp/src/features/world/WorldVerifyModal.tsx) | IDKit Selfie UI + RP signature |
| [`asp-dapp/src/app/api/world/rp-signature+api.ts`](asp-dapp/src/app/api/world/rp-signature+api.ts) | Server-only RP sign |
| [`asp-dapp/src/app/api/world/enroll+api.ts`](asp-dapp/src/app/api/world/enroll+api.ts) | Signup verify → register winner |
| [`asp-dapp/src/app/api/world/poh-verify+api.ts`](asp-dapp/src/app/api/world/poh-verify+api.ts) | Claim verify → authorize-preverified |
| [`asp-gateway/src/services/policy/pohVerify.js`](asp-gateway/src/services/policy/pohVerify.js) | Fail-closed portal verify |
| [`asp-gateway/src/services/policy/winners.js`](asp-gateway/src/services/policy/winners.js) | Ticket ↔ nullifier registry |
| [`asp-gateway/src/services/policy/store.js`](asp-gateway/src/services/policy/store.js) | Petition `pending_human` → `authorized` |
| [`asp-gateway/src/services/policy/routes.js`](asp-gateway/src/services/policy/routes.js) | `/asp/winners/*`, `/asp/proof-of-human/*` |

---

<a id="monad"></a>

# Rail 2: Monad (payments + drop)

### Why Monad

Asp is a machine economy. Settlement has to live on a chain the booth can actually wait on, not a `paid=true` checkbox. Monad blocks land fast enough that the person standing at the machine doesn't notice the wait, and gas is cheap enough to mint a collectible per claim.

Two doors into the same gateway, both USDC on Monad (chain `143`):

| Door | Who | How |
|---|---|---|
| **x402 hire** | Agents / apps | `POST /asp/hire` → 402 challenge → signed EIP-3009 authorization → facilitator settles → skill runs |
| **WalletConnect pay** | Human at the booth | Reown AppKit QR → phone wallet sends a tagged USDC transfer → gateway verifies the receipt → motor or NFT |

The same policy gate applies to both: if the skill is PoH-locked, World has to authorize first.  
*This* capsule is locked, so the live demo is **a human paying from a phone wallet on Monad**. x402 stays on as the way machines get hired when the skill allows it. It does **not** settle the kiosk payment.

### Deployed on Monad mainnet

| What | Address |
|---|---|
| `AspDrop` (ERC-721, "Asp Metropolis Capsule", `ASPCAP`) | [`0x942c1a378b961fb7a95b83ecaf55fecee42c6187`](https://monadvision.com/address/0x942c1a378b961fb7a95b83ecaf55fecee42c6187) |
| USDC (Circle, 6 decimals, EIP-3009) | [`0x754704Bc059F8C67012fEd69BC8A327a5aafb603`](https://monadvision.com/address/0x754704Bc059F8C67012fEd69BC8A327a5aafb603) |
| Price per claim | `0.002 USDC` (`2000` base units) |

### Kiosk pay → release

```mermaid
sequenceDiagram
  autonumber
  actor H as Human phone
  participant PC as asp-dapp /claim
  participant API as dapp /api/kiosk/*
  participant GW as asp-gateway
  participant M as Monad RPC
  participant MQTT as MQTT broker
  participant HW as XIAO ESP32-C5

  Note over PC,GW: Petition already authorized by World
  PC->>API: POST /api/kiosk/checkout-intent
  API->>GW: POST /asp/kiosk/intent
  GW-->>PC: nonce + {to: USDC, data: transfer(receiver, amount) ‖ nonce tag}
  PC-->>H: WalletConnect QR (Reown AppKit)
  H->>M: send USDC transfer from phone wallet
  PC->>API: POST /api/kiosk/submit-tx {nonce, txHash}
  API->>GW: POST /asp/kiosk/intent/:nonce/tx
  GW->>M: receipt + Transfer log + calldata tag
  loop poll until paid
    PC->>API: GET /api/kiosk/status?nonce=
  end
  PC->>API: POST /api/kiosk/complete
  API->>GW: POST /asp/kiosk/dispense
  GW->>GW: re-verify payment + assertHireAllowed
  GW->>MQTT: asp/passive/{id}/action
  MQTT->>HW: DISPENSE_ONCE
  HW-->>GW: receipt
  GW-->>PC: ok + tx hash
```

On `/test/claim` the last leg swaps the motor for the chain: the dapp calls `POST /api/nft/drop` → gateway `POST /asp/kiosk/settle` (same checks, same ticket burn) → `AspDrop.release(payer, keccak256("asp-drop:" + nonce))`. `tokenOfClaim` makes it one edition per paid nonce on-chain, so retries return the same token.

### What "paid" means

`verifyUsdcPayment` in [`monadPayment.js`](asp-gateway/src/services/kiosk/monadPayment.js) only says yes when **all** of these hold:

- the tx receipt succeeded and the tx called the configured USDC contract
- the calldata ends with this intent's nonce tag (`keccak256("asp-kiosk:" + nonce)`, 16 bytes)
- a `Transfer` log moves **exactly** the quoted amount to the gateway receiver
- the block is newer than the intent
- the tx hash was never used by another intent (replay guard)

Anything else stays unpaid, and the motor never hears about it.

### Monad deny paths

| Signal | Meaning |
|---|---|
| `payment-not-found` | Tx not mined yet, keep polling |
| `payment-tx-replayed` (409) | Same tx hash already paid another intent |
| `pending-human` | Tried to pay before World authorize |
| `assertHireAllowed` fail | Scope / expiry / claim already used |
| `wrong-release-path` (409) | A motor payment can't mint, and an NFT payment can't spin |
| `sold-out` (410) | Every `AspDrop` edition is gone |
| `esp32-no-receipt` (504) | Motor path timed out |
| `lab-intent-no-dispense` | Lab pay never runs the motor |

### Monad file map

| File | Role |
|---|---|
| [`asp-gateway/src/services/kiosk/monadPayment.js`](asp-gateway/src/services/kiosk/monadPayment.js) | Build tagged USDC transfer, fail-closed verify |
| [`asp-gateway/src/services/kiosk/routes.js`](asp-gateway/src/services/kiosk/routes.js) | `/asp/kiosk/intent`, `/intent/:nonce/tx`, `/dispense`, `/settle` |
| [`asp-gateway/src/services/monad/chain.js`](asp-gateway/src/services/monad/chain.js) | Chain, RPC fallbacks, USDC address |
| [`asp-gateway/src/services/x402/routes.js`](asp-gateway/src/services/x402/routes.js) | `/asp/hire` on the `@x402/evm` exact scheme |
| [`asp-nft/contracts/AspDrop.sol`](asp-nft/contracts/AspDrop.sol) | Limited run, `release` once per claim id, on-chain SVG |
| [`asp-dapp/src/features/nft/nftServer.ts`](asp-dapp/src/features/nft/nftServer.ts) | Server-only release: gateway settle → `AspDrop.release` |
| [`asp-dapp/src/features/wallet/`](asp-dapp/src/features/wallet) | Reown AppKit, wagmi, `useWalletPay`, `useX402Fetch` |
| [`asp-dapp/src/features/control/useCheckoutFlow.ts`](asp-dapp/src/features/control/useCheckoutFlow.ts) | Claim state machine |
| [`x402-examples/Facilitator/index.mjs`](x402-examples/Facilitator/index.mjs) | Monad x402 facilitator |

---

## Combined product loop

```mermaid
stateDiagram-v2
  [*] --> GetTicket: World PoH
  GetTicket --> HasTicket: WIN-…
  HasTicket --> Petition: enter ticket at kiosk
  Petition --> PendingHuman: skill requires PoH
  PendingHuman --> Authorized: World confirm + nullifier match
  PendingHuman --> Denied: mismatch / cancel / fail
  Authorized --> WaitingPay: WalletConnect pay shown
  WaitingPay --> WaitingPay: verify USDC transfer
  WaitingPay --> Releasing: assertHireAllowed + burn ticket
  Releasing --> Done: MQTT receipt / AspDrop.release
  Releasing --> FailDevice: timeout
  Denied --> [*]
  Done --> [*]: claim burned
  FailDevice --> [*]
```

**A second claim with the same entitlement has to fail.** That's the product.

---

## Quick start

```bash
# UI
cd asp-dapp && cp .env.example .env    # Reown project id, gateway URL, World ids, AspDrop address
npm install && npx expo start --web --port 8087
# → http://localhost:8087   /claim   /test/claim   /v1   /kiosk

# Gateway (separate terminal)
cd asp-gateway && cp .env.example .env   # EVM receiver address, MQTT, facilitator URL. Never commit it.
npm install && npm start

# x402 facilitator (only needed for /asp/hire)
cd x402-examples && npm install && npm run facilitator

# AspDrop (optional: your own run)
cd asp-nft && npm install && npm run wallet && npm run compile && npm run deploy && npm run mint
```

Env templates: [`asp-dapp/.env.example`](asp-dapp/.env.example), [`asp-gateway/.env.example`](asp-gateway/.env.example), [`asp-nft/.env.example`](asp-nft/.env.example), [`x402-examples/Facilitator/.env.example`](x402-examples/Facilitator/.env.example).  
Booth steps: [`SIMULATOR.md`](./SIMULATOR.md). Machine hire / x402 contract: [`AGENT.md`](./AGENT.md). Firmware: [`asp-devices/README.md`](asp-devices/README.md).

---

<div align="center">
  <sub>World · Monad · AntiScalper Protocol · built for Monad Metropolis 2026</sub>
</div>
