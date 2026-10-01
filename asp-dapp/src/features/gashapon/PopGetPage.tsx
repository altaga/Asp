import React, { useEffect, useState } from 'react';
import { DaishiCard } from './DaishiCard';
import { PopGetPanel, type GetState } from './PopGetPanels';
import { PopMachine } from './PopMachine';
import { PopShell } from './PopShell';
import { ProposalSwitcher, type ProposalOption } from './ProposalSwitcher';
import { SAMPLE_GONE_BEFORE } from './popSample';

const STATES: ProposalOption<GetState>[] = [
  { id: 'ready', label: 'Start' },
  { id: 'verifying', label: 'World ID' },
  { id: 'ticket', label: 'Ticket' },
  { id: 'used', label: 'Already claimed' },
];

/** /pop — Gashapon Pop proposal for the Get (signup) screen. */
export function PopGetPage() {
  const [state, setState] = useState<GetState>('ready');

  useEffect(() => {
    if (state !== 'verifying') return;
    const t = setTimeout(() => setState('ticket'), 2200);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <PopShell active="get" title="Asp · Get (proposal)">
      <main className="pop-stage">
        <section className="pop-hero" aria-label="Machine">
          <PopMachine state="locked" lockLabel={state === 'ticket' ? 'Ticket ready — go claim' : 'Prove you’re human to unlock'} />
          <DaishiCard gone={SAMPLE_GONE_BEFORE} />
        </section>
        <section className="pop-panel">
          <PopGetPanel state={state} onVerify={() => setState('verifying')} onNext={() => setState('ready')} />
        </section>
      </main>
      <ProposalSwitcher
        options={STATES}
        current={state}
        onChange={setState}
        extra={<a href="/pop/claim">Claim screen →</a>}
      />
    </PopShell>
  );
}
