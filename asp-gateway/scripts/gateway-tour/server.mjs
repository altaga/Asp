// Gateway tour: a narrated, read-only walk through the live gateway and Monad.
// Runs the gateway's own verifyUsdcPayment against a real settled payment.
// No secrets: RPC URL paths are masked, nothing is signed or sent on-chain.
//
//   cd asp-gateway && node scripts/gateway-tour/server.mjs
//   (optional) MONAD_RPC_URL=https://monad-mainnet.g.alchemy.com/v2/<key> node scripts/gateway-tour/server.mjs
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const realFetch = globalThis.fetch;
const rpcLog = [];
let rpcSeq = 0;

function maskUrl(u) {
  try {
    const url = new URL(u);
    const masked = url.pathname.length > 1 ? url.pathname.replace(/\/[^/]{12,}$/, '/••••••••') : '';
    return `${url.host}${masked}`;
  } catch {
    return 'rpc';
  }
}

globalThis.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input.url;
  let methods = null;
  if (init?.body && typeof init.body === 'string' && init.body.includes('"jsonrpc"')) {
    const body = JSON.parse(init.body);
    methods = (Array.isArray(body) ? body : [body]).map((b) => b.method);
  }
  const t0 = performance.now();
  const res = await realFetch(input, init);
  if (methods) {
    for (const m of methods) {
      rpcLog.push({ seq: ++rpcSeq, method: m, host: maskUrl(url), ms: Math.round(performance.now() - t0) });
    }
  }
  return res;
};

const { verifyUsdcPayment, nonceTag } = await import('../../src/services/kiosk/monadPayment.js');
const { publicClient, MONAD_RPC_URLS, USDC_ADDRESS, MONAD_CHAIN_ID } = await import('../../src/services/monad/chain.js');
const { keccak256, toHex, parseAbi, formatUnits, parseEventLogs, erc20Abi } = await import('viem');

const GATEWAY = (process.env.TOUR_GATEWAY_URL || 'https://asp-gateway.hackathon.dpdns.org').replace(/\/$/, '');
const ASP_DROP = '0x942c1a378b961fb7a95b83ecaf55fecee42c6187';
// A real, already-settled kiosk payment (public on-chain data; the intent is consumed).
const PAID = {
  txHash: '0xd5598f8e8d06e0d8bb197d6faa85ff3acf1263d544ec4624657372bc856c3fd5',
  nonce: 'f1e9244d-5038-4f41-bd1b-407910fe2d71',
  amount: '2000',
  receiver: '0xdE100196AD1b3B5C7A2c0134764075294Eee99Af',
};
const DROP_ABI = parseAbi([
  'function tokenOfClaim(bytes32) view returns (uint256)',
  'function ownerOf(uint256) view returns (address)',
  'function remaining() view returns (uint256)',
  'function maxSupply() view returns (uint256)',
  'function name() view returns (string)',
]);
const REQUESTER = '0x0000000000000000000000000000000000000001';

async function gw(method, route, body) {
  const t0 = performance.now();
  const res = await realFetch(`${GATEWAY}${route}`, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* not json */ }
  return { status: res.status, ms: Math.round(performance.now() - t0), json, headers: res.headers };
}

const steps = {
  async health() {
    const r = await gw('GET', '/asp/health');
    return { request: 'GET /asp/health', status: r.status, ms: r.ms, body: r.json };
  },

  async skills() {
    const r = await gw('GET', '/asp/skills');
    const skills = (r.json?.skills || []).map((s) => ({
      machine: s.device_name,
      command: s.command.join(' '),
      price_usdc: formatUnits(BigInt(s.price), 6),
      world_human_required: Boolean(s.proof_of_human?.required),
    }));
    return { request: 'GET /asp/skills', status: r.status, ms: r.ms, body: skills };
  },

  async hireArm() {
    const body = { tx_id: `tour-${Date.now()}`, requester: REQUESTER, target_hardware_id: 'Sub_6503CAF9C2C7', command: ['HOME'] };
    const r = await gw('POST', '/asp/hire', body);
    const raw = r.headers.get('payment-required');
    const challenge = raw ? JSON.parse(Buffer.from(raw, 'base64').toString('utf8')) : null;
    const accept = challenge?.accepts?.[0] || {};
    return {
      request: 'POST /asp/hire  { Robotic Arm · HOME }',
      status: r.status,
      ms: r.ms,
      body: {
        'payment-required (x402 v2)': {
          scheme: accept.scheme,
          network: accept.network,
          asset: `${accept.asset} (USDC)`,
          amount: `${accept.amount} → ${formatUnits(BigInt(accept.amount || 0), 6)} USDC`,
          payTo: accept.payTo,
          paymentFlow: accept.extra?.paymentFlow,
        },
      },
    };
  },

  async hireGacha() {
    const body = { tx_id: `tour-${Date.now()}`, requester: REQUESTER, target_hardware_id: 'Sub_A7C440A00001', command: ['DISPENSE_ONCE'] };
    const r = await gw('POST', '/asp/hire', body);
    return { request: 'POST /asp/hire  { Event Gachapon · DISPENSE_ONCE }', status: r.status, ms: r.ms, body: r.json };
  },

  async receipt() {
    const [receipt, tx] = await Promise.all([
      publicClient.getTransactionReceipt({ hash: PAID.txHash }),
      publicClient.getTransaction({ hash: PAID.txHash }),
    ]);
    const transfer = parseEventLogs({ abi: erc20Abi, eventName: 'Transfer', logs: receipt.logs })[0];
    return {
      request: `eth_getTransactionReceipt + eth_getTransaction  ${PAID.txHash.slice(0, 10)}…`,
      body: {
        status: receipt.status,
        block: String(receipt.blockNumber),
        from: tx.from,
        to: `${tx.to} (USDC)`,
        'Transfer log': transfer && {
          from: transfer.args.from,
          to: transfer.args.to,
          value: `${transfer.args.value} → ${formatUnits(transfer.args.value, 6)} USDC`,
        },
        'calldata tail (16-byte tag)': `0x${tx.input.slice(-32)}`,
      },
    };
  },

  async verify() {
    const base = { txHash: PAID.txHash, token: USDC_ADDRESS, receiver: PAID.receiver };
    const real = await verifyUsdcPayment({ ...base, nonce: PAID.nonce, amount: PAID.amount });
    const forged = await verifyUsdcPayment({ ...base, nonce: 'someone-elses-claim', amount: PAID.amount });
    const short = await verifyUsdcPayment({ ...base, nonce: PAID.nonce, amount: '2001' });
    return {
      request: 'verifyUsdcPayment()  — gateway code, run against Monad',
      body: {
        'this claim': real.ok ? { ok: true, payer: real.payer, block: real.blockNumber } : real,
        'tag for this claim': nonceTag(PAID.nonce),
        'same tx, other claim': { ok: forged.ok, error: forged.error },
        'same tx, wrong amount': { ok: short.ok, error: short.error },
      },
    };
  },

  async release() {
    const claimId = keccak256(toHex(`asp-drop:${PAID.nonce}`));
    const read = (functionName, args = []) =>
      publicClient.readContract({ address: ASP_DROP, abi: DROP_ABI, functionName, args });
    const [name, tokenId, remaining, maxSupply] = await Promise.all([
      read('name'), read('tokenOfClaim', [claimId]), read('remaining'), read('maxSupply'),
    ]);
    const owner = tokenId > 0n ? await read('ownerOf', [tokenId]) : null;
    return {
      request: `AspDrop ${ASP_DROP.slice(0, 10)}…  eth_call`,
      body: {
        contract: name,
        claimId,
        'tokenOfClaim(claimId)': `#${tokenId}`,
        'ownerOf(token)': owner,
        'release(to, claimId) again': 'reverts AlreadyReleased()',
        stock: `${remaining} of ${maxSupply} left`,
      },
    };
  },

  async rpc() {
    const byMethod = {};
    for (const c of rpcLog) byMethod[c.method] = (byMethod[c.method] || 0) + 1;
    const avg = rpcLog.length ? Math.round(rpcLog.reduce((a, c) => a + c.ms, 0) / rpcLog.length) : 0;
    return {
      request: 'MONAD_RPC_URL — every chain read in this tour',
      body: {
        chainId: MONAD_CHAIN_ID,
        'transport (viem fallback)': MONAD_RPC_URLS.map((u, i) => `${i === 0 ? 'primary ' : 'fallback'} ${maskUrl(u)}`),
        calls: rpcLog.length,
        methods: byMethod,
        'avg latency': `${avg} ms`,
      },
    };
  },
};

const here = path.dirname(fileURLToPath(import.meta.url));
const page = readFileSync(path.join(here, 'tour.html'), 'utf8');
const PORT = Number(process.env.TOUR_PORT || 5077);

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(page);
  }
  if (url.pathname === '/rpc-log') {
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ calls: rpcLog.slice(-6), primary: maskUrl(MONAD_RPC_URLS[0]) }));
  }
  const step = url.pathname.startsWith('/step/') && steps[url.pathname.slice(6)];
  if (!step) {
    res.writeHead(404);
    return res.end();
  }
  try {
    const out = await step();
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(out, (_k, v) => (typeof v === 'bigint' ? String(v) : v)));
  } catch (err) {
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: String(err?.shortMessage || err?.message || err) }));
  }
}).listen(PORT, () => console.log(`gateway tour → http://localhost:${PORT}  (primary RPC ${maskUrl(MONAD_RPC_URLS[0])})`));
