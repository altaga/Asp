import { proxyToGateway, readJson, str } from '../../../features/kiosk/gatewayProxy';

/** POST /api/kiosk/checkout-intent — USDC pay request for an authorized petition. */
export async function POST(request: Request): Promise<Response> {
  const body = await readJson(request);
  const petition_id = str(body.petition_id);
  if (!petition_id) {
    return Response.json({ ok: false, error: 'missing-petition_id' }, { status: 400 });
  }
  const release = str(body.release) === 'nft' ? 'nft' : 'motor';
  return proxyToGateway('/asp/kiosk/intent', { method: 'POST', body: { petition_id, release } });
}
