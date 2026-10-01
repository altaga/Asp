import "dotenv/config";
import { x402Client, x402HTTPClient } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

// Agent-side buyer: hits a paid route, signs the USDC authorization, replays with proof.
const CHAIN_ID = Number(process.env.MONAD_CHAIN_ID || 143);
const NETWORK = `eip155:${CHAIN_ID}`;
const TARGET_URL = process.env.TARGET_URL || "http://localhost:4021/premium-data";

const privateKey = (process.env.BUYER_PRIVATE_KEY || "").trim();
if (!/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
  console.error("BUYER_PRIVATE_KEY must be a 0x-prefixed 32-byte hex key.");
  process.exit(1);
}
const account = privateKeyToAccount(privateKey);
console.log(`Buyer: ${account.address}`);

const core = new x402Client().register(NETWORK, new ExactEvmScheme(account));
const client = new x402HTTPClient(core);

async function run() {
  console.log(`GET ${TARGET_URL}`);
  const initial = await fetch(TARGET_URL);
  if (initial.status !== 402) {
    console.log("Resource was free:", await initial.text());
    return;
  }

  const paymentRequired = client.getPaymentRequiredResponse(
    (name) => initial.headers.get(name),
    await initial.json().catch(() => undefined)
  );
  const req0 = paymentRequired.accepts[0];
  console.log(`Paying ${req0.amount} of ${req0.asset} on ${req0.network}`);

  const paymentPayload = await client.createPaymentPayload(paymentRequired);
  const paid = await fetch(TARGET_URL, {
    headers: client.encodePaymentSignatureHeader(paymentPayload),
  });
  const settlement = client.getPaymentSettleResponse((name) => paid.headers.get(name));

  if (paid.ok) {
    console.log("OK:", await paid.json());
    console.log("Settled tx:", settlement?.transaction);
  } else {
    console.error("Rejected:", paid.status, await paid.text());
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
