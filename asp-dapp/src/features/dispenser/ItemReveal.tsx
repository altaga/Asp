import React, { useState } from 'react';
import type { NftDrop } from '../nft/nftTypes';

type Props = {
  nft: NftDrop;
  price: string;
  paymentTx?: string | null;
  paymentUrl?: string | null;
};

function short(v?: string | null) {
  if (!v) return '—';
  return v.length <= 14 ? v : `${v.slice(0, 6)}…${v.slice(-4)}`;
}

/** 受け取り — the numbered edition, proof it's yours, and how to find it in a wallet. */
export function ItemReveal({ nft, price, paymentTx, paymentUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const copyImport = async () => {
    await navigator.clipboard?.writeText(`${nft.contract} ${nft.tokenId}`).catch(() => undefined);
    setCopied(true);
  };
  const hasTokenUrl = Boolean(nft.tokenUrl && nft.tokenUrl !== '#');

  return (
    <section className="pop-card pop-enter" aria-label="Your limited edition">
      <div className="pop-reveal">
        <div className="pop-art-wrap pop-reveal-art">
          <img className="pop-art" src={nft.image} alt={`${nft.name}${nft.colorway ? `, ${nft.colorway}` : ''}`} />
        </div>
        <div>
          <p className="pop-win"><span lang="ja">受け取り完了</span> · Picked up</p>
          <h2 className="pop-nft-name">{nft.name}</h2>
          <div className="pop-badges">
            <span className="pop-badge pop-badge-red" lang="ja">限定 {nft.edition}</span>
            {nft.colorway ? <span className="pop-badge">{nft.colorway}</span> : null}
            <span className="pop-badge">In your wallet</span>
          </div>
        </div>
      </div>
      <dl className="pop-meta">
        <div><dt>Owner</dt><dd>{short(nft.owner)}</dd></div>
        <div><dt>Paid</dt><dd>{price} USDC</dd></div>
        <div>
          <dt>Payment tx</dt>
          <dd>{paymentTx && paymentUrl ? <a href={paymentUrl} target="_blank" rel="noreferrer">{short(paymentTx)}</a> : short(paymentTx)}</dd>
        </div>
        <div><dt>Contract</dt><dd>{short(nft.contract)}</dd></div>
      </dl>
      <div className="pop-wallet-tip">
        <b>See it in your wallet:</b> open the NFTs tab. Not there yet? Import NFT → contract{' '}
        <code>{short(nft.contract)}</code>, token ID <code>{nft.tokenId}</code>.
      </div>
      <div className="pop-row" style={{ marginTop: 18 }}>
        {hasTokenUrl ? (
          <a className="pop-btn" href={nft.tokenUrl} target="_blank" rel="noreferrer">View on MonadVision</a>
        ) : null}
        <button type="button" className="pop-btn pop-btn-ghost" onClick={() => void copyImport()}>
          {copied ? 'Copied' : 'Copy import info'}
        </button>
      </div>
    </section>
  );
}
