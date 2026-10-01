import React from 'react';
import { BUTTON } from './dispenserLayout';
import { POP_PRICE, pop } from './popTheme';

type Props = {
  stock: string;
  status: string;
  canPress: boolean;
  pressed: boolean;
  buttonProps: {
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent<SVGGElement>) => void;
  };
};

/** Right-hand control column: stock display, price tag, ID reader, PUSH button. */
export function DispenserControls({ stock, status, canPress, pressed, buttonProps }: Props) {
  const { x, y } = BUTTON;
  return (
    <g>
      <rect x="222" y="80" width="62" height="44" rx="8" fill="#1D1412" />
      <text x="253" y="102" textAnchor="middle" fontSize="15" fontWeight="700" fill={pop.yellow} fontFamily={pop.mono}>{stock}</text>
      <text x="253" y="116" textAnchor="middle" fontSize="7" fontWeight="700" fill="#9BE7A0" fontFamily={pop.mono} letterSpacing="1">{status}</text>

      <rect x="222" y="132" width="62" height="30" rx="8" fill="#fff" />
      <text x="253" y="148" textAnchor="middle" fontSize="13" fontWeight="900" fill={pop.red} fontFamily={pop.font}>{POP_PRICE}</text>
      <text x="253" y="157" textAnchor="middle" fontSize="6.5" fontWeight="700" fill={pop.ink} fontFamily={pop.mono}>USDC</text>

      <rect x="222" y="170" width="62" height="36" rx="8" fill="rgba(255,255,255,.16)" stroke="rgba(255,255,255,.5)" strokeDasharray="3 3" />
      <text x="253" y="185" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff" fontFamily={pop.mono}>WORLD ID</text>
      <text x="253" y="197" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff" opacity=".8" fontFamily={pop.mono}>◆ MONAD</text>

      <g
        className="pop-push"
        data-ready={canPress}
        data-pressed={pressed}
        tabIndex={canPress ? 0 : -1}
        role="button"
        aria-label="Dispense"
        aria-disabled={!canPress}
        {...buttonProps}
      >
        <circle cx={x} cy={y} r="34" fill="transparent" />
        {canPress ? <circle className="pop-push-pulse" cx={x} cy={y} r="28" fill="none" stroke={pop.yellow} strokeWidth="3" /> : null}
        <circle cx={x} cy={y} r="28" fill={pop.redDeep} />
        <g className="pop-push-cap">
          <circle className="pop-push-disc" cx={x} cy={y} r="22" fill={canPress ? pop.yellow : '#F1E4DC'} stroke="#fff" strokeWidth="3" />
          <text x={x} y={y + 3.5} textAnchor="middle" fontSize="10" fontWeight="900" fill={pop.ink} fontFamily={pop.font}>PUSH</text>
        </g>
      </g>
      <rect x="247" y="284" width="12" height="22" rx="3" fill="#2A1A17" />
    </g>
  );
}
