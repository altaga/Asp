import React from 'react';
import { aspBrand } from '../control/AspDemoChrome';
import type { NftDrop } from './nftTypes';

type Props = {
  nft: NftDrop;
  paymentTx?: string | null;
  paymentUrl?: string | null;
  price: string;
};

function short(v?: string | null) {
  if (!v) return '—';
  return v.length <= 14 ? v : `${v.slice(0, 8)}…${v.slice(-6)}`;
}

/** Receipt for the NFT drop: what you got, where it lives, what you paid. */
export function NftRevealCard({ nft, paymentTx, paymentUrl, price }: Props) {
  return (
    <section style={styles.card} aria-label="Your limited edition">
      <div style={styles.top}>
        <div>
          <div style={styles.eyebrow}>Limited edition · {nft.edition}</div>
          <h2 style={styles.title}>{nft.name}</h2>
          {nft.colorway ? <div style={styles.colorway}>{nft.colorway}</div> : null}
        </div>
        <span style={styles.badge}>In your wallet</span>
      </div>

      <dl style={styles.meta}>
        <div style={styles.item}>
          <dt style={styles.dt}>Owner</dt>
          <dd style={styles.dd}>{short(nft.owner)}</dd>
        </div>
        <div style={styles.item}>
          <dt style={styles.dt}>Paid</dt>
          <dd style={styles.dd}>{price} USDC</dd>
        </div>
        <div style={styles.item}>
          <dt style={styles.dt}>Payment tx</dt>
          <dd style={styles.dd}>
            {paymentTx && paymentUrl ? (
              <a href={paymentUrl} target="_blank" rel="noreferrer" style={styles.link}>
                {short(paymentTx)}
              </a>
            ) : (
              short(paymentTx)
            )}
          </dd>
        </div>
        <div style={styles.item}>
          <dt style={styles.dt}>Contract</dt>
          <dd style={styles.dd}>{short(nft.contract)}</dd>
        </div>
      </dl>

      {nft.tokenUrl && nft.tokenUrl !== '#' ? (
        <a href={nft.tokenUrl} target="_blank" rel="noreferrer" style={styles.cta}>
          View NFT on MonadVision
        </a>
      ) : null}
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    marginTop: 14,
    padding: 16,
    borderRadius: 14,
    border: `1px solid ${aspBrand.line}`,
    background: aspBrand.paper,
  },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  eyebrow: {
    fontSize: 12,
    fontWeight: 650,
    letterSpacing: 0.06,
    textTransform: 'uppercase' as const,
    color: aspBrand.muted,
  },
  title: { margin: '4px 0 2px', fontSize: 22, fontWeight: 750, letterSpacing: -0.4 },
  colorway: { fontSize: aspBrand.type.hint, color: aspBrand.muted },
  badge: {
    flexShrink: 0,
    padding: '5px 10px',
    borderRadius: 980,
    background: aspBrand.ink,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 650,
  },
  meta: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '14px 0 0' },
  item: { margin: 0, minWidth: 0 },
  dt: { fontSize: 11, fontWeight: 600, color: aspBrand.muted, textTransform: 'uppercase' as const, marginBottom: 2 },
  dd: { margin: 0, fontSize: aspBrand.type.meta, fontFamily: aspBrand.mono, wordBreak: 'break-all' as const },
  link: { color: aspBrand.ink, fontWeight: 650 },
  cta: {
    display: 'block',
    marginTop: 14,
    padding: '12px 16px',
    borderRadius: 12,
    background: aspBrand.ink,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    textDecoration: 'none',
    fontSize: aspBrand.type.button,
    fontWeight: 650,
  },
};
