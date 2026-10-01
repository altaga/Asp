import "dotenv/config";
import express from "express";
import cors from "cors";
import { x402Facilitator } from "@x402/core/facilitator";
import { ExactEvmScheme } from "@x402/evm/exact/facilitator";
import { toFacilitatorEvmSigner } from "@x402/evm";
import { createWalletClient, defineChain, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";

// Asp facilitator on Monad: verifies EIP-3009 USDC authorizations and submits them,
// paying MON gas so buyers only ever hold USDC.
const CHAIN_ID = Number(process.env.MONAD_CHAIN_ID || 143);
const RPC_URL =
  process.env.MONAD_RPC_URL || (CHAIN_ID === 143 ? "https://rpc.monad.xyz" : "https://testnet-rpc.monad.xyz");
const PORT = Number(process.env.FACILITATOR_PORT || 8095);
const NETWORK = `eip155:${CHAIN_ID}`;

const privateKey = (process.env.FACILITATOR_PRIVATE_KEY || "").trim();
if (!/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
  console.error("FACILITATOR_PRIVATE_KEY must be a 0x-prefixed 32-byte hex key.");
  process.exit(1);
}

const chain = defineChain({
  id: CHAIN_ID,
  name: CHAIN_ID === 143 ? "Monad" : "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
});

const account = privateKeyToAccount(privateKey);
const client = createWalletClient({ account, chain, transport: http(RPC_URL) }).extend(publicActions);
const signer = toFacilitatorEvmSigner(Object.assign(client, { address: account.address }), {
  confirmationTimeoutMs: 60_000,
});

// The signer only talks to Monad, so advertise Monad only (the register helper also adds v1 chains).
const facilitator = new x402Facilitator().register(NETWORK, new ExactEvmScheme(signer));

const app = express();
app.use(cors());
app.use(express.json({ limit: "64kb" }));

app.get("/health", async (_req, res) => {
  try {
    const balance = await client.getBalance({ address: account.address });
    res.json({ ok: true, network: NETWORK, address: account.address, gasBalanceWei: balance.toString() });
  } catch (err) {
    res.status(502).json({ ok: false, network: NETWORK, address: account.address, error: err.message });
  }
});

app.get("/supported", (_req, res) => {
  res.json(facilitator.getSupported());
});

app.post("/verify", async (req, res) => {
  const { paymentPayload, paymentRequirements } = req.body || {};
  if (!paymentPayload || !paymentRequirements) {
    return res.status(400).json({ error: "paymentPayload and paymentRequirements are required" });
  }
  try {
    res.json(await facilitator.verify(paymentPayload, paymentRequirements));
  } catch (err) {
    console.error("[facilitator] verify failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/settle", async (req, res) => {
  const { paymentPayload, paymentRequirements } = req.body || {};
  if (!paymentPayload || !paymentRequirements) {
    return res.status(400).json({ error: "paymentPayload and paymentRequirements are required" });
  }
  try {
    const result = await facilitator.settle(paymentPayload, paymentRequirements);
    console.log(`[facilitator] settle success=${result.success} tx=${result.transaction || "-"}`);
    res.json(result);
  } catch (err) {
    console.error("[facilitator] settle failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Asp Monad facilitator on :${PORT}  network=${NETWORK}  gas wallet=${account.address}`);
});
