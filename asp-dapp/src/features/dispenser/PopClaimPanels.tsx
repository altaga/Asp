import React from 'react';
import { ItemReveal } from './ItemReveal';
import { PopSteps, type PopStep } from './PopSteps';
import { POP_PRICE } from './popTheme';
import { ItemReceived } from './ItemReceived';
import { SAMPLE_PAYMENT_TX, SAMPLE_TICKET, SAMPLE_WALLET, sampleNft } from './popSample';

export type ClaimState = 'ticket' | 'verify' | 'pay' | 'dispense' | 'motor' | 'reveal' | 'used';
export type ClaimMode = 'nft' | 'motor';

const STEPS: PopStep[] = [
  { jp: '本人照合', en: 'Same human' },
  { jp: '支払い', en: 'Pay USDC' },
  { jp: '払い出し', en: 'Dispense' },
  { jp: '受け取り', en: 'Pick up' },
];
const STEP_INDEX: Record<ClaimState, number> = { ticket: 0, verify: 0, pay: 1, dispense: 2, motor: 3, reveal: 3, used: 0 };

const COPY: Record<ClaimState, { title: React.ReactNode; lede: string }> = {
  ticket: { title: <>Bring your <em>ticket.</em></>, lede: 'Type the code from Get. It only works for the person who earned it.' },
  verify: { title: <>Same human? <em>Prove it.</em></>, lede: 'One more World ID check. If it’s not the same person as the ticket, the dispenser stays shut.' },
  pay: { title: <>Pay once. <em>On Monad.</em></>, lede: `Pay ${POP_PRICE} USDC from your phone wallet. The payment is tagged to this claim, so it can’t be reused.` },
  dispense: { title: <>Paid. <em>Press it.</em></>, lede: 'Hit PUSH on the dispenser. The next item in line drops into the tray — you already know which one.' },
  motor: { title: <>Yours. <em>Limited.</em></>, lede: 'Payment verified on-chain. The machine released one limited edition item — once.' },
  reveal: { title: <>Yours. <em>Numbered.</em></>, lede: 'A limited edition item, minted on Monad and sent to the wallet that paid.' },
  used: { title: <>Already <em>claimed.</em></>, lede: 'This ticket already took its item. One human, one item — no second press.' },
};

type Props = { state: ClaimState; mode: ClaimMode; onNext: (s: ClaimState) => void; onDispense: () => void };

/** Right column of /pop/claim, one block per step of the claim. */
export function PopClaimPanel({ state, mode, onNext, onDispense }: Props) {
  const { title, lede } = COPY[state];
  return (
    <>
      <p className="pop-eyebrow"><b lang="ja">{mode === 'nft' ? 'NFTドロップ' : '会場受け取り'}</b> {mode === 'nft' ? 'NFT drop' : 'Venue pickup'}</p>
      <h1 className="pop-title">{title}</h1>
      <p className="pop-lede">{lede}</p>
      <PopSteps steps={STEPS} current={STEP_INDEX[state]} />
      <ClaimBody state={state} onNext={onNext} onDispense={onDispense} />
    </>
  );
}

function ClaimBody({ state, onNext, onDispense }: Omit<Props, 'mode'>) {
  if (state === 'reveal') return <ItemReveal nft={sampleNft()} price={POP_PRICE} paymentTx={SAMPLE_PAYMENT_TX} paymentUrl="#" />;
  if (state === 'motor') {
    return <ItemReceived txHash={SAMPLE_PAYMENT_TX} txUrl="#" payer={SAMPLE_WALLET} device="ok" price={POP_PRICE} />;
  }
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
          <button type="button" className="pop-btn" onClick={() => onNext('dispense')}>Pay with wallet</button>
        </>
      ) : null}
      {state === 'dispense' ? (
        <>
          <p style={{ margin: '0 0 14px', fontWeight: 900, fontSize: 18 }}>✓ Payment confirmed on Monad</p>
          <button type="button" className="pop-btn" onClick={onDispense}>Dispense my item</button>
        </>
      ) : null}
    </div>
  );
}
