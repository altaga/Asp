import { useCallback, useEffect, useState } from 'react';
import { previewNft } from '../nft/nftArt';
import type { NftDrop } from '../nft/nftTypes';

const LAND_MS = 2200;

/** `/test/claim?preview=1` — plays vend → reveal with sample art; nothing is paid or minted. */
export function usePreviewDrop(enabled: boolean, total = 10) {
  const [run, setRun] = useState(0);
  const [nft, setNft] = useState<NftDrop | null>(null);

  useEffect(() => {
    if (!enabled) return;
    setNft(null);
    const t = setTimeout(() => setNft(previewNft((run % total) + 1, total)), LAND_MS);
    return () => clearTimeout(t);
  }, [enabled, run, total]);

  const replay = useCallback(() => setRun((r) => r + 1), []);
  return { run, nft, phase: nft ? ('done' as const) : ('executing' as const), replay };
}
