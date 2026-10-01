/**
 * x402 hire smoke against a live Asp gateway on Monad — payment path only.
 * Defaults to the robotic arm HOME skill (no World gate). Never prints the key.
 */
import "dotenv/config";
import { x402Client, x402HTTPClient } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

const HIRE = process.env.ASP_HIRE_URL || "http://localhost:8086/asp/hire";
const CHAIN_ID = Number(process.env.MONAD_CHAIN_ID || 143);
const NETWORK = `eip155:${CHAIN_ID}`;

const privateKey = (process.env.BUYER_PRIVATE_KEY || "").trim();
if (!/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
  console.error("BUYER_PRIVATE_KEY must be a 0x-prefixed 32-byte hex key.");
  process.exit(1);
}
const account = privateKeyToAccount(privateKey);
const client = new x402HTTPClient(new x402Client().register(NETWORK, new ExactEvmScheme(account)));

const petition = {
  tx_id: `tx_smoke_${Date.now()}`,
  requester: account.address,
  target_hardware_id: process.env.ASP_TARGET || "Sub_6503CAF9C2C7",
  command: [process.env.ASP_COMMAND || "HOME"],
};

const post = (headers = {}) =>
  fetch(HIRE, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(petition),
  });

console.log("Buyer:", account.address);
console.log("POST", HIRE, JSON.stringify(petition));

const initial = await post();
console.log("Initial status:", initial.status);
if (initial.status !== 402) {
  console.error("Expected 402, got:", await initial.text());
  process.exit(1);
}

const paymentRequired = client.getPaymentRequiredResponse(
  (name) => initial.headers.get(name),
  await initial.json().catch(() => undefined)
);
const acc = paymentRequired.accepts[0];
console.log("Challenge:", { network: acc.network, amount: acc.amount, asset: acc.asset, payTo: acc.payTo });

const paymentPayload = await client.createPaymentPayload(paymentRequired);
const paid = await post(client.encodePaymentSignatureHeader(paymentPayload));
const settlement = client.getPaymentSettleResponse((name) => paid.headers.get(name));
const body = await paid.json().catch(() => ({}));

console.log("Paid status:", paid.status, "ok:", body.ok, "error:", body.error || "-");
const tx = settlement?.transaction || body.transaction;
if (tx) {
  console.log("Settled on Monad:", tx);
  console.log(`Explorer: https://monadvision.com/tx/${tx}`);
  process.exit(0);
}
console.error("No settlement hash — payment path failed");
console.error(JSON.stringify(body, null, 2).slice(0, 1500));
process.exit(1);
