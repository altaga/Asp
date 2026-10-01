import React from 'react';
import { COLORWAYS, MAX_EDITIONS } from '../nft/nftArt';

type Props = {
  /** Editions already dropped (1-based). */
  gone: number[];
  /** Edition this person just got, highlighted. */
  yours?: number | null;
};

function MiniCapsule({ a }: { a: string }) {
  return (
    <svg viewBox="0 0 40 40" width="100%" style={{ maxWidth: 40 }} aria-hidden>
      <path d="M4 20a16 16 0 0 1 32 0z" fill={a} />
      <path d="M4 20a16 16 0 0 0 32 0z" fill="#F4EEEA" />
      <rect x="3" y="18.5" width="34" height="3" rx="1.5" fill="rgba(35,24,21,.25)" />
      <ellipse cx="14" cy="12" rx="4" ry="2.5" fill="#fff" opacity=".6" />
    </svg>
  );
}

/** 台紙 — the lineup card on every capsule machine: all 10 editions, what's left. */
export function DaishiCard({ gone, yours }: Props) {
  const left = MAX_EDITIONS - gone.length;
  return (
    <section className="pop-daishi" aria-label={`Limited lineup, ${left} of ${MAX_EDITIONS} left`}>
      <div className="pop-daishi-head">
        <div className="pop-daishi-title">
          <b lang="ja">限定カプセル</b>
          <span>Limited lineup · {MAX_EDITIONS} ever</span>
        </div>
        <div className="pop-left" aria-live="polite">
          <small lang="ja">残り</small>
          <strong key={left} data-bump={yours != null}>{left}</strong>
          <span>/ {MAX_EDITIONS}</span>
        </div>
      </div>
      <ol className="pop-lineup">
        {COLORWAYS.map((c, i) => {
          const ed = i + 1;
          const isGone = gone.includes(ed);
          return (
            <li
              key={c.name}
              className="pop-slot"
              data-gone={isGone && ed !== yours}
              data-yours={ed === yours}
              title={`#${ed} ${c.name}${isGone ? ' — gone' : ''}`}
            >
              <MiniCapsule a={c.a} />
              {String(ed).padStart(2, '0')}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
