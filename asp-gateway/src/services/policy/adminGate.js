import { timingSafeEqual } from 'node:crypto';

/**
 * Operator-only routes (demo resets). Disabled unless ASP_ADMIN_TOKEN is set,
 * and the caller must send it as `x-asp-admin`. Returns true when the request may proceed.
 */
export function requireAdmin(req, res) {
  const expected = process.env.ASP_ADMIN_TOKEN || '';
  if (!expected) {
    res.status(403).json({ ok: false, error: 'admin-disabled', detail: 'Operator routes are off on this gateway.' });
    return false;
  }
  const given = Buffer.from(String(req.get('x-asp-admin') || ''));
  const want = Buffer.from(expected);
  if (given.length !== want.length || !timingSafeEqual(given, want)) {
    res.status(403).json({ ok: false, error: 'admin-required', detail: 'Missing or wrong operator token.' });
    return false;
  }
  return true;
}
