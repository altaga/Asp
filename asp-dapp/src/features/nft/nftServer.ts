/**
 * Server-only (Expo API routes). Holds the minter key — never import from client code.
 * The gateway decides whether a payment earns a drop; this module only hands out the NFT.
 */
import { createPublicClient, createWalletClient, getAddress, http, isAddress, keccak256, toHex, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { monad, monadTestnet } from 'viem/chains';
import { ASP_DROP_ABI } from './aspDropAbi';
import type { DropStock, NftDrop } from './nftTypes';

type DropError = Error & { status?: number; code?: string };

function dropError(status: number, code: string, message: string): DropError {
  const err = new Error(message) as DropError;
  err.status = status;
  err.code = code;
  return err;
}

function config() {
  const key = (process.env.NFT_MINTER_PRIVATE_KEY || '').trim();
  const contract = (process.env.EXPO_PUBLIC_ASP_DROP_ADDRESS || '').trim();
  if (!/^0x[0-9a-fA-F]{64}$/.test(key) || !isAddress(contract)) {
    throw dropError(503, 'nft-not-configured', 'The NFT drop contract is not set up yet.');
  }
  const chain = Number(process.env.EXPO_PUBLIC_MONAD_CHAIN_ID || 143) === monadTestnet.id ? monadTestnet : monad;
  const rpc = process.env.MONAD_RPC_URL || chain.rpcUrls.default.http[0];
  const account = privateKeyToAccount(key as Hex);
  return {
    chain,
    account,
    contract: getAddress(contract),
    publicClient: createPublicClient({ chain, transport: http(rpc) }),
    walletClient: createWalletClient({ chain, account, transport: http(rpc) }),
    explorer: chain.id === monadTestnet.id ? 'https://testnet.monadvision.com' : 'https://monadvision.com',
  };
}

function gatewayBase() {
  const raw = process.env.GATEWAY_URL || process.env.EXPO_PUBLIC_GATEWAY_URL || '';
  return String(raw).replace(/\/$/, '');
}

/** Gateway re-verifies the USDC transfer + World petition and burns the ticket (idempotent). */
async function settleOnGateway(nonce: string): Promise<{ payer: `0x${string}` }> {
  const res = await fetch(`${gatewayBase()}/asp/kiosk/settle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nonce }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.ok) {
    throw dropError(res.status || 502, data?.error || 'settle-failed', data?.detail || 'Gateway did not settle this payment.');
  }
  if (!isAddress(data.payer)) throw dropError(502, 'payer-missing', 'Gateway settled without a payer address.');
  return { payer: getAddress(data.payer) };
}

function decodeMetadata(uri: string): { name?: string; image?: string; attributes?: { trait_type: string; value: unknown }[] } {
  const prefix = 'data:application/json;base64,';
  if (!uri.startsWith(prefix)) return {};
  return JSON.parse(Buffer.from(uri.slice(prefix.length), 'base64').toString('utf8'));
}

async function describeToken(cfg: ReturnType<typeof config>, tokenId: bigint, mintTx: string | null, already: boolean): Promise<NftDrop> {
  const [uri, owner, max] = await Promise.all([
    cfg.publicClient.readContract({ address: cfg.contract, abi: ASP_DROP_ABI, functionName: 'tokenURI', args: [tokenId] }),
    cfg.publicClient.readContract({ address: cfg.contract, abi: ASP_DROP_ABI, functionName: 'ownerOf', args: [tokenId] }),
    cfg.publicClient.readContract({ address: cfg.contract, abi: ASP_DROP_ABI, functionName: 'maxSupply' }),
  ]);
  const meta = decodeMetadata(uri);
  const colorway = meta.attributes?.find((a) => a.trait_type === 'Colorway')?.value;
  return {
    tokenId: tokenId.toString(),
    edition: `${tokenId} / ${max}`,
    name: meta.name || `Asp Capsule #${tokenId}`,
    image: meta.image || '',
    colorway: typeof colorway === 'string' ? colorway : null,
    owner,
    contract: cfg.contract,
    mintTx,
    tokenUrl: `${cfg.explorer}/nft/${cfg.contract}/${tokenId}`,
    already,
  };
}

/** What the dispenser shows: run size and the edition that comes out next (`null` = sold out). */
export async function readDropStock(): Promise<DropStock> {
  const cfg = config();
  const read = (functionName: 'maxSupply' | 'remaining' | 'nextRelease') =>
    cfg.publicClient.readContract({ address: cfg.contract, abi: ASP_DROP_ABI, functionName });
  const [total, remaining, next] = await Promise.all([read('maxSupply'), read('remaining'), read('nextRelease')]);
  return { total: Number(total), remaining: Number(remaining), next: remaining > 0n ? Number(next) : null };
}

/** One drop per paid nonce, enforced on-chain by tokenOfClaim — retries return the same token. */
export async function releaseNftForPayment(nonce: string): Promise<NftDrop> {
  const cfg = config();
  const { payer } = await settleOnGateway(nonce);
  const claimId = keccak256(toHex(`asp-drop:${nonce}`));
  const claimed = () =>
    cfg.publicClient.readContract({ address: cfg.contract, abi: ASP_DROP_ABI, functionName: 'tokenOfClaim', args: [claimId] });

  const existing = await claimed();
  if (existing > 0n) return describeToken(cfg, existing, null, true);

  const remaining = await cfg.publicClient.readContract({ address: cfg.contract, abi: ASP_DROP_ABI, functionName: 'remaining' });
  if (remaining === 0n) throw dropError(410, 'sold-out', 'All limited editions are gone.');

  try {
    const { request } = await cfg.publicClient.simulateContract({
      account: cfg.account,
      address: cfg.contract,
      abi: ASP_DROP_ABI,
      functionName: 'release',
      args: [payer, claimId],
    });
    const hash = await cfg.walletClient.writeContract(request);
    const receipt = await cfg.publicClient.waitForTransactionReceipt({ hash, timeout: 30_000 });
    if (receipt.status !== 'success') throw dropError(502, 'release-reverted', 'The drop transaction reverted.');
    return describeToken(cfg, await claimed(), hash, false);
  } catch (e) {
    // A parallel request may have released it first — that still counts as this nonce's drop.
    const raced = await claimed().catch(() => 0n);
    if (raced > 0n) return describeToken(cfg, raced, null, true);
    throw e;
  }
}
