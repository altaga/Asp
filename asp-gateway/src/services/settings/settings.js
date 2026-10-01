import 'dotenv/config';
import { readFileSync } from 'node:fs';

import { gatewayAuth } from '../mqtt/gatewayAuth.js';
import { gatewayWallet } from '../monad/wallet.js';
import { MONAD_CHAIN_ID, MONAD_NETWORK, MONAD_RPC_URLS, USDC_ADDRESS } from '../monad/chain.js';

function readJson(pathFromHere) {
  const url = new URL(pathFromHere, import.meta.url);
  const raw = readFileSync(url, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw);
}

const HTTP_HOST = process.env.ASP_GW_HOST || '0.0.0.0';
const HTTP_PORT = Number(process.env.ASP_GW_HTTP_PORT || 4790);
const FACILITATOR_URL = process.env.FACILITATOR_URL || 'https://facilitator.example.com';

const devicesRaw = readJson('../../../config/devices.json');

/** Device configs may say "USDC" or pin an address; either way skills price in Monad USDC. */
function resolveToken(token) {
  const raw = typeof token === 'string' ? token.trim() : '';
  if (!raw || raw.toUpperCase() === 'USDC') return USDC_ADDRESS;
  return raw;
}

const skills = [];
for (const dev of devicesRaw) {
  const token = resolveToken(dev.token);
  for (const cap of dev.capabilities) {
    skills.push({
      ...cap,
      type: dev.type,
      execution_model: dev.type === 'ACTIVE' ? 'AGENTIC' : 'DETERMINISTIC',
      target_hardware_id: dev.id,
      price: String(cap.price !== undefined ? cap.price : (dev.price || '')),
      token,
      asset: token,
      proof_of_human: cap.proof_of_human || null,
      device_name: dev.name,
      device_description: dev.description,
    });
  }
}

const devices = devicesRaw.map(dev => ({
  id: dev.id,
  domain: dev.type === 'ACTIVE' ? 'active' : 'passive',
  name: dev.name,
  description: dev.description,
  type: dev.type,
  capabilities: dev.capabilities
}));

export const settings = {
  http: { host: HTTP_HOST, port: HTTP_PORT },
  facilitator: { url: FACILITATOR_URL },
  mqtt: { brokerUrl: process.env.MQTT_BROKER_URL || '' },
  monad: {
    chainId: MONAD_CHAIN_ID,
    network: MONAD_NETWORK,
    rpcUrls: MONAD_RPC_URLS,
    usdc: USDC_ADDRESS,
    address: gatewayWallet.address,
  },
  gateway: { id: gatewayAuth.id, role: gatewayAuth.role, jwt: gatewayAuth.jwt },
  devices,
  skills,
};
