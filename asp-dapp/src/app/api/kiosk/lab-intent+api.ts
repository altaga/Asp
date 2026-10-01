import { proxyToGateway } from '../../../features/kiosk/gatewayProxy';

/** POST /api/kiosk/lab-intent — pay-only smoke test (no World, no motor). */
export async function POST(_request: Request): Promise<Response> {
  return proxyToGateway('/asp/kiosk/lab/intent', { method: 'POST', body: {} });
}
