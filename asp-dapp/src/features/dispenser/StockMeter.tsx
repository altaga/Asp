import React from 'react';
import { colorwayFor } from '../nft/nftArt';

type Props = {
  /** Editions in the run. */
  total: number;
  /** Next edition in line, `null` once sold out. */
  next: number | null;
  /** Set once this person has their edition. */
  yours?: number | null;
};

function label(ed: number) {
  return `#${String(ed).padStart(2, '0')} ${colorwayFor(ed).name}`;
}

/** Limited run stock: what's left, and exactly which edition comes out next. */
export function StockMeter({ total, next, yours }: Props) {
  const taken = yours != null ? yours : (next ?? total + 1) - 1;
  const left = Math.max(0, total - taken);
  return (
    <section className="pop-stock" aria-label={`Limited run, ${left} of ${total} left`}>
      <div className="pop-stock-head">
        <div className="pop-stock-title">
          <b lang="ja">限定販売</b>
          <span>Limited run · {total} made</span>
        </div>
        <div className="pop-left" aria-live="polite">
          <small lang="ja">残り</small>
          <strong key={left} data-bump={yours != null}>{left}</strong>
          <span>/ {total}</span>
        </div>
      </div>
      <ol className="pop-stock-bar" aria-hidden style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}>
        {Array.from({ length: total }, (_, i) => {
          const ed = i + 1;
          return (
            <li
              key={ed}
              style={{ background: colorwayFor(ed).a }}
              data-gone={ed <= taken && ed !== yours}
              data-next={ed === (yours ?? next)}
            />
          );
        })}
      </ol>
      <p className="pop-stock-next">
        {yours != null ? (
          <>You took <b>{label(yours)}</b></>
        ) : next != null ? (
          <>Next out <b>{label(next)}</b></>
        ) : (
          <b>Sold out</b>
        )}
        <span>In order · no random pulls</span>
      </p>
    </section>
  );
}
