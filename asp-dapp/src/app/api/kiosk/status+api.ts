import { proxyToGateway } from '../../../features/kiosk/gatewayProxy';

/** GET /api/kiosk/status?nonce=… — poll the gateway's on-chain USDC check. */
export async function GET(request: Request): Promise<Response> {
  const nonce = (new URL(request.url).searchParams.get('nonce') || '').trim();
  if (!nonce) {
    return Response.json({ ok: false, error: 'missing-nonce' }, { status: 400 });
  }
  return proxyToGateway(`/asp/kiosk/intent/${encodeURIComponent(nonce)}`);
}
