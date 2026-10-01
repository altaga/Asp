import { proxyToGateway, readJson, str } from '../../../features/kiosk/gatewayProxy';

/**
 * POST /api/kiosk/complete — ask the gateway to dispense once. The gateway re-verifies the
 * USDC transfer on Monad before the motor runs; nothing here is trusted on its own.
 */
export async function POST(request: Request): Promise<Response> {
  const nonce = str((await readJson(request)).nonce);
  if (!nonce) {
    return Response.json({ ok: false, error: 'missing-nonce' }, { status: 400 });
  }
  return proxyToGateway('/asp/kiosk/dispense', { method: 'POST', body: { nonce } });
}
