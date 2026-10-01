/**
 * Kiosk pay requests live on the gateway. The browser talks to this dapp's /api/kiosk/*
 * proxies (no CORS, readable errors when the tunnel returns HTML).
 */

export type KioskPayment = {
  nonce: string;
  chainId: number;
  /** USDC contract — the wallet sends `data` here. */
  to: `0x${string}`;
  data: `0x${string}`;
  amount: string;
  token: string;
  receiver: string;
  petition_id?: string | null;
};

export type KioskIntentStatus = {
  nonce: string;
  status: 'pending' | 'paid' | 'dispensed' | string;
  txHash?: string | null;
  explorerUrl?: string | null;
  payer?: string | null;
  last_error?: string | null;
  petition_id?: string | null;
};

type ApiError = Error & { status?: number; code?: string; claimed?: boolean };

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.detail || data?.error || `Request failed (${res.status})`) as ApiError;
    err.status = res.status;
    err.code = data?.error;
    err.claimed = Boolean(data?.claimed);
    throw err;
  }
  return data as T;
}

function toPayment(data: any): KioskPayment {
  const p = data?.payment;
  if (!data?.nonce || !p?.to || !p?.data) throw new Error('Gateway returned an incomplete pay request.');
  return {
    nonce: data.nonce,
    chainId: Number(p.chainId),
    to: p.to,
    data: p.data,
    amount: String(p.amount),
    token: p.token,
    receiver: p.receiver,
    petition_id: data.intent?.petition_id ?? null,
  };
}

export type ReleaseKind = 'motor' | 'nft';

/** USDC pay request bound to an authorized petition; `release` picks motor or NFT drop. */
export async function createCheckoutPayment(petition_id: string, release: ReleaseKind = 'motor') {
  return toPayment(
    await call('/api/kiosk/checkout-intent', {
      method: 'POST',
      body: JSON.stringify({ petition_id, release }),
    })
  );
}

/** Lab only: pay request with no World and no motor. */
export async function createLabPayment() {
  return toPayment(await call('/api/kiosk/lab-intent', { method: 'POST', body: '{}' }));
}

export async function submitPaymentTx(nonce: string, txHash: string) {
  return call<{ ok: boolean; paid: boolean; error?: string; intent: KioskIntentStatus }>(
    '/api/kiosk/submit-tx',
    { method: 'POST', body: JSON.stringify({ nonce, txHash }) }
  );
}

export async function getPaymentStatus(nonce: string) {
  return call<{ ok: boolean; intent: KioskIntentStatus; error?: string }>(
    `/api/kiosk/status?nonce=${encodeURIComponent(nonce)}`
  );
}

/** After the gateway sees the USDC transfer — dispense once (proxied to /asp/kiosk/dispense). */
export async function dispenseAfterPayment(nonce: string) {
  return call<{
    ok: boolean;
    tx_id?: string;
    petition_id?: string;
    receipt?: unknown;
    gateway?: string;
    payer?: string;
    transaction?: string | null;
    explorerUrl?: string | null;
    message?: string;
  }>('/api/kiosk/complete', { method: 'POST', body: JSON.stringify({ nonce }) });
}

export function formatUsdc(atomic: string) {
  const n = Number(atomic) / 1_000_000;
  return Number.isFinite(n) ? String(n) : atomic;
}
