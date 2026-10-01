import { readDropStock } from '../../../features/nft/nftServer';

/** GET /api/nft/stock — run size + next edition for the dispenser window. Read-only. */
export async function GET(): Promise<Response> {
  try {
    return Response.json({ ok: true, stock: await readDropStock() });
  } catch (e: any) {
    console.warn('[NFT] stock read failed:', e?.code || '', e?.message || e);
    return Response.json(
      { ok: false, error: e?.code || 'stock-failed', detail: String(e?.shortMessage || e?.message || e) },
      { status: e?.status || 502 }
    );
  }
}
