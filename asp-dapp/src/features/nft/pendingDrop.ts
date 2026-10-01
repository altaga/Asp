/** A paid-but-undelivered NFT drop, kept across reloads so the payer can retry for free. */
export type PendingDrop = {
  nonce: string;
  txHash: string | null;
  explorerUrl: string | null;
  petition_id: string;
  receiver: string;
};

const KEY = 'asp.test.pendingDrop';

export function readPendingDrop(): PendingDrop | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : null;
    return v && typeof v.nonce === 'string' ? (v as PendingDrop) : null;
  } catch {
    return null;
  }
}

export function savePendingDrop(drop: PendingDrop) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(drop));
}

export function clearPendingDrop() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
}
