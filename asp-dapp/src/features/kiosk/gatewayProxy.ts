/**
 * Server-side (Expo API routes): forward a kiosk call to the gateway and always answer JSON,
 * even when the tunnel in front of the gateway returns an HTML error page.
 */
function gatewayBase() {
  const raw = process.env.GATEWAY_URL || process.env.EXPO_PUBLIC_GATEWAY_URL || 'https://gateway.example.com';
  return String(raw).replace(/\/$/, '');
}

export async function proxyToGateway(path: string, init?: { method?: string; body?: unknown }) {
  try {
    const res = await fetch(`${gatewayBase()}${path}`, {
      method: init?.method || 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: init?.body === undefined ? undefined : JSON.stringify(init.body),
    });
    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { ok: false, error: `gateway-${res.status}`, detail: text.slice(0, 400) };
    }
    return Response.json(data, { status: res.status });
  } catch (e: any) {
    return Response.json(
      { ok: false, error: 'gateway-unreachable', detail: String(e?.message || e) },
      { status: 502 }
    );
  }
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  return ((await request.json().catch(() => ({}))) || {}) as Record<string, unknown>;
}

export function str(v: unknown) {
  return typeof v === 'string' ? v.trim() : '';
}
