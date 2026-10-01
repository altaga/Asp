import { useCallback, useEffect, useState } from 'react';
import type { DropStock } from './nftTypes';

type State = { stock: DropStock | null; error: string | null; loading: boolean };

/** Live run size + next edition from AspDrop (via /api/nft/stock). Off when `enabled` is false. */
export function useDropStock(enabled: boolean) {
  const [state, setState] = useState<State>({ stock: null, error: null, loading: enabled });

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await fetch('/api/nft/stock');
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.detail || data?.error || `Stock failed (${res.status})`);
      setState({ stock: data.stock as DropStock, error: null, loading: false });
    } catch (e: any) {
      setState((s) => ({ ...s, error: String(e?.message || e), loading: false }));
    }
  }, []);

  useEffect(() => {
    if (enabled) void refresh();
  }, [enabled, refresh]);

  return { ...state, refresh };
}
