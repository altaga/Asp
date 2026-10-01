import React, { useEffect, useState } from 'react';
import { aspBrand } from '../control/AspDemoChrome';
import { GachaDrop } from './GachaDrop';
import { NftRevealCard } from './NftRevealCard';
import { previewNft } from './nftArt';
import type { NftDrop } from './nftTypes';

type Props = {
  phase: string;
  nft: NftDrop | null;
  hasPendingDrop: boolean;
  busy: boolean;
  onRetry: () => void;
  paymentTx?: string | null;
  paymentUrl?: string | null;
  price: string;
};

/** NFT test ending of the claim: animation while the drop lands, then the edition receipt. */
export function NftDropSection({ phase, nft, hasPendingDrop, busy, onRetry, paymentTx, paymentUrl, price }: Props) {
  const failed = phase === 'error' && hasPendingDrop;
  if (phase !== 'executing' && phase !== 'done' && !failed) return null;

  return (
    <>
      <GachaDrop nft={phase === 'done' ? nft : null} failed={failed} />
      {phase === 'done' && nft ? (
        <NftRevealCard nft={nft} paymentTx={paymentTx} paymentUrl={paymentUrl} price={price} />
      ) : null}
      {failed ? (
        <button type="button" style={styles.retry} disabled={busy} onClick={onRetry}>
          {busy ? 'Retrying…' : 'Retry the drop'}
        </button>
      ) : null}
    </>
  );
}

/** `/test/claim?preview=1` — plays the full drop with sample art; nothing is paid or minted. */
export function NftDropPreview({ price }: { price: string }) {
  const [nft, setNft] = useState<NftDrop | null>(null);
  const [run, setRun] = useState(0);

  useEffect(() => {
    setNft(null);
    const t = setTimeout(() => setNft(previewNft((run % 10) + 1)), 3600);
    return () => clearTimeout(t);
  }, [run]);

  return (
    <div>
      <p style={styles.previewNote}>Preview — sample art, no payment, nothing minted.</p>
      <GachaDrop key={run} nft={nft} />
      {nft ? <NftRevealCard nft={nft} price={price} /> : null}
      <button type="button" style={styles.retry} onClick={() => setRun((r) => r + 1)}>
        Play again
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  retry: {
    marginTop: 12,
    width: '100%',
    border: 'none',
    background: aspBrand.ink,
    color: '#FFFFFF',
    borderRadius: 12,
    padding: '13px 18px',
    fontSize: aspBrand.type.button,
    fontWeight: 650,
    cursor: 'pointer',
    fontFamily: aspBrand.font,
  },
  previewNote: {
    margin: '0 0 4px',
    fontSize: aspBrand.type.hint,
    color: aspBrand.muted,
  },
};
