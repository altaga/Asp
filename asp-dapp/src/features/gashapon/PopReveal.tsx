import React, { useState } from 'react';
import { COLORWAYS } from '../nft/nftArt';
import type { NftDrop } from '../nft/nftTypes';
import { POP_PRICE } from './popTheme';

type Props = {
  nft: NftDrop;
  paymentTx: string;
  releaseTx: string;
};

const PIECES = Array.from({ length: 28 }, (_, i) => {
  const rad = (i / 28) * Math.PI * 2;
  const dist = 150 + (i % 4) * 45;
  return {
    x: `${Math.round(Math.cos(rad) * dist)}px`,
    y: `${Math.round(Math.sin(rad) * dist)}px`,
    r: `${(i * 47) % 360}deg`,
    color: COLORWAYS[i % COLORWAYS.length].a,
    delay: `${(i % 5) * 0.04}s`,
    half: i % 3 === 0,
  };
});

function short(v: string) {
  return v.length <= 14 ? v : `${v.slice(0, 6)}…${v.slice(-4)}`;
}

/** 当たり! — the edition, proof it's yours, and how to find it in a wallet. */
export function PopReveal({ nft, paymentTx, releaseTx }: Props) {
  const [copied, setCopied] = useState(false);
  const copyImport = async () => {
    await navigator.clipboard?.writeText(`${nft.contract} ${nft.tokenId}`).catch(() => undefined);
    setCopied(true);
  };

  return (
    <section className="pop-card pop-enter" aria-label="Your limited edition" style={{ position: 'relative' }}>
      <div className="pop-confetti" aria-hidden>
        {PIECES.map((p, i) => (
          <i
            key={i}
            style={{
              background: p.color,
              borderRadius: p.half ? '12px 12px 0 0' : '50%',
              animationDelay: p.delay,
              ['--x' as string]: p.x,
              ['--y' as string]: p.y,
              ['--r' as string]: p.r,
            }}
          />
        ))}
      </div>
      <div className="pop-reveal">
        <div className="pop-art-wrap pop-reveal-art">
          <img className="pop-art" src={nft.image} alt={`${nft.name}, ${nft.colorway}`} />
        </div>
        <div>
          <p className="pop-win" lang="ja">当たり！ You got one of {nft.edition.split('/')[1]?.trim()}</p>
          <h2 className="pop-nft-name">{nft.name}</h2>
          <div className="pop-badges">
            <span className="pop-badge pop-badge-red" lang="ja">限定 {nft.edition}</span>
            <span className="pop-badge">{nft.colorway}</span>
            <span className="pop-badge">In your wallet</span>
          </div>
        </div>
      </div>
      <dl className="pop-meta">
        <div><dt>Owner</dt><dd>{short(nft.owner)}</dd></div>
        <div><dt>Paid</dt><dd>{POP_PRICE} USDC</dd></div>
        <div><dt>Payment tx</dt><dd><a href="#" onClick={(e) => e.preventDefault()}>{short(paymentTx)}</a></dd></div>
        <div><dt>NFT tx</dt><dd><a href="#" onClick={(e) => e.preventDefault()}>{short(releaseTx)}</a></dd></div>
      </dl>
      <div className="pop-wallet-tip">
        <b>See it in your wallet:</b> open the NFTs tab. Not there yet? Import NFT → contract{' '}
        <code>{short(nft.contract)}</code>, token ID <code>{nft.tokenId}</code>.
      </div>
      <div className="pop-row" style={{ marginTop: 18 }}>
        <a className="pop-btn" href="#" onClick={(e) => e.preventDefault()}>View on MonadVision</a>
        <button type="button" className="pop-btn pop-btn-ghost" onClick={() => void copyImport()}>
          {copied ? 'Copied' : 'Copy import info'}
        </button>
      </div>
    </section>
  );
}
