# Asp — AntiScalper Protocol

<div align="center">
  <img src="images/brand/asp-lockup.png" alt="Asp 限定自販機" width="45%"/>

**One human. One item. Settled on Monad.**  
Anti-scalping for limited drops: every claim is a USDC payment on Monad that only a real, verified person can make.

<sub>BUILT ON</sub>&nbsp;&nbsp;<a href="https://monad.xyz"><img src="images/monad/monad-logo.svg" alt="Monad" height="22" align="absmiddle"/></a>

[Live demo](https://altaga-asp.expo.app) · [AspDrop on MonadVision](https://monadvision.com/address/0x942c1a378b961fb7a95b83ecaf55fecee42c6187) · [NFT drop](https://altaga-asp.expo.app/test/claim) · [Technical walkthrough](./TECHNICAL.md)

</div>

---

## Metropolis submission

| | |
|---|---|
| Chain | **Monad mainnet** (`eip155:143`), Circle USDC |
| Track | **03 · Social, Attention & Culture**: ticketing and access that follow a *person*, not an email or a wallet |
| On Monad | Claim payments verified on-chain · [`AspDrop`](https://monadvision.com/address/0x942c1a378b961fb7a95b83ecaf55fecee42c6187) ERC-721 with on-chain art · x402 agent payments with our own Monad facilitator |
| First use case | Limited merch at live events: a pop-up drop where each verified fan gets one allocation, not one per wallet |
| Identity | World ID (Proof of Human), so only real people reach the Monad payment |
| Demo | A physical capsule machine (XIAO ESP32-C5) and an on-chain NFT drop, both released only after Monad confirms the payment |
| Live | [altaga-asp.expo.app](https://altaga-asp.expo.app) |

Built inside the [Metropolis](https://monad.xyz/developers/hackathons/metropolis) window: the repo starts on 30 Sep 2026.

---

## Built on Monad

<div align="center">
  <img src="images/monad/monad-logo.svg" alt="Monad" height="40"/>
  <br/><br/>
  <img src="images/fair-drop.svg" alt="The scalper's extra wallets stop at World ID; the scalper and the fan each pay on Monad and get one allocation; the rest stays available" width="100%"/>
</div>

Monad is the source of truth in Asp. Nothing is released, whether a physical item, an NFT or an access pass, until the chain says the money arrived.

```mermaid
flowchart LR
  Pay["Phone wallet<br/>USDC transfer"]:::monad --> Chain[("Monad mainnet")]:::monad
  Agent["Agent<br/>x402 authorization"]:::monad --> Chain
  Chain -->|receipt verified| GW[asp-gateway]
  GW -->|release once| Item["Physical item<br/>(demo: capsule machine)"]
  GW -->|"release()"| Drop["AspDrop<br/>on Monad"]:::monad
  classDef monad fill:#836EF9,stroke:#5B45D6,color:#fff
```

### <img src="images/monad/monad-mark.svg" height="20"/> 1 · Every claim is a USDC payment on Monad

The person pays from their own phone wallet over WalletConnect. The transfer carries a tag unique to that claim, and the gateway reads the receipt straight from Monad before doing anything. Every check has to pass:

```mermaid
flowchart LR
  Tx["tx hash from<br/>the phone"] --> A{"called Circle USDC<br/>and succeeded?"}
  A -->|yes| B{"calldata ends with<br/>this claim's nonce tag?"}
  B -->|yes| C{"Transfer log: exact price<br/>to the receiver?"}
  C -->|yes| D{"newer than the claim,<br/>tx hash never used?"}
  D -->|yes| Paid["PAID<br/>release once"]:::monad
  A -->|no| No["stays unpaid,<br/>nothing moves"]:::deny
  B -->|no| No
  C -->|no| No
  D -->|no| No
  classDef monad fill:#836EF9,stroke:#5B45D6,color:#fff
  classDef deny fill:#E8112D,stroke:#B00D22,color:#fff
```

The nonce tag is `keccak256("asp-kiosk:" + nonce)`, appended to a normal `transfer` call, so any wallet can pay it. There's no `paid=true` checkbox and no payment processor. If Monad doesn't show it, nothing happens.

### <img src="images/monad/monad-mark.svg" height="20"/> 2 · The drop lives on Monad

Digital limited items go through the same flow. [`AspDrop`](https://monadvision.com/address/0x942c1a378b961fb7a95b83ecaf55fecee42c6187) is the demo's ERC-721 collection on Monad mainnet. The art is generated **by the contract** (`tokenURI` → base64 JSON → base64 SVG), so there's no IPFS and no server to go down.

The owner pre-mints editions into the contract (`mintEditions`), and each paid claim gets the next one through `release(payer, claimId)`. The contract enforces **one release per claim id**. Deciding *who* is eligible stays with the gateway (World + payment checks); the contract never sees a person.

```mermaid
flowchart LR
  Paid["Claim paid<br/>on Monad"]:::monad --> R["AspDrop.release(payer,<br/>keccak256('asp-drop:' + nonce))"]:::monad
  R --> Q{"claim id<br/>already released?"}
  Q -->|no| Give["transfer the next<br/>pre-minted edition"]:::monad
  Q -->|yes| Rev["revert AlreadyReleased<br/>(server returns the existing token)"]
  Give --> Art["tokenURI → SVG<br/>drawn on-chain"]:::monad
  classDef monad fill:#836EF9,stroke:#5B45D6,color:#fff
```

The run is configured for **20 editions**. `maxSupply` is owner-adjustable (it can't go below what's already minted), so the scarcity is a published setting you can watch on-chain through `MaxSupplyChanged`, not an immutable constant.

### <img src="images/monad/monad-mark.svg" height="20"/> 3 · Agents pay on Monad too

Machines and services on Asp can be hired per call over **x402**, settled in USDC on Monad through our own facilitator. The agent signs, the facilitator pays the gas, and the skill runs only after settlement.

```mermaid
flowchart LR
  A["Agent"] -->|POST /asp/hire| GW[asp-gateway]
  GW -->|402 + price| A
  A -->|"retry with signed<br/>EIP-3009 authorization"| GW
  GW -->|settle first| F["Asp facilitator"]
  F -->|"transferWithAuthorization"| M[("USDC on Monad")]:::monad
  M -->|settled| GW
  GW -->|skill runs once| Done["receipt + tx hash"]
  classDef monad fill:#836EF9,stroke:#5B45D6,color:#fff
```

[How World fits into agent hires](#agents-hire-over-x402-call-the-human-when-it-matters).

### Why Monad

| | Why it matters for a drop |
|---|---|
| **Sub-second blocks** | Drops sell out in seconds and someone is standing at the counter. The payment confirms before they look up from the phone. |
| **Cheap gas** | Verifying every claim on-chain, and releasing a collectible per claim, only makes sense when it costs fractions of a cent. |
| **Full EVM** | Circle USDC with EIP-3009, solc, viem, wagmi, Reown AppKit and x402's EVM scheme all work unchanged. |

| On Monad mainnet | Address |
|---|---|
| `AspDrop` (`ASPCAP`) | [`0x942c1a378b961fb7a95b83ecaf55fecee42c6187`](https://monadvision.com/address/0x942c1a378b961fb7a95b83ecaf55fecee42c6187) |
| USDC (Circle) | [`0x754704Bc059F8C67012fEd69BC8A327a5aafb603`](https://monadvision.com/address/0x754704Bc059F8C67012fEd69BC8A327a5aafb603) |
| Price per claim | `0.002 USDC` (`2000` base units) |

---

## The problem

<div align="center">
  <img src="images/problem.svg" alt="One scalper with many wallets takes the whole limited drop; the real fan sees SOLD OUT" width="100%"/>
</div>

Sneakers, concert tickets, consoles, collectible figures, art toys: every **limited** drop ends the same way. It sells out in seconds to bots, farmed accounts and resellers, the real fan sees *SOLD OUT*, and an hour later the item is on resale at 10x.

Drops are gated by things that are cheap to fake: an email, an account, a wallet, a queue position. A payment on its own tells you someone *paid*. It doesn't tell you:

| Question | Why a payment alone fails |
|---|---|
| **Who** paid? | A hot wallet is not a person. One scalper can hold a thousand. |
| Is it the person the ticket was **issued** to? | Tickets get resold the moment they exist. |
| Did they **already** claim? | A second wallet, a second account or a retry looks like a new buyer. |

So Asp puts **World** in front of the Monad payment. Your ticket is bound to a zk nullifier: a number unique to you for this drop, without revealing who you are. At claim time you prove again, and only if the nullifier matches do you get to pay.

That gives two precise promises:

- **One allocation per person per release.** You can pay from any wallet you like; switching wallets doesn't give you a second one.
- **A ticket can only be claimed by the person it was issued to.** Selling or sharing the ticket is useless.

What it doesn't promise: someone who claims an item can still resell it afterwards. Asp removes the bot rush and ticket flipping; it doesn't police the second-hand market.

```text
Get      World selfie → ticket WIN-… bound to your nullifier
Claim    Same human, same nullifier, or the claim is refused
Pay      Any wallet, over WalletConnect → tagged USDC transfer on Monad
Release  Monad confirms → one item out for this person. Never twice.
```

**The demo** uses a capsule machine because it's small enough to bring to a booth: a real XIAO ESP32-C5 machine that turns once per paid claim, plus an on-chain NFT version of the same drop. The gateway doesn't care what the item is. The first place we'd ship it is **limited merch at live events**, the pop-up stand that sells out to resellers before the show starts. The same flow can release a sneaker pickup or a console reservation.

---

## Demo walkthrough

<table>
  <tr>
    <td width="33%"><img src="images/shot-ticket.png" alt="Get ticket"/></td>
    <td width="33%"><img src="images/shot-claim.png" alt="Claim"/></td>
    <td width="33%"><img src="images/shot-nft.png" alt="NFT drop"/></td>
  </tr>
  <tr>
    <td><b>1 · Get</b><br/>Prove you're human with a World selfie and get a <code>WIN-…</code> ticket bound to you. One ticket per person, and the ticket doesn't reserve stock.</td>
    <td><b>2 · Claim</b><br/>Enter the ticket, prove again (same nullifier), scan the WalletConnect QR and pay 0.002 USDC on Monad from your phone.</td>
    <td><b>3 · Release</b><br/>The gateway confirms the transfer on Monad, then the demo machine releases one item, or one <code>AspDrop</code> edition lands in your wallet.</td>
  </tr>
</table>

| Route | What you see |
|---|---|
| [`/`](https://altaga-asp.expo.app) → [`/claim`](https://altaga-asp.expo.app/claim) | Physical machine: get a ticket, claim it, pay on Monad, the motor turns once |
| [`/test`](https://altaga-asp.expo.app/test) → [`/test/claim`](https://altaga-asp.expo.app/test/claim) | NFT only, no hardware: same flow, and an `AspDrop` edition goes to the wallet that paid |

Try to break it: claim the same ticket twice, or bring a ticket that was issued to someone else. Both are refused. Paying from a second wallet doesn't help either, since the allocation follows the person, not the wallet.

---

## What makes it hold

**A claim only goes through when every check passes.** If any one fails, nothing is released. Each promise has exactly one component that enforces it:

| Promise | Enforced by | How |
|---|---|---|
| The proof is real | World portal, called server-side | `/api/v4/verify`, fail-closed: no verify, no petition |
| One allocation per person per release | Gateway | Claim register keyed by `release_id + nullifier`, marked used on release |
| A ticket only works for its owner | Gateway | Nullifier at claim must equal the nullifier the ticket was issued to |
| Paid the exact price, for this claim | Gateway, reading Monad | USDC `Transfer` of the exact amount to the receiver, in a tx tagged with this claim's nonce |
| One payment, one release | Gateway | Spent-tx ledger: a tx hash can only ever pay one claim |
| One NFT per paid claim | `AspDrop` contract | `tokenOfClaim`: a second `release` for the same claim id reverts |

The gateway keeps the claim register, tickets and spent tx hashes in a ledger on disk, so a restart can't reopen a claim. The demo reset is an operator-only route behind a token; there's no reset button in the public app.

**What Asp doesn't do (yet):** tickets are issued to every verified person and claims are first come, first served while stock lasts. There's no lottery, and a ticket doesn't reserve an item.

Every deny path, with error codes: [TECHNICAL.md](./TECHNICAL.md).

---

## How it fits together

```mermaid
flowchart LR
  H(("Human")):::person -->|"1. prove"| W["World ID"]:::world
  W -->|"2. ticket bound<br/>to nullifier"| GW["asp-gateway<br/>one human, one item"]
  H -->|"3. pay USDC<br/>WalletConnect"| M[("Monad<br/>mainnet")]:::monad
  A(("Agent")):::person -->|"x402 hire"| M
  M -->|"4. payment<br/>verified on-chain"| GW
  GW -->|"5. release once"| I["Limited item<br/>machine · NFT · access"]:::item

  classDef monad fill:#836EF9,stroke:#5B45D6,color:#fff
  classDef world fill:#231815,stroke:#888,color:#fff
  classDef person fill:#FFF8EF,stroke:#E8112D,color:#231815
  classDef item fill:#E8112D,stroke:#B00D22,color:#fff
```

| Package | Job |
|---|---|
| [`asp-gateway`](asp-gateway) | Reads USDC transfers from Monad, PoH gate, ticket ↔ nullifier registry, x402 hire, MQTT dispatch |
| [`asp-nft`](asp-nft) | `AspDrop.sol`: ERC-721 limited run on Monad with on-chain SVG |
| [`asp-dapp`](asp-dapp) | Dispenser UI (Expo web), World verify, WalletConnect pay on Monad (Reown AppKit + wagmi), NFT release |
| [`x402-examples`](x402-examples) | Monad x402 facilitator for agent hires |
| [`asp-devices`](asp-devices) | XIAO ESP32-C5 firmware for the demo machine: waits for one release from the gateway |

---

## The demo collection

For the booth we made a small drop of capsule art toys: ten colorways, twenty editions, all drawn by the contract on Monad.

<div align="center">
  <img src="images/capsules/capsule-01-monad-violet.png" width="9%"/>
  <img src="images/capsules/capsule-02-sakura.png" width="9%"/>
  <img src="images/capsules/capsule-03-metro-red.png" width="9%"/>
  <img src="images/capsules/capsule-04-matcha.png" width="9%"/>
  <img src="images/capsules/capsule-05-harbor-blue.png" width="9%"/>
  <img src="images/capsules/capsule-06-gold-leaf.png" width="9%"/>
  <img src="images/capsules/capsule-07-ice.png" width="9%"/>
  <img src="images/capsules/capsule-08-sunset.png" width="9%"/>
  <img src="images/capsules/capsule-09-chrome.png" width="9%"/>
  <img src="images/capsules/capsule-10-volt.png" width="9%"/>
</div>

---

## Agents: hire over x402, call the human when it matters

The booth is one machine. Behind it, the gateway is a marketplace where **agents hire agents, services and devices**, paying per call in USDC on Monad over [x402](https://x402.org): `POST /asp/hire` answers `402`, the agent signs a USDC authorization, and our Monad facilitator settles it. No accounts, no API keys.

Most skills just run. Some shouldn't run on an agent's word alone, like claiming a drop, moving hardware or spending on someone's behalf. Those skills are marked `proof_of_human.required`, and for them **World is the door that says "human needed"**:

```mermaid
sequenceDiagram
  autonumber
  actor A as Agent
  participant GW as asp-gateway
  actor H as Human
  participant W as World
  participant M as Monad

  A->>GW: POST /asp/hire (skill needs a human)
  GW-->>A: 403 human-proof-required + how to open a petition
  A->>GW: POST /asp/petition
  GW-->>A: petition_id (pending_human)
  A->>H: "I need you to approve this"
  H->>W: World selfie, signal = petition_id
  W-->>GW: verified, nullifier
  GW->>GW: petition authorized
  A->>GW: POST /asp/hire + petition_id
  GW-->>A: 402 price
  A->>M: signed USDC authorization (x402)
  M-->>GW: settled
  GW-->>A: skill runs once, receipt
```

The agent does the work, but it can't skip the person. The World proof is bound to that exact petition, so the human knows what they're approving, and the approval works only once. It's the same rule as the drop: **one human, one action**.

In the booth demo the human pays directly from their phone, so x402 isn't on that path. You can try the agent side in the app's `/chat` tab. Contract and samples: [AGENT.md](./AGENT.md), [`x402-examples`](x402-examples).

<div align="center"><sub>Monad · World · AntiScalper Protocol · Monad Metropolis 2026</sub></div>
