import React from 'react';
import { CapsuleTicket } from './CapsuleTicket';
import { PopSteps, type PopStep } from './PopSteps';
import { SAMPLE_TICKET } from './popSample';

export type GetState = 'ready' | 'verifying' | 'ticket' | 'used';

const STEPS: PopStep[] = [
  { jp: '本人確認', en: 'Prove human' },
  { jp: 'チケット', en: 'Get ticket' },
  { jp: '回す', en: 'Claim & turn' },
];

const STEP_INDEX: Record<GetState, number> = { ready: 0, verifying: 0, ticket: 1, used: 2 };

type Props = { state: GetState; onVerify: () => void; onNext: () => void };

/** Right column of /pop: intro → World check → ticket (or already used). */
export function PopGetPanel({ state, onVerify, onNext }: Props) {
  return (
    <>
      <p className="pop-eyebrow"><b lang="ja">限定ドロップ</b> Limited drop</p>
      <h1 className="pop-title">
        {state === 'used' ? 'Already got yours.' : state === 'ticket' ? <>You&apos;re in. <em>Keep it.</em></> : <>One human.<br /><em>One capsule.</em></>}
      </h1>
      <p className="pop-lede">
        {state === 'used'
          ? 'This World ID already claimed its capsule. Same person, same ticket — no second try.'
          : state === 'ticket'
            ? 'This ticket is welded to your World ID. Bring it to the machine — nobody else can use it.'
            : 'Bots buy with wallets. Fans prove they’re human. Confirm with World ID and the machine saves one capsule for you.'}
      </p>
      <PopSteps steps={STEPS} current={STEP_INDEX[state]} />

      {state === 'ready' ? (
        <div className="pop-card pop-enter">
          <button type="button" className="pop-btn" onClick={onVerify}>Confirm with World ID</button>
          <p className="pop-hint" style={{ marginTop: 14 }}>One check · no account · nothing personal stored</p>
        </div>
      ) : null}

      {state === 'verifying' ? (
        <div className="pop-card pop-enter" style={{ display: 'flex', alignItems: 'center', gap: 18 }} aria-live="polite">
          <div className="pop-spinner" aria-hidden />
          <div>
            <b style={{ fontSize: 18 }}>Waiting for World ID…</b>
            <p className="pop-hint" style={{ textAlign: 'left', marginTop: 4 }}>Scan the QR with World App to continue</p>
          </div>
        </div>
      ) : null}

      {state === 'ticket' || state === 'used' ? (
        <CapsuleTicket code={SAMPLE_TICKET} used={state === 'used'}>
          {state === 'ticket' ? (
            <div className="pop-row" style={{ marginTop: 6 }}>
              <button type="button" className="pop-btn pop-btn-ghost">Copy</button>
              <a className="pop-btn" href="/pop/claim">Claim →</a>
            </div>
          ) : null}
        </CapsuleTicket>
      ) : null}

      {state === 'ticket' || state === 'used' ? (
        <button type="button" className="pop-btn pop-btn-ghost" onClick={onNext}>Next person in line</button>
      ) : null}
    </>
  );
}
