import React, { useEffect, useState } from 'react';
import type { NftDrop } from './nftTypes';
import { GACHA_KEYFRAMES } from './gachaKeyframes';

type Stage = 'turning' | 'dropping' | 'waiting' | 'opening' | 'revealed';

const TURN_MS = 1400;
const DROP_MS = 1100;
const OPEN_MS = 900;

const DOME_CAPSULES = [
  { x: 78, y: 70, a: '#836EF9' },
  { x: 112, y: 52, a: '#FF7AA2' },
  { x: 146, y: 74, a: '#FFC94A' },
  { x: 92, y: 108, a: '#3FA9F5' },
  { x: 130, y: 104, a: '#8BD48E' },
  { x: 62, y: 112, a: '#FF3B30' },
  { x: 160, y: 116, a: '#D4FF3F' },
];

type Props = {
  nft: NftDrop | null;
  /** Payment settled but the drop failed — freeze on the wobbling capsule. */
  failed?: boolean;
};

/** Gachapon turn → capsule drop → open → limited NFT art. Web-only (DOM + CSS keyframes). */
export function GachaDrop({ nft, failed }: Props) {
  const [stage, setStage] = useState<Stage>('turning');

  useEffect(() => {
    const t1 = setTimeout(() => setStage('dropping'), TURN_MS);
    const t2 = setTimeout(() => setStage((s) => (s === 'dropping' ? 'waiting' : s)), TURN_MS + DROP_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (nft && stage === 'waiting') setStage('opening');
  }, [nft, stage]);

  useEffect(() => {
    if (stage !== 'opening') return;
    const t = setTimeout(() => setStage('revealed'), OPEN_MS);
    return () => clearTimeout(t);
  }, [stage]);

  const turning = stage === 'turning';
  const capsuleVisible = stage === 'dropping' || stage === 'waiting' || stage === 'opening';
  const caption = failed
    ? 'The capsule is stuck — retry the drop below.'
    : stage === 'turning'
      ? 'Turning the handle…'
      : stage === 'revealed'
        ? `${nft?.name} · ${nft?.edition}`
        : stage === 'opening'
          ? 'Opening…'
          : 'Minting your limited edition on Monad…';

  return (
    <div style={styles.stage} role="img" aria-label={`Gachapon drop: ${caption}`}>
      <style>{GACHA_KEYFRAMES}</style>
      <div style={styles.glow} aria-hidden />

      <svg
        viewBox="0 0 220 300"
        style={{
          ...styles.machine,
          animation: turning ? 'aspShake .35s ease-in-out 4' : undefined,
          opacity: stage === 'revealed' ? 0.12 : 1,
        }}
        aria-hidden
      >
        <defs>
          <radialGradient id="aspGlass" cx="40%" cy="35%" r="70%">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.06" />
          </radialGradient>
        </defs>
        <circle cx="110" cy="95" r="82" fill="url(#aspGlass)" stroke="#FAFAFA" strokeOpacity="0.8" strokeWidth="3" />
        {DOME_CAPSULES.map((c, i) => (
          <g
            key={i}
            style={{
              transformOrigin: `${c.x}px ${c.y}px`,
              animation: turning ? `aspJiggle .4s ease-in-out ${i * 0.05}s 3` : undefined,
            }}
          >
            <path d={`M${c.x - 13} ${c.y} a13 13 0 0 1 26 0 z`} fill={c.a} />
            <path d={`M${c.x - 13} ${c.y} a13 13 0 0 0 26 0 z`} fill="#F4F4F6" />
          </g>
        ))}
        <rect x="50" y="166" width="120" height="12" rx="4" fill="#2A2A2E" />
        <rect x="36" y="176" width="148" height="110" rx="14" fill="#1A1A1F" stroke="#3A3A40" strokeWidth="2" />
        <text x="58" y="268" fill="#FAFAFA" fontSize="15" fontWeight="800" fontFamily="Helvetica,Arial,sans-serif">
          ASP
        </text>
        <g style={{ transformOrigin: '110px 218px', animation: turning ? 'aspKnob 1.3s ease-in-out' : undefined }}>
          <circle cx="110" cy="218" r="24" fill="#FAFAFA" />
          <rect x="104" y="198" width="12" height="40" rx="6" fill="#111111" />
        </g>
        <rect x="124" y="250" width="46" height="26" rx="8" fill="#050507" />
      </svg>

      {capsuleVisible ? (
        <div
          style={{
            ...styles.capsule,
            animation:
              stage === 'dropping'
                ? `aspDrop ${DROP_MS}ms cubic-bezier(.3,.7,.4,1) forwards`
                : stage === 'waiting'
                  ? 'aspWobble .9s ease-in-out infinite'
                  : undefined,
            transform: stage === 'opening' ? 'translate(0px, 44px)' : undefined,
          }}
          aria-hidden
        >
          <div style={{ ...styles.capTop, animation: stage === 'opening' ? `aspTopOff ${OPEN_MS}ms ease-out forwards` : undefined }} />
          <div style={{ ...styles.capBottom, animation: stage === 'opening' ? `aspBottomOff ${OPEN_MS}ms ease-out forwards` : undefined }} />
        </div>
      ) : null}

      {stage === 'opening' ? <div style={styles.flash} aria-hidden /> : null}

      {stage === 'revealed' && nft ? (
        <img src={nft.image} alt={nft.name} style={styles.art} />
      ) : null}

      <p style={styles.caption} aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  stage: {
    position: 'relative',
    marginTop: 18,
    height: 410,
    borderRadius: 16,
    overflow: 'hidden',
    background: '#0B0B0F',
    display: 'flex',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(circle at 50% 40%, rgba(131,110,249,0.28), rgba(11,11,15,0) 60%)',
  },
  machine: {
    position: 'absolute',
    top: 18,
    width: 220,
    height: 300,
    transition: 'opacity .5s ease',
  },
  capsule: {
    position: 'absolute',
    top: 262,
    left: 'calc(50% - 22px)',
    width: 44,
    height: 44,
  },
  capTop: {
    height: 22,
    borderRadius: '22px 22px 0 0',
    background: 'linear-gradient(135deg, #836EF9, #3A2BB8)',
    borderBottom: '3px solid #111111',
    boxSizing: 'border-box' as const,
  },
  capBottom: {
    height: 22,
    borderRadius: '0 0 22px 22px',
    background: '#F4F4F6',
  },
  flash: {
    position: 'absolute',
    top: 250,
    left: 'calc(50% - 90px)',
    width: 180,
    height: 180,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.9), rgba(131,110,249,0) 65%)',
    animation: 'aspFlash .9s ease-out forwards',
  },
  art: {
    position: 'absolute',
    top: 44,
    width: 260,
    height: 260,
    borderRadius: 18,
    boxShadow: '0 0 0 1px rgba(255,255,255,0.12), 0 20px 60px rgba(131,110,249,0.45)',
    animation: 'aspReveal .7s cubic-bezier(.2,.9,.3,1.2) forwards',
  },
  caption: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    right: 16,
    margin: 0,
    textAlign: 'center' as const,
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    fontWeight: 600,
  },
};
