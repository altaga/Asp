import React from 'react';

export type ProposalOption<T extends string> = { id: T; label: string };

type Props<T extends string> = {
  options: ProposalOption<T>[];
  current: T;
  onChange: (id: T) => void;
  extra?: React.ReactNode;
};

/** Floating state picker — proposal screens only, never on the live demo. */
export function ProposalSwitcher<T extends string>({ options, current, onChange, extra }: Props<T>) {
  return (
    <div className="pop-switcher" role="toolbar" aria-label="Proposal states">
      <span className="pop-switcher-label">PROPOSAL</span>
      {options.map((o) => (
        <button key={o.id} type="button" aria-pressed={o.id === current} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
      {extra ? <span className="pop-switcher-sep" aria-hidden /> : null}
      {extra}
    </div>
  );
}
