import React from 'react';
import { aspBrand } from './AspDemoChrome';
import { useWalletPay } from '../wallet/useWalletPay';
import { formatUsdc, type KioskPayment } from '../kiosk/kioskPay';

type Props = {
  payment: KioskPayment;
  /** Called with the hash the phone wallet returned; the flow hands it to the gateway. */
  onTx: (txHash: string) => Promise<void> | void;
  hint?: string;
};

function shortAddr(a?: string | null) {
  if (!a) return '';
  return a.length <= 14 ? a : `${a.slice(0, 6)}…${a.slice(-4)}`;
}

const STAGE_TEXT: Record<string, string> = {
  idle: 'Tap below, scan the WalletConnect QR with your phone wallet, then approve the USDC payment.',
  connecting: 'Scan the QR with your phone wallet (MetaMask, Rainbow, Trust, …).',
  approve: 'Approve the USDC payment on your phone.',
  sent: 'Payment sent — waiting for Monad to confirm…',
};

export function WalletPayPanel({ payment, onTx, hint }: Props) {
  const pay = useWalletPay(payment, onTx);
  const busy = pay.stage === 'connecting' || pay.stage === 'approve' || pay.stage === 'sent';

  return (
    <div style={styles.box} aria-label="Pay with phone wallet" aria-live="polite">
      <div style={styles.title}>Pay {formatUsdc(payment.amount)} USDC on your phone</div>
      <p style={styles.hint}>
        {(pay.stage === 'idle' || pay.stage === 'error') && hint
          ? hint
          : STAGE_TEXT[pay.stage] || STAGE_TEXT.idle}
      </p>

      {pay.error ? (
        <p style={styles.error} role="alert">
          {pay.error}
        </p>
      ) : null}

      <div style={styles.actions}>
        <button type="button" style={styles.primary} disabled={busy} onClick={() => void pay.start()}>
          {pay.stage === 'error' ? 'Try again' : pay.isConnected ? 'Pay with connected wallet' : 'Pay with phone wallet'}
        </button>
        {pay.isConnected && pay.stage !== 'sent' ? (
          <button type="button" style={styles.ghost} onClick={() => pay.disconnect()}>
            Use another wallet
          </button>
        ) : null}
      </div>

      <p style={styles.meta}>
        Monad · USDC → {shortAddr(payment.receiver)}
        {pay.address ? ` · from ${shortAddr(pay.address)}` : ''}
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  box: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    border: `1px solid ${aspBrand.line}`,
    background: aspBrand.paper,
    textAlign: 'center' as const,
  },
  title: { fontSize: aspBrand.type.body, fontWeight: 700 },
  hint: {
    margin: '6px 0 0',
    fontSize: aspBrand.type.hint,
    lineHeight: 1.45,
    color: aspBrand.muted,
  },
  error: {
    margin: '10px 0 0',
    fontSize: aspBrand.type.hint,
    color: aspBrand.danger,
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
    gap: 8,
    marginTop: 14,
  },
  primary: {
    border: 'none',
    background: aspBrand.ink,
    color: '#fff',
    borderRadius: 12,
    padding: '13px 18px',
    fontSize: aspBrand.type.button,
    fontWeight: 650,
    cursor: 'pointer',
    fontFamily: aspBrand.font,
  },
  ghost: {
    border: `1px solid ${aspBrand.lineStrong}`,
    background: 'transparent',
    color: aspBrand.muted,
    borderRadius: 12,
    padding: '13px 14px',
    fontSize: aspBrand.type.button,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: aspBrand.font,
  },
  meta: {
    margin: '12px 0 0',
    fontSize: aspBrand.type.meta,
    fontFamily: aspBrand.mono,
    color: aspBrand.muted,
  },
};
