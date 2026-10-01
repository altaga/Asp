import React, { useEffect, useState } from 'react';
import { COLORWAYS } from '../nft/nftArt';
import { pop } from './popTheme';
import { buzz, popSound } from './popSound';
import { HANDLE_CENTER, MACHINE_VIEW, useHandleDrag } from './useHandleDrag';

export type MachineState = 'locked' | 'ready' | 'dropped' | 'open';

type Props = {
  state: MachineState;
  lockLabel?: string;
  capsuleColor?: string;
  /** Increment to spin the handle for the user (button / keyboard fallback). */
  autoTurnSignal?: number;
  onTurned?: () => void;
};

/** Capsules piled at the bottom of the dome: [x, y, tilt]. */
const DOME = [
  [98, 214, -20], [130, 218, 15], [162, 220, -8], [194, 217, 25], [226, 212, -15],
  [76, 188, 30], [110, 186, -12], [144, 190, 40], [178, 188, -25], [212, 186, 10], [246, 186, -35],
  [94, 158, 15], [128, 156, -30], [162, 160, 5], [196, 156, 35], [230, 160, -10],
  [124, 128, 20], [160, 130, -15], [198, 128, 30],
] as const;

function Capsule({ x, y, a, tilt = 0, r = 17 }: { x: number; y: number; a: string; tilt?: number; r?: number }) {
  return (
    <g transform={`rotate(${tilt} ${x} ${y})`}>
      <circle cx={x} cy={y} r={r} fill="#ECE3DC" stroke="rgba(35,24,21,.16)" strokeWidth="1.5" />
      <path d={`M${x - r} ${y} a${r} ${r} 0 0 1 ${r * 2} 0z`} fill={a} />
      <rect x={x - r} y={y - 1.2} width={r * 2} height="2.4" fill="rgba(35,24,21,.18)" />
      <ellipse cx={x - r / 3} cy={y - r / 2.2} rx={r / 4} ry={r / 6} fill="#fff" opacity=".7" />
    </g>
  );
}

/** The capsule machine. Handle is draggable once unlocked; one full turn drops a capsule. */
export function PopMachine({ state, lockLabel, capsuleColor = pop.violet, autoTurnSignal = 0, onTurned }: Props) {
  const [flash, setFlash] = useState(false);
  const { svgRef, angle, turning, handleProps, autoTurn } = useHandleDrag({
    enabled: state === 'ready',
    onStep: () => {
      popSound.tick();
      buzz(8);
    },
    onTurned: () => onTurned?.(),
  });

  useEffect(() => {
    if (autoTurnSignal > 0) autoTurn();
  }, [autoTurnSignal, autoTurn]);

  useEffect(() => {
    if (state !== 'open') return;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 800);
    return () => clearTimeout(t);
  }, [state]);

  const { x: hx, y: hy } = HANDLE_CENTER;
  return (
    <div className="pop-machine-wrap">
      <svg
        ref={svgRef}
        className={`pop-machine${state === 'locked' ? ' pop-float' : ''}`}
        viewBox={`0 0 ${MACHINE_VIEW.w} ${MACHINE_VIEW.h}`}
        data-state={state}
        data-turning={turning}
        role="img"
        aria-label="Asp capsule machine"
      >
        <defs>
          <radialGradient id="popGlass" cx="38%" cy="30%" r="75%">
            <stop offset="0" stopColor="#fff" stopOpacity=".95" />
            <stop offset="1" stopColor="#FCE9E4" stopOpacity=".55" />
          </radialGradient>
        </defs>
        <ellipse cx="160" cy="430" rx="128" ry="9" fill="rgba(35,24,21,.12)" />
        <circle cx="160" cy="132" r="116" fill="url(#popGlass)" stroke="#fff" strokeWidth="6" />
        {DOME.map(([x, y, tilt], i) => (
          <g key={i} className="pop-dome-cap" style={{ animationDelay: `${i * 0.04}s` }}>
            <Capsule x={x} y={y} tilt={tilt} a={COLORWAYS[(i * 3) % COLORWAYS.length].a} />
          </g>
        ))}
        <ellipse cx="104" cy="82" rx="16" ry="38" fill="#fff" opacity=".7" transform="rotate(32 104 82)" />
        <rect x="58" y="226" width="204" height="26" rx="10" fill={pop.redDeep} />
        <rect x="34" y="246" width="252" height="178" rx="30" fill={pop.red} />
        <rect x="34" y="262" width="252" height="8" fill="#fff" opacity=".9" />
        <rect x="52" y="286" width="104" height="44" rx="14" fill="#fff" />
        <text x="104" y="316" textAnchor="middle" fontSize="24" fontWeight="900" fill={pop.red} fontFamily={pop.font}>ASP</text>
        <text x="104" y="346" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily={pop.mono}>0.002 USDC</text>
        <rect x="56" y="356" width="104" height="54" rx="16" fill="#2A1A17" />
        {state === 'dropped' || state === 'open' ? (
          <g className="pop-out-cap">
            <g className="pop-out-top"><path d="M88 384 a20 20 0 0 1 40 0z" fill={capsuleColor} /></g>
            <g className="pop-out-bottom"><path d="M88 384 a20 20 0 0 0 40 0z" fill="#F7F3EF" /></g>
          </g>
        ) : null}
        {flash ? <circle className="pop-flash" cx="108" cy="384" r="70" fill="#fff" opacity=".9" /> : null}
        <g
          className="pop-handle"
          data-locked={state !== 'ready'}
          tabIndex={state === 'ready' ? 0 : -1}
          role="button"
          aria-label="Turn the handle"
          aria-disabled={state !== 'ready'}
          {...handleProps}
        >
          <circle cx={hx} cy={hy} r="62" fill="transparent" />
          <circle className="pop-handle-disc" cx={hx} cy={hy} r="40" fill="#fff" stroke="#F1E4DC" strokeWidth="4" />
          <g transform={`rotate(${angle} ${hx} ${hy})`}>
            <rect x={hx - 9} y={hy - 36} width="18" height="72" rx="9" fill={pop.ink} />
            <circle cx={hx} cy={hy - 26} r="4" fill={pop.red} />
          </g>
        </g>
      </svg>
      {state === 'ready' && !turning ? (
        <div className="pop-turn-hint" aria-hidden>
          <span>↻ Turn</span>
          <small lang="ja">回す</small>
        </div>
      ) : null}
      {state === 'locked' && lockLabel ? <div className="pop-lock">{lockLabel}</div> : null}
    </div>
  );
}
