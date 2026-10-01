import { readJson, str } from '../../../features/kiosk/gatewayProxy';
import { releaseNftForPayment } from '../../../features/nft/nftServer';

/**
 * POST /api/nft/drop — after the gateway settles a paid `release: 'nft'` intent, hand the payer
 * one limited edition. Safe to retry: the contract keys every drop by the payment nonce.
 */
export async function POST(request: Request): Promise<Response> {
  const nonce = str((await readJson(request)).nonce);
  if (!nonce) {
    return Response.json({ ok: false, error: 'missing-nonce' }, { status: 400 });
  }
  try {
    const nft = await releaseNftForPayment(nonce);
    return Response.json({ ok: true, nft });
  } catch (e: any) {
    console.warn('[NFT] drop failed:', e?.code || '', e?.message || e);
    return Response.json(
      { ok: false, error: e?.code || 'drop-failed', detail: String(e?.shortMessage || e?.message || e) },
      { status: e?.status || 502 }
    );
  }
}
