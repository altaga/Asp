import React, { useCallback, useState } from 'react';
import { COLORWAYS } from '../nft/nftArt';
import { DaishiCard } from './DaishiCard';
import { PopClaimPanel, type ClaimMode, type ClaimState } from './PopClaimPanels';
import { PopMachine, type MachineState } from './PopMachine';
import { PopShell } from './PopShell';
import { buzz, popSound } from './popSound';
import { ProposalSwitcher, type ProposalOption } from './ProposalSwitcher';
import { SAMPLE_EDITION, SAMPLE_GONE_BEFORE } from './popSample';

const STATES: ProposalOption<ClaimState>[] = [
  { id: 'ticket', label: 'Ticket' },
  { id: 'verify', label: 'World ID' },
  { id: 'pay', label: 'Pay' },
  { id: 'turn', label: 'Turn' },
  { id: 'reveal', label: 'NFT reveal' },
  { id: 'motor', label: 'Kiosk drop' },
  { id: 'used', label: 'Already claimed' },
];

const LOCK_LABEL: Partial<Record<ClaimState, string>> = {
  ticket: 'Enter your ticket',
  verify: 'Confirm it’s you',
  pay: 'Pay to unlock',
  used: 'Already claimed',
};

function machineFor(state: ClaimState, dropped: boolean): MachineState {
  if (state === 'reveal') return 'open';
  if (state === 'motor' || (state === 'turn' && dropped)) return 'dropped';
  return state === 'turn' ? 'ready' : 'locked';
}

/** /pop/claim — Gashapon Pop proposal for Claim, covering both the NFT drop and the kiosk motor. */
export function PopClaimPage() {
  const [state, setState] = useState<ClaimState>('ticket');
  const [mode, setMode] = useState<ClaimMode>('nft');
  const [dropped, setDropped] = useState(false);
  const [run, setRun] = useState(0);
  const [autoTurn, setAutoTurn] = useState(0);

  const go = useCallback((next: ClaimState) => {
    setDropped(false);
    setAutoTurn(0);
    setRun((r) => r + 1);
    setState(next);
    if (next === 'reveal') popSound.chime();
  }, []);

  const onTurned = useCallback(() => {
    setDropped(true);
    popSound.thud();
    buzz([20, 40, 60]);
    setTimeout(() => {
      if (mode === 'motor') return setState('motor');
      popSound.pop();
      setState('reveal');
      setTimeout(() => popSound.chime(), 350);
    }, 1500);
  }, [mode]);

  const got = state === 'reveal' || state === 'motor';
  return (
    <PopShell active="claim" title="Asp · Claim (proposal)">
      <main className="pop-stage">
        <section className="pop-hero" aria-label="Machine">
          <PopMachine
            key={run}
            state={machineFor(state, dropped)}
            lockLabel={LOCK_LABEL[state]}
            capsuleColor={COLORWAYS[SAMPLE_EDITION - 1].a}
            autoTurnSignal={autoTurn}
            onTurned={onTurned}
          />
          <DaishiCard gone={got ? [...SAMPLE_GONE_BEFORE, SAMPLE_EDITION] : SAMPLE_GONE_BEFORE} yours={got ? SAMPLE_EDITION : null} />
        </section>
        <section className="pop-panel">
          <PopClaimPanel state={state} mode={mode} onNext={go} onAutoTurn={() => setAutoTurn((n) => n + 1)} />
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
    </PopShell>
  );
}
