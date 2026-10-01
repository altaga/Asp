import React from 'react';
import { pop } from './popTheme';

export type ItemLook = 'edition' | 'mystery';

type Props = { x: number; y: number; color: string; look?: ItemLook };

/**
 * One stocked item on its shelf. `edition` is the same pill as the on-chain art;
 * `mystery` is a sealed 限定 box — the live machine never shows what's inside.
 */
export function ShelfItem({ x, y, color, look = 'edition' }: Props) {
  if (look === 'mystery') {
    return (
      <g>
        <rect x={x - 13} y={y - 16} width="26" height="32" rx="5" fill="#fff" stroke="rgba(35,24,21,.22)" strokeWidth="1.5" />
        <rect x={x - 13} y={y - 16} width="26" height="10" rx="5" fill={pop.red} />
        <rect x={x - 13} y={y - 9} width="26" height="3" fill={pop.red} />
        <text x={x} y={y + 9} textAnchor="middle" fontSize="9" fontWeight="900" fill={pop.red} fontFamily={pop.font}>限定</text>
      </g>
    );
  }
  return (
    <g>
      <rect x={x - 11} y={y - 17} width="22" height="34" rx="11" fill="none" stroke="rgba(35,24,21,.22)" strokeWidth="1.5" />
      <path d={`M${x - 10} ${y} v-6 a10 10 0 0 1 20 0 v6z`} fill={color} />
      <path d={`M${x - 10} ${y} v6 a10 10 0 0 0 20 0 v-6z`} fill="#FFFFFF" />
      <rect x={x - 11} y={y - 1.5} width="22" height="3" rx="1.5" fill="#111" opacity=".75" />
      <ellipse cx={x - 4} cy={y - 9} rx="2.5" ry="5" fill="#fff" opacity=".5" />
    </g>
  );
}
