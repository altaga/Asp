import "dotenv/config";
import express from "express";
import { HTTPFacilitatorClient, x402ResourceServer } from "@x402/core/server";
import { paymentMiddleware } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";

// Smallest possible x402 seller on Monad: one paid route, priced in USDC.
const CHAIN_ID = Number(process.env.MONAD_CHAIN_ID || 143);
const NETWORK = `eip155:${CHAIN_ID}`;
const SELLER_ADDRESS = (process.env.SELLER_ADDRESS || "").trim();
if (!/^0x[0-9a-fA-F]{40}$/.test(SELLER_ADDRESS)) {
  console.error("SELLER_ADDRESS must be a 0x-prefixed EVM address.");
  process.exit(1);
}

const facilitatorClient = new HTTPFacilitatorClient({
  url: process.env.FACILITATOR_URL || "http://localhost:8095",
});
const resourceServer = new x402ResourceServer(facilitatorClient).register(NETWORK, new ExactEvmScheme());

const routes = {
  "GET /premium-data": {
    accepts: { scheme: "exact", network: NETWORK, payTo: SELLER_ADDRESS, price: "$0.001" },
    description: "Premium data access",
    mimeType: "application/json",
  },
};

const app = express();
app.use(paymentMiddleware(routes, resourceServer));

app.get("/premium-data", (_req, res) => {
  res.json({ status: "success", data: "Here is the premium data requested." });
});

app.listen(4021, () => {
  console.log(`Seller on :4021  network=${NETWORK}  payTo=${SELLER_ADDRESS}`);
});
