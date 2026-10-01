import React from 'react';
import { DropTicket } from '../dispenser/DropTicket';
import { PopSteps, type PopStep } from '../dispenser/PopSteps';
import type { GetPhase } from './useGetTicket';

const STEPS: PopStep[] = [
  { jp: '人間証明', en: 'Prove human' },
  { jp: '整理券', en: 'Get ticket' },
  { jp: '受け取り', en: 'Pick up' },
];

type Props = {
  phase: GetPhase;
  ticket: string | null;
  alreadyEnrolled: boolean;
  alreadyClaimed: boolean;
  detail: string | null;
  busy: boolean;
  noun: string;
  claimHref: string;
  onVerify: () => void;
  onCopy: () => void;
  onNext: () => void;
};

/** Right column of Get: intro → World ID → ticket (or already claimed). */
export function GetPanel(p: Props) {
  const hasTicket = p.phase === 'done' && Boolean(p.ticket);
  const step = !hasTicket ? 0 : p.alreadyClaimed ? 2 : 1;
  const title = !hasTicket
    ? <>One human.<br /><em>One item.</em></>
    : p.alreadyClaimed
      ? 'Already got yours.'
      : p.alreadyEnrolled
        ? <>Welcome back. <em>Same ticket.</em></>
        : <>You&apos;re in. <em>It&apos;s held.</em></>;
  const lede = !hasTicket
    ? `Limited run. Bots buy with wallets; fans prove they’re human. Confirm with World ID and the dispenser holds one ${p.noun} for you.`
    : p.alreadyClaimed
      ? `This World ID already claimed its ${p.noun}. Same person, same ticket — no second try.`
      : p.alreadyEnrolled
        ? 'Same person, same code. Keep this one — you don’t get another.'
        : 'This ticket is welded to your World ID. Copy it or take a photo, then bring it to the dispenser — nobody else can use it.';

  return (
    <section className="pop-panel">
      <p className="pop-eyebrow"><b lang="ja">限定ドロップ</b> Limited drop</p>
      <h1 className="pop-title">{title}</h1>
      <p className="pop-lede">{lede}</p>
      <PopSteps steps={STEPS} current={step} />

      {!hasTicket ? (
        <div className="pop-card pop-enter">
          {p.phase === 'error' && p.detail ? <pre className="pop-error">{p.detail}</pre> : null}
          <button type="button" className="pop-btn" disabled={p.busy || p.phase === 'working'} onClick={p.onVerify}>
            {p.phase === 'working' ? 'Opening World ID…' : 'Confirm with World ID'}
          </button>
          <p className="pop-hint" style={{ marginTop: 14 }}>One check · no account · nothing personal stored</p>
        </div>
      ) : (
        <DropTicket code={p.ticket as string} used={p.alreadyClaimed}>
          {!p.alreadyClaimed ? (
            <div className="pop-row" style={{ marginTop: 6 }}>
              <button type="button" className="pop-btn pop-btn-ghost" onClick={p.onCopy}>Copy</button>
              <a className="pop-btn" href={p.claimHref}>Claim →</a>
            </div>
          ) : null}
        </DropTicket>
      )}

      {hasTicket ? (
        <div>
          <button type="button" className="pop-btn pop-btn-ghost" onClick={p.onNext}>Next person in line</button>
          <p className="pop-hint" style={{ marginTop: 8 }}>
            {p.alreadyClaimed ? 'Someone else can enroll — not a second ticket for you' : 'Someone else needs a ticket — yours stays valid'}
          </p>
        </div>
      ) : null}
    </section>
  );
}
