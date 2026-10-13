import { RELEASE_ID, gatewayBaseUrl } from '../hire/gateway';

const COOKIE = 'asp_demo_id';
const ONE_YEAR_S = 60 * 60 * 24 * 365;

function readCookie(name: string): string {
  const hit = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : '';
}

/**
 * Skip-World only: a nonce kept in a browser cookie stands in for the World nullifier,
 * so the same browser is the same "person" and can't claim twice.
 */
export function demoNullifier(): string {
  let id = readCookie(COOKIE);
  if (!id) {
    id = crypto.randomUUID();
    document.cookie = `${COOKIE}=${encodeURIComponent(id)}; Max-Age=${ONE_YEAR_S}; Path=/; SameSite=Lax; Secure`;
  }
  return `demo:${id}`;
}

async function postGateway(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${gatewayBaseUrl()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, preverified: true }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.detail || data?.error || `Request failed (${res.status})`) as Error & {
      code?: string;
      claimAlreadyUsed?: boolean;
    };
    err.code = data?.error;
    err.claimAlreadyUsed = Boolean(
      data?.claim_already_used || data?.error === 'claim-already-used' || data?.error === 'already-claimed'
    );
    throw err;
  }
  return data;
}

/** Get without World: register this browser's demo identity and receive its ticket. */
export function enrollDemoIdentity() {
  return postGateway('/asp/winners/register', { nullifier: demoNullifier(), release_id: RELEASE_ID });
}

/** Claim without World: authorize the petition for this browser's demo identity. */
export function authorizeDemoIdentity(petition_id: string, ticket: string) {
  return postGateway('/asp/proof-of-human/authorize-preverified', {
    petition_id,
    ticket,
    nullifier: demoNullifier(),
    signal: petition_id,
  });
}
