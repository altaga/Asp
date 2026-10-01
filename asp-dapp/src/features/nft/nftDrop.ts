import type { NftDrop } from './nftTypes';

type DropError = Error & { status?: number; code?: string };

/** Browser side: ask the dapp server to drop this payment's NFT (idempotent per nonce). */
export async function dropNft(nonce: string): Promise<NftDrop> {
  const res = await fetch('/api/nft/drop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nonce }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.ok || !data.nft) {
    const err = new Error(data?.detail || data?.error || `Drop failed (${res.status})`) as DropError;
    err.status = res.status;
    err.code = data?.error;
    throw err;
  }
  return data.nft as NftDrop;
}
