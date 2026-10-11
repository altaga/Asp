const GATEWAY =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GATEWAY_URL) ||
  'https://gateway.example.com';

export function gatewayBaseUrl() {
  return String(GATEWAY).replace(/\/$/, '');
}

export async function createPetition(input: {
  requester?: string;
  target_hardware_id: string;
  command: string[];
}) {
  const res = await fetch(`${gatewayBaseUrl()}/asp/petition`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // Kiosk: no PC wallet — placeholder so older gateways that still require requester accept the call.
      requester: input.requester || 'kiosk',
      target_hardware_id: input.target_hardware_id,
      command: input.command,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.detail || data?.error || `Petition failed (${res.status})`);
  }
  return data;
}

export async function verifyProofOfHuman(
  petition_id: string,
  idkitResponse: unknown,
  opts?: { action?: string; signal?: string; ticket?: string }
) {
  // Verify on this dapp (staging token), then authorize on gateway — never rely on
  // gateway's World portal token (goes stale whenever the portal window is refreshed).
  const res = await fetch(`/api/world/poh-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      petition_id,
      idkitResponse,
      action: opts?.action,
      signal: opts?.signal,
      ticket: opts?.ticket,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(
      data?.detail || data?.error || `World verify failed (${res.status})`
    ) as Error & { code?: string; claimAlreadyUsed?: boolean };
    err.code = data?.error;
    err.claimAlreadyUsed = Boolean(
      data?.claim_already_used ||
        data?.error === 'claim-already-used' ||
        data?.error === 'already-claimed'
    );
    throw err;
  }
  return data;
}

export const ENROLL_ACTION = 'asp-enroll-metropolis-capsule-v1';
export const RELEASE_ID = 'metropolis-capsule-v1';

/** Signup: Selfie Check uniqueness → ticket bound to nullifier. */
export async function enrollWinner(
  idkitResponse: unknown,
  opts?: { action?: string; signal?: string }
) {
  // Verify on this dapp (staging token + correct UA), then register on gateway.
  const res = await fetch(`/api/world/enroll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idkitResponse,
      action: opts?.action || ENROLL_ACTION,
      signal: opts?.signal || 'asp-enroll',
      release_id: RELEASE_ID,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.detail || data?.error || `Enroll failed (${res.status})`);
  }
  return data as {
    ok: boolean;
    already?: boolean;
    winner: {
      ticket: string;
      has_session: boolean;
      enrolled?: boolean;
      session_id?: string | null;
      enrolled_at: number;
      claimed_at: number | null;
    };
  };
}

export async function getWinner(ticket: string) {
  const res = await fetch(`${gatewayBaseUrl()}/asp/winners/${encodeURIComponent(ticket)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Winner lookup failed (${res.status})`);
  return data as { ok: boolean; winner: { ticket: string; has_session: boolean; session_id?: string | null; claimed_at: number | null } };
}

export async function revokePetition(petition_id: string) {
  const res = await fetch(`${gatewayBaseUrl()}/asp/proof-of-human/revoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ petition_id }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Revoke failed (${res.status})`);
  return data;
}

/** Hackathon demo: clear release claim nullifiers so the same person can claim again. */
export async function resetDemoClaims() {
  const res = await fetch(`${gatewayBaseUrl()}/asp/demo/reset-claims`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clear_petitions: true }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || data?.error || `Demo reset failed (${res.status})`);
  return data;
}

export const GACHA_DEVICE_ID = 'Sub_A7C440A00001';
export const DISPENSE_ONCE = ['DISPENSE_ONCE'] as const;
