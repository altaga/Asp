import React, { useEffect, useState } from 'react';
import { DispenserMachine } from './DispenserMachine';
import { PopGetPanel, type GetState } from './PopGetPanels';
import { ProposalFrame } from './ProposalFrame';
import { ProposalSwitcher, type ProposalOption } from './ProposalSwitcher';
import { StockMeter } from './StockMeter';
import { SAMPLE_EDITION, SAMPLE_TOTAL } from './popSample';

const STATES: ProposalOption<GetState>[] = [
  { id: 'ready', label: 'Start' },
  { id: 'verifying', label: 'World ID' },
  { id: 'ticket', label: 'Ticket' },
  { id: 'used', label: 'Already claimed' },
];

/** /pop — dispenser proposal for the Get (signup) screen. */
export function PopGetPage() {
  const [state, setState] = useState<GetState>('ready');

  useEffect(() => {
    if (state !== 'verifying') return;
    const t = setTimeout(() => setState('ticket'), 2200);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <ProposalFrame active="get" title="Asp · Get (proposal)">
      <main className="pop-stage">
        <section className="pop-hero" aria-label="Dispenser">
          <DispenserMachine
            state="locked"
            total={SAMPLE_TOTAL}
            next={SAMPLE_EDITION}
            lockLabel={state === 'ticket' ? 'Item held — go claim' : 'Prove you’re human to unlock'}
          />
          <StockMeter total={SAMPLE_TOTAL} next={SAMPLE_EDITION} />
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
    </ProposalFrame>
  );
}
