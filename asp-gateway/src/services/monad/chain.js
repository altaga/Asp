import 'dotenv/config';
import { createPublicClient, defineChain, fallback, getAddress, http } from 'viem';

const MAINNET_ID = 143;

export const MONAD_CHAIN_ID = Number(process.env.MONAD_CHAIN_ID || MAINNET_ID);
export const MONAD_NETWORK = `eip155:${MONAD_CHAIN_ID}`;

const DEFAULT_RPCS =
  MONAD_CHAIN_ID === MAINNET_ID
    ? ['https://rpc.monad.xyz', 'https://rpc1.monad.xyz']
    : ['https://testnet-rpc.monad.xyz'];

export const MONAD_RPC_URLS = [process.env.MONAD_RPC_URL, ...DEFAULT_RPCS]
  .map((u) => (u || '').trim())
  .filter((u, i, all) => u && all.indexOf(u) === i);

/** Circle native USDC (6 decimals). */
const DEFAULT_USDC =
  MONAD_CHAIN_ID === MAINNET_ID
    ? '0x754704Bc059F8C67012fEd69BC8A327a5aafb603'
    : '0x534b2f3A21130d7a60830c2Df862319e593943A3';

export const USDC_ADDRESS = getAddress((process.env.USDC_ADDRESS || DEFAULT_USDC).trim());

export const monadChain = defineChain({
  id: MONAD_CHAIN_ID,
  name: MONAD_CHAIN_ID === MAINNET_ID ? 'Monad' : 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: MONAD_RPC_URLS } },
  blockExplorers: { default: { name: 'MonadVision', url: 'https://monadvision.com' } },
});

export const publicClient = createPublicClient({
  chain: monadChain,
  transport: fallback(MONAD_RPC_URLS.map((url) => http(url, { timeout: 10_000 }))),
});

export function explorerTxUrl(hash) {
  return `${monadChain.blockExplorers.default.url}/tx/${hash}`;
}
