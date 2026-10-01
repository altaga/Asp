import React, { useCallback, useState } from 'react';
import { DispenserMachine, type MachineState } from './DispenserMachine';
import { PopClaimPanel, type ClaimMode, type ClaimState } from './PopClaimPanels';
import { ProposalFrame } from './ProposalFrame';
import { popSound } from './popSound';
import { ProposalSwitcher, type ProposalOption } from './ProposalSwitcher';
import { StockMeter } from './StockMeter';
import { SAMPLE_EDITION, SAMPLE_TOTAL } from './popSample';

const STATES: ProposalOption<ClaimState>[] = [
  { id: 'ticket', label: 'Ticket' },
  { id: 'verify', label: 'World ID' },
  { id: 'pay', label: 'Pay' },
  { id: 'dispense', label: 'Dispense' },
  { id: 'reveal', label: 'NFT pickup' },
  { id: 'motor', label: 'Kiosk drop' },
  { id: 'used', label: 'Already claimed' },
];

const LOCK_LABEL: Partial<Record<ClaimState, string>> = {
  ticket: 'Enter your ticket',
  verify: 'Confirm it’s you',
  pay: 'Pay to unlock',
  used: 'Already claimed',
};

function machineFor(state: ClaimState, landed: boolean): MachineState {
  if (state === 'reveal') return 'collected';
  if (state === 'motor' || (state === 'dispense' && landed)) return 'dropped';
  return state === 'dispense' ? 'ready' : 'locked';
}

/** /pop/claim — dispenser proposal for Claim, covering both the NFT drop and the kiosk motor. */
export function PopClaimPage() {
  const [state, setState] = useState<ClaimState>('ticket');
  const [mode, setMode] = useState<ClaimMode>('nft');
  const [landed, setLanded] = useState(false);
  const [run, setRun] = useState(0);
  const [press, setPress] = useState(0);

  const go = useCallback((next: ClaimState) => {
    setLanded(false);
    setPress(0);
    setRun((r) => r + 1);
    setState(next);
    if (next === 'reveal') popSound.chime();
  }, []);

  const onDispensed = useCallback(() => {
    setLanded(true);
    setTimeout(() => {
      if (mode === 'motor') return setState('motor');
      setState('reveal');
      popSound.chime();
    }, 900);
  }, [mode]);

  const got = state === 'reveal' || state === 'motor';
  return (
    <ProposalFrame active="claim" title="Asp · Claim (proposal)">
      <main className="pop-stage">
        <section className="pop-hero" aria-label="Dispenser">
          <DispenserMachine
            key={run}
            state={machineFor(state, landed)}
            look={mode === 'motor' ? 'mystery' : 'edition'}
            total={SAMPLE_TOTAL}
            next={SAMPLE_EDITION}
            lockLabel={LOCK_LABEL[state]}
            dispenseSignal={press}
            onDispensed={onDispensed}
          />
          {mode === 'nft' ? (
            <StockMeter total={SAMPLE_TOTAL} next={SAMPLE_EDITION} yours={got ? SAMPLE_EDITION : null} />
          ) : null}
        </section>
        <section className="pop-panel">
          <PopClaimPanel state={state} mode={mode} onNext={go} onDispense={() => setPress((n) => n + 1)} />
        </section>
      </main>
      <ProposalSwitcher
        options={STATES}
        current={state}
        onChange={go}
        extra={
          <button type="button" aria-pressed={false} onClick={() => setMode(mode === 'nft' ? 'motor' : 'nft')}>
            Mode: {mode === 'nft' ? 'NFT' : 'Kiosk'}
          </button>
        }
      />
    </ProposalFrame>
  );
}
