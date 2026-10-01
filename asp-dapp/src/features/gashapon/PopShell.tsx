import React, { useEffect, useState } from 'react';
import { POP_LAYOUT_CSS } from './popLayoutCss';
import { POP_MOTION_CSS } from './popMotionCss';
import { POP_PIECES_CSS } from './popPiecesCss';
import { isPopMuted, setPopMuted } from './popSound';
import { POP_EVENT, POP_FONTS_HREF } from './popTheme';

type Props = {
  active: 'get' | 'claim';
  title: string;
  children: React.ReactNode;
};

function SoundIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
      {muted ? <path d="M17 9l5 6M22 9l-5 6" /> : <path d="M17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12" />}
    </svg>
  );
}

/** Page frame for the Gashapon Pop proposal: fonts, styles, header, footer. */
export function PopShell({ active, title, children }: Props) {
  const [muted, setMuted] = useState(isPopMuted());

  useEffect(() => {
    document.title = title;
  }, [title]);

  const toggleSound = () => {
    setPopMuted(!muted);
    setMuted(!muted);
  };

  return (
    <div className="pop-root">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={POP_FONTS_HREF} />
      <style>{POP_LAYOUT_CSS + POP_PIECES_CSS + POP_MOTION_CSS}</style>

      <header className="pop-header">
        <div className="pop-header-inner">
          <a href="/pop" className="pop-brand" aria-label="Asp home">
            <span className="pop-brand-mark">ASP</span>
            <span className="pop-brand-jp" lang="ja">カプセル</span>
          </a>
          <nav className="pop-nav" aria-label="Primary">
            <a href="/pop" aria-current={active === 'get' ? 'page' : undefined}>
              Get
            </a>
            <a href="/pop/claim" aria-current={active === 'claim' ? 'page' : undefined}>
              Claim
            </a>
          </nav>
          <div className="pop-header-side">
            <span className="pop-chip pop-chip-violet">◆ Monad</span>
            <span className="pop-chip">World ID</span>
            <button
              type="button"
              className="pop-icon-btn"
              onClick={toggleSound}
              aria-pressed={!muted}
              aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
            >
              <SoundIcon muted={muted} />
            </button>
          </div>
        </div>
      </header>

      {children}

      <footer className="pop-footer">
        <span>{POP_EVENT} · one human, one capsule</span>
        <span>Design proposal — sample data</span>
      </footer>
    </div>
  );
}
