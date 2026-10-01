import React, { useEffect } from 'react';
import { colorwayFor } from '../nft/nftArt';
import { DispenserControls } from './DispenserControls';
import { DispenserShelves, windowSlots } from './DispenserShelves';
import { MACHINE_VIEW, TRAY, slotCenter, windowStart } from './dispenserLayout';
import { ShelfItem, type ItemLook } from './ShelfItem';
import { pop } from './popTheme';
import { useDispense } from './useDispense';

/** `vending` = the system is releasing right now (no press needed); `ready` = PUSH is live. */
export type MachineState = 'locked' | 'ready' | 'vending' | 'dropped' | 'collected';

type Props = {
  state: MachineState;
  /** `edition` shows numbered items; `mystery` shows sealed boxes and no stock count. */
  look?: ItemLook;
  /** Editions in the run (edition look). */
  total?: number;
  /** Edition that comes out next — always in order, never random. `null` = sold out. */
  next?: number | null;
  lockLabel?: string;
  /** Override the little status screen. */
  screen?: string;
  /** Increment to press PUSH for the user (panel CTA / keyboard fallback). */
  dispenseSignal?: number;
  onDispensed?: () => void;
};

const STATUS: Record<MachineState, string> = {
  locked: 'LOCKED', ready: 'PRESS', vending: 'VENDING', dropped: 'TAKE IT', collected: 'THANK YOU',
};

/** The Asp dispenser: limited items on shelves; one release drops one into the tray. */
export function DispenserMachine({
  state, look = 'edition', total = 10, next = 1, lockLabel, screen, dispenseSignal = 0, onDispensed,
}: Props) {
  const { vending, landed, dispense, buttonProps } = useDispense({
    enabled: state === 'ready',
    forced: state === 'vending',
    onDispensed,
  });

  useEffect(() => {
    if (dispenseSignal > 0) dispense();
  }, [dispenseSignal, dispense]);

  const settled = state === 'dropped' || state === 'collected';
  const out = vending || settled;
  const soldOut = look === 'edition' && next == null;
  const start = look === 'edition' ? windowStart(next ?? total) : 1;
  const slots = windowSlots(look, start, total, next);
  const nextIndex = soldOut ? -1 : look === 'edition' ? (next as number) - start : 0;
  const from = slotCenter(Math.max(nextIndex, 0));
  const color = look === 'edition' && next ? colorwayFor(next).a : pop.red;
  const left = look === 'edition' ? Math.max(0, total - ((next ?? total + 1) - 1) - (out && next ? 1 : 0)) : null;
  const stock = left == null ? 'LTD' : `${String(left).padStart(2, '0')}/${total}`;
  const status = screen ?? (soldOut ? 'SOLD OUT' : vending && !landed && !settled ? 'VENDING' : STATUS[state]);
  const label = left == null ? 'Asp limited edition dispenser' : `Asp limited dispenser, ${left} of ${total} left`;

  return (
    <div className="pop-machine-wrap">
      <svg
        className={`pop-machine${state === 'locked' ? ' pop-float' : ''}`}
        viewBox={`0 0 ${MACHINE_VIEW.w} ${MACHINE_VIEW.h}`}
        data-state={state}
        role="img"
        aria-label={label}
      >
        <defs>
          <linearGradient id="popGlass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".98" />
            <stop offset="1" stopColor="#FCE9E4" stopOpacity=".9" />
          </linearGradient>
        </defs>
        <ellipse cx="160" cy="432" rx="132" ry="8" fill="rgba(35,24,21,.12)" />
        <rect x="44" y="414" width="36" height="12" rx="4" fill={pop.redDeep} />
        <rect x="240" y="414" width="36" height="12" rx="4" fill={pop.redDeep} />
        <rect x="20" y="14" width="280" height="406" rx="28" fill={pop.red} />

        <rect x="36" y="26" width="248" height="42" rx="12" fill="#fff" />
        <text x="160" y="54" textAnchor="middle" fontSize="20" fontWeight="900" fill={pop.red} fontFamily={pop.font} letterSpacing="2">ASP LIMITED</text>

        <rect x="36" y="78" width="176" height="238" rx="14" fill="url(#popGlass)" stroke="#fff" strokeWidth="5" />
        <DispenserShelves look={look} slots={slots} nextIndex={nextIndex} out={out}
          showNextRing={look === 'edition' && !out && (state === 'ready' || state === 'locked')} />
        <path d="M58 92 l30 0 l-44 60 l0 -30z" fill="#fff" opacity=".45" />

        <DispenserControls stock={stock} status={status} canPress={state === 'ready' && !vending}
          pressed={vending && !settled} buttonProps={buttonProps} />

        <rect x="40" y="326" width="240" height="80" rx="18" fill="#2A1A17" />
        {landed || settled ? (
          <g className={`pop-tray-item${state === 'vending' ? ' pop-tray-wait' : ''}`}>
            <ShelfItem x={TRAY.x} y={TRAY.y} color={color} look={look} />
          </g>
        ) : null}
        {vending && !landed && !settled ? (
          <g className="pop-falling" style={{ ['--dx' as string]: `${TRAY.x - from.x}px`, ['--dy' as string]: `${TRAY.y - from.y}px` }}>
            <ShelfItem x={from.x} y={from.y} color={color} look={look} />
          </g>
        ) : null}
        <rect x="48" y="332" width="224" height="22" rx="8" fill="rgba(255,255,255,.14)" />
        <text x="160" y="347" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff" opacity=".65" fontFamily={pop.mono} letterSpacing="1">取出口 · TAKE OUT</text>
        {state === 'collected' ? <circle className="pop-flash" cx={TRAY.x} cy={TRAY.y} r="60" fill="#fff" opacity=".9" /> : null}
      </svg>
      {state === 'locked' && lockLabel ? <div className="pop-lock">{lockLabel}</div> : null}
    </div>
  );
}
