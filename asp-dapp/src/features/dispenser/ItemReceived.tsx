import React from 'react';

type Receipt = {
  txHash?: string | null;
  txUrl?: string | null;
  payer?: string | null;
  device?: string | null;
  price: string;
};

function short(v?: string | null) {
  if (!v) return '—';
  return v.length <= 14 ? v : `${v.slice(0, 6)}…${v.slice(-4)}`;
}

/** Live-machine ending: no art — just that a limited edition item is theirs. */
export function ItemReceived({ txHash, txUrl, payer, device, price }: Receipt) {
  return (
    <section className="pop-card pop-enter" aria-label="Limited edition item received">
      <p className="pop-win"><span lang="ja">受け取り完了</span> · Picked up</p>
      <h2 className="pop-nft-name">You got a limited edition item.</h2>
      <p className="pop-hint" style={{ textAlign: 'left' }}>
        Take it from the machine&apos;s tray. One per verified human — this ticket is now used.
      </p>
      <div className="pop-badges" style={{ marginTop: 12 }}>
        <span className="pop-badge pop-badge-red" lang="ja">限定 Limited edition</span>
        <span className="pop-badge">Paid on Monad</span>
      </div>
      <dl className="pop-meta">
        <div>
          <dt>Monad tx</dt>
          <dd>{txHash && txUrl ? <a href={txUrl} target="_blank" rel="noreferrer">{short(txHash)}</a> : short(txHash)}</dd>
        </div>
        <div><dt>Payer</dt><dd>{short(payer)}</dd></div>
        <div><dt>Machine</dt><dd>{device || 'ok'}</dd></div>
        <div><dt>Paid</dt><dd>{price} USDC</dd></div>
      </dl>
    </section>
  );
}
