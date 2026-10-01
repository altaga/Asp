import React from 'react';
import { colorwayFor } from '../nft/nftArt';
import { ROW_H, ROW_TOP, ROWS, WINDOW_SLOTS, slotCenter } from './dispenserLayout';
import { ShelfItem, type ItemLook } from './ShelfItem';
import { pop } from './popTheme';

export type Slot = { key: string; edition: number | null; stocked: boolean; sold: boolean };

/** The 10 slots behind the glass. Editions page through when the run is longer than one window. */
export function windowSlots(look: ItemLook, start: number, total: number, next: number | null): Slot[] {
  return Array.from({ length: WINDOW_SLOTS }, (_, i) => {
    if (look === 'mystery') return { key: `m${i}`, edition: null, stocked: true, sold: false };
    const ed = start + i;
    const cut = next ?? total + 1;
    return { key: `e${ed}`, edition: ed, stocked: ed <= total, sold: ed <= total && ed < cut };
  });
}

type Props = {
  look: ItemLook;
  slots: Slot[];
  /** Index of the slot that comes out next, or -1. */
  nextIndex: number;
  /** That slot is already out (falling / in the tray). */
  out: boolean;
  showNextRing: boolean;
};

export function DispenserShelves({ look, slots, nextIndex, out, showNextRing }: Props) {
  return (
    <g>
      {Array.from({ length: ROWS }, (_, r) => (
        <rect key={r} x="44" y={ROW_TOP + r * ROW_H + 33} width="160" height="9" rx="3" fill="#E6D9D0" />
      ))}
      {slots.map((s, i) => {
        const { x, y } = slotCenter(i);
        const empty = !s.stocked || s.sold || (i === nextIndex && out);
        const color = s.edition ? colorwayFor(s.edition).a : pop.red;
        return (
          <g key={s.key}>
            {i === nextIndex && showNextRing ? (
              <rect className="pop-next-ring" x={x - 22} y={y - 18} width="44" height="34" rx="9" fill="none" stroke={pop.violet} strokeWidth="2.5" strokeDasharray="5 4" />
            ) : null}
            {empty ? null : <ShelfItem x={x} y={y} color={color} look={look} />}
            {s.edition && s.stocked ? (
              <text x={x} y={y + 24} textAnchor="middle" fontSize="7" fontWeight="700" fontFamily={pop.mono}
                fill={s.sold ? pop.red : pop.ink} opacity={s.sold ? 0.7 : 1}>
                {s.sold ? 'SOLD' : `#${String(s.edition).padStart(2, '0')}`}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}
