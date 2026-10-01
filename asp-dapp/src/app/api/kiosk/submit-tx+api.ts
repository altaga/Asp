import { proxyToGateway, readJson, str } from '../../../features/kiosk/gatewayProxy';

/** POST /api/kiosk/submit-tx — hand the phone wallet's tx hash to the gateway for on-chain checks. */
export async function POST(request: Request): Promise<Response> {
  const body = await readJson(request);
  const nonce = str(body.nonce);
  const txHash = str(body.txHash);
  if (!nonce || !/^0x[0-9a-fA-F]{64}$/.test(txHash)) {
    return Response.json(
      { ok: false, error: 'missing-fields', expected: ['nonce', 'txHash'] },
      { status: 400 }
    );
  }
  return proxyToGateway(`/asp/kiosk/intent/${encodeURIComponent(nonce)}/tx`, {
    method: 'POST',
    body: { txHash },
  });
}
