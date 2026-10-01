import React from 'react';
import { PopReveal } from './PopReveal';
import { PopSteps, type PopStep } from './PopSteps';
import { POP_PRICE } from './popTheme';
import { SAMPLE_PAYMENT_TX, SAMPLE_RELEASE_TX, SAMPLE_TICKET, SAMPLE_WALLET, sampleNft } from './popSample';

export type ClaimState = 'ticket' | 'verify' | 'pay' | 'turn' | 'motor' | 'reveal' | 'used';
export type ClaimMode = 'nft' | 'motor';

const STEPS: PopStep[] = [
  { jp: '本人確認', en: 'Same human' },
  { jp: '支払い', en: 'Pay USDC' },
  { jp: '回す', en: 'Turn' },
  { jp: 'ゲット', en: 'Get it' },
];
const STEP_INDEX: Record<ClaimState, number> = { ticket: 0, verify: 0, pay: 1, turn: 2, motor: 3, reveal: 3, used: 0 };

const COPY: Record<ClaimState, { title: React.ReactNode; lede: string }> = {
  ticket: { title: <>Bring your <em>ticket.</em></>, lede: 'Type the code from Get. It only works for the person who earned it.' },
  verify: { title: <>Same human? <em>Prove it.</em></>, lede: 'One more World ID check. If it’s not the same person as the ticket, the machine stays shut.' },
  pay: { title: <>Drop a coin. <em>On Monad.</em></>, lede: `Pay ${POP_PRICE} USDC from your phone wallet. The payment is tagged to this claim, so it can’t be reused.` },
  turn: { title: <>Paid. Now <em>turn it.</em></>, lede: 'Grab the handle and give it one full turn — just like the real machine.' },
  motor: { title: <>Here it <em>comes.</em></>, lede: 'Payment verified on-chain. The kiosk is dropping your capsule — once.' },
  reveal: { title: <>Yours. <em>1 of 10.</em></>, lede: 'A limited edition, minted on Monad and sent to the wallet that paid.' },
  used: { title: <>Already <em>claimed.</em></>, lede: 'This ticket already got its capsule. One human, one capsule — no second spin.' },
};

type Props = { state: ClaimState; mode: ClaimMode; onNext: (s: ClaimState) => void; onAutoTurn: () => void };

/** Right column of /pop/claim, one block per step of the claim. */
export function PopClaimPanel({ state, mode, onNext, onAutoTurn }: Props) {
  const { title, lede } = COPY[state];
  return (
    <>
      <p className="pop-eyebrow"><b lang="ja">{mode === 'nft' ? 'NFTドロップ' : 'カプセル受取'}</b> {mode === 'nft' ? 'NFT drop' : 'Kiosk claim'}</p>
      <h1 className="pop-title">{title}</h1>
      <p className="pop-lede">{lede}</p>
      <PopSteps steps={STEPS} current={STEP_INDEX[state]} />
      <ClaimBody state={state} onNext={onNext} onAutoTurn={onAutoTurn} />
    </>
  );
}

function ClaimBody({ state, onNext, onAutoTurn }: Omit<Props, 'mode'>) {
  if (state === 'reveal') return <PopReveal nft={sampleNft()} paymentTx={SAMPLE_PAYMENT_TX} releaseTx={SAMPLE_RELEASE_TX} />;
  return (
    <div className="pop-card pop-enter" key={state}>
      {state === 'ticket' || state === 'used' ? (
        <>
          <label htmlFor="pop-ticket" className="pop-eyebrow" style={{ color: 'inherit' }}>Ticket</label>
          <input id="pop-ticket" defaultValue={SAMPLE_TICKET} className="pop-ticket-code"
            style={{ width: '100%', margin: '8px 0 16px', padding: '10px 16px', border: '2px solid rgba(35,24,21,.12)', borderRadius: 18, background: '#FFF8EF' }} />
          {state === 'used' ? <p className="pop-stamp" lang="ja" style={{ marginBottom: 14 }}>使用済み USED</p> : null}
          <button type="button" className="pop-btn" onClick={() => onNext('verify')} disabled={state === 'used'}>Continue</button>
        </>
      ) : null}
      {state === 'verify' ? (
        <button type="button" className="pop-btn" onClick={() => onNext('pay')}>Confirm with World ID</button>
      ) : null}
      {state === 'pay' ? (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 56, fontWeight: 900, letterSpacing: -2 }}>{POP_PRICE}</span>
            <span style={{ fontSize: 20, fontWeight: 900 }}>USDC</span>
            <span className="pop-chip pop-chip-violet">◆ Monad</span>
          </div>
          <p className="pop-hint" style={{ textAlign: 'left', marginBottom: 16 }}>
            Wallet connected · <code>{SAMPLE_WALLET.slice(0, 6)}…{SAMPLE_WALLET.slice(-4)}</code> via WalletConnect
          </p>
          <button type="button" className="pop-btn" onClick={() => onNext('turn')}>Pay with wallet</button>
        </>
      ) : null}
      {state === 'turn' ? (
        <>
          <p style={{ margin: '0 0 14px', fontWeight: 900, fontSize: 18 }}>✓ Payment confirmed on Monad</p>
          <button type="button" className="pop-btn pop-btn-ghost" onClick={onAutoTurn}>Turn it for me</button>
        </>
      ) : null}
      {state === 'motor' ? (
        <dl className="pop-meta" style={{ marginTop: 0 }}>
          <div><dt>Release</dt><dd>DISPENSE_ONCE</dd></div>
          <div><dt>Paid</dt><dd>{POP_PRICE} USDC</dd></div>
          <div><dt>Payment tx</dt><dd>{SAMPLE_PAYMENT_TX.slice(0, 8)}…</dd></div>
          <div><dt>Ticket</dt><dd>{SAMPLE_TICKET} · burned</dd></div>
        </dl>
      ) : null}
    </div>
  );
}
