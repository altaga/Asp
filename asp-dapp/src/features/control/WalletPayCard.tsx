import React from 'react';
import { formatUsdc, type KioskPayment } from '../kiosk/kioskPay';
import { useWalletPay } from '../wallet/useWalletPay';

type Props = {
  payment: KioskPayment;
  /** Called with the hash the phone wallet returned; the flow hands it to the gateway. */
  onTx: (txHash: string) => Promise<void> | void;
};

function shortAddr(a?: string | null) {
  if (!a) return '';
  return a.length <= 14 ? a : `${a.slice(0, 6)}…${a.slice(-4)}`;
}

const STAGE_TEXT: Record<string, string> = {
  idle: 'You’re already verified here — scan the WalletConnect QR with your phone wallet, then approve the USDC payment.',
  connecting: 'Scan the QR with your phone wallet (MetaMask, Rainbow, Trust, …).',
  approve: 'Approve the USDC payment on your phone.',
  sent: 'Payment sent — waiting for Monad to confirm…',
};

/** USDC on Monad from a phone wallet over WalletConnect — dispenser styling of WalletPayPanel. */
export function WalletPayCard({ payment, onTx }: Props) {
  const pay = useWalletPay(payment, onTx);
  const busy = pay.stage === 'connecting' || pay.stage === 'approve' || pay.stage === 'sent';

  return (
    <div className="pop-card pop-enter" aria-label="Pay with phone wallet" aria-live="polite">
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 56, fontWeight: 900, letterSpacing: -2 }}>{formatUsdc(payment.amount)}</span>
        <span style={{ fontSize: 20, fontWeight: 900 }}>USDC</span>
        <span className="pop-chip pop-chip-violet">◆ Monad</span>
      </div>
      <p className="pop-hint" style={{ textAlign: 'left', marginBottom: 16 }}>
        {STAGE_TEXT[pay.stage] || STAGE_TEXT.idle}
      </p>
      {pay.error ? <p className="pop-error" role="alert">{pay.error}</p> : null}
      <button type="button" className="pop-btn" disabled={busy} onClick={() => void pay.start()}>
        {pay.stage === 'error' ? 'Try again' : pay.isConnected ? 'Pay with connected wallet' : 'Pay with phone wallet'}
      </button>
      {pay.isConnected && pay.stage !== 'sent' ? (
        <button type="button" className="pop-btn pop-btn-ghost" style={{ marginTop: 10 }} onClick={() => pay.disconnect()}>
          Use another wallet
        </button>
      ) : null}
      <p className="pop-hint" style={{ marginTop: 12 }}>
        USDC → {shortAddr(payment.receiver)}{pay.address ? ` · from ${shortAddr(pay.address)}` : ''}
      </p>
    </div>
  );
}
