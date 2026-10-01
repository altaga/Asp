import React, { useCallback, useEffect, useRef, useState } from 'react';
import { WalletPayPanel } from './WalletPayPanel';
import {
  createLabPayment,
  getPaymentStatus,
  submitPaymentTx,
  type KioskPayment,
} from '../kiosk/kioskPay';
import { explorerTxUrl } from '../wallet/appKit';
import { theme } from '../../theme/tokens';

const { toast } = require('react-hot-toast');

type LogLine = { t: string; msg: string; kind?: 'ok' | 'err' | 'info' };

function stamp() {
  return new Date().toISOString().slice(11, 23);
}

/**
 * Pay-only lab — no World, no petition, no motor.
 * Confirms the WalletConnect cycle: pay request → phone wallet → gateway sees the USDC transfer.
 */
export function KioskLabPanel() {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [busy, setBusy] = useState(false);
  const [payment, setPayment] = useState<KioskPayment | null>(null);
  const [intentStatus, setIntentStatus] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  const logEnd = useRef<HTMLDivElement | null>(null);

  const push = useCallback((msg: string, kind: LogLine['kind'] = 'info') => {
    setLogs((prev) => [...prev.slice(-80), { t: stamp(), msg, kind }]);
  }, []);

  useEffect(() => {
    logEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const createPayRequest = async () => {
    setBusy(true);
    setPayment(null);
    setTxHash(null);
    setExplorerUrl(null);
    setIntentStatus(null);
    try {
      push('POST /api/kiosk/lab-intent (no World)');
      const p = await createLabPayment();
      setPayment(p);
      setIntentStatus('pending');
      push(`Pay request ready nonce=${p.nonce.slice(0, 8)}… amount=${p.amount}`, 'ok');
      toast.success('Pay from your phone wallet');
    } catch (e: any) {
      push(String(e?.message || e), 'err');
      toast.error(e?.message || 'Lab intent failed');
    } finally {
      setBusy(false);
    }
  };

  const onTx = useCallback(
    async (hash: string) => {
      if (!payment) return;
      setTxHash(hash);
      push(`wallet sent tx ${hash}`);
      try {
        const out = await submitPaymentTx(payment.nonce, hash);
        push(out.paid ? 'gateway: paid' : `gateway: ${out.error || 'waiting for receipt'}`, out.paid ? 'ok' : 'info');
      } catch (e: any) {
        push(String(e?.message || e), 'err');
      }
      setPolling(true);
    },
    [payment, push]
  );

  useEffect(() => {
    if (!polling || !payment) return;
    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      try {
        const { intent } = await getPaymentStatus(payment.nonce);
        setIntentStatus(intent?.status || null);
        if (intent?.status === 'paid' || intent?.status === 'dispensed') {
          setExplorerUrl(intent.explorerUrl || null);
          setPolling(false);
          push(`PAID — USDC transfer verified${intent.payer ? ` from ${intent.payer}` : ''}`, 'ok');
          toast.success('Payment confirmed on Monad');
        } else if (intent?.last_error) {
          push(`gateway: ${intent.last_error}`, 'err');
        }
      } catch {
        // keep polling
      }
    };

    void tick();
    const id = setInterval(() => void tick(), 2000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [polling, payment, push]);

  const paid = intentStatus === 'paid' || intentStatus === 'dispensed';

  return (
    <div style={styles.panel}>
      <div style={styles.head}>
        <div>
          <div style={styles.eyebrow}>Lab · pay only</div>
          <h1 style={styles.title}>Phone wallet pay</h1>
          <p style={styles.lede}>
            No World here. Just the pay cycle: pay request → WalletConnect on the phone → USDC
            transfer on Monad → gateway marks it <strong>paid</strong>. Receiver = gateway payTo.
          </p>
        </div>
      </div>

      <ol style={styles.steps}>
        <li>Create a pay request (lab intent, no PoH)</li>
        <li>Connect a phone wallet over WalletConnect and approve the USDC transfer</li>
        <li>This page polls every 2s until the gateway verifies the transfer</li>
      </ol>

      <div style={styles.meta}>
        <div>
          <span style={styles.metaLabel}>Nonce</span>
          <div style={styles.metaVal}>{payment ? `${payment.nonce.slice(0, 13)}…` : '—'}</div>
        </div>
        <div>
          <span style={styles.metaLabel}>Status</span>
          <div style={styles.metaVal}>{intentStatus || '—'}</div>
        </div>
        <div>
          <span style={styles.metaLabel}>Amount</span>
          <div style={styles.metaVal}>{payment ? `${payment.amount} atomic USDC` : '—'}</div>
        </div>
        <div>
          <span style={styles.metaLabel}>Poll</span>
          <div style={styles.metaVal}>{polling ? 'ON · 2s' : 'off'}</div>
        </div>
      </div>

      <div style={styles.actions}>
        <button
          type="button"
          style={styles.primary}
          disabled={busy}
          onClick={() => void createPayRequest()}
        >
          Create pay request
        </button>
        {polling ? (
          <button
            type="button"
            style={styles.ghost}
            onClick={() => {
              setPolling(false);
              push('poll stopped');
            }}
          >
            Stop poll
          </button>
        ) : null}
      </div>

      {payment && !paid ? <WalletPayPanel payment={payment} onTx={onTx} /> : null}

      {paid && txHash ? (
        <div style={styles.paidBox}>
          <div style={styles.paidTitle}>Monad pay OK</div>
          <a
            href={explorerUrl || explorerTxUrl(txHash)}
            target="_blank"
            rel="noreferrer"
            style={styles.link}
          >
            {txHash.slice(0, 14)}…{txHash.slice(-8)}
          </a>
        </div>
      ) : null}

      <div style={styles.logBox} aria-label="Lab log">
        {logs.length === 0 ? (
          <div style={styles.logEmpty}>Logs appear here as you step through the pay cycle.</div>
        ) : (
          logs.map((l, i) => (
            <div
              key={`${l.t}-${i}`}
              style={{
                ...styles.logLine,
                color:
                  l.kind === 'err'
                    ? theme.danger
                    : l.kind === 'ok'
                      ? theme.success
                      : theme.textSecondary,
              }}
            >
              <span style={styles.logTime}>{l.t}</span> {l.msg}
            </div>
          ))
        )}
        <div ref={logEnd} />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: theme.radius,
    padding: 22,
    boxShadow: theme.shadowSoft,
  },
  head: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 650,
    letterSpacing: 0.06,
    textTransform: 'uppercase' as const,
    color: theme.warnText,
  },
  title: {
    margin: '4px 0 8px',
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: -0.4,
  },
  lede: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.5,
    color: theme.textSecondary,
    maxWidth: 520,
  },
  steps: {
    margin: '0 0 16px',
    paddingLeft: 18,
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 1.55,
  },
  meta: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    marginBottom: 14,
    paddingTop: 12,
    borderTop: `1px solid ${theme.border}`,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: 650,
    color: theme.textTertiary,
    textTransform: 'uppercase' as const,
  },
  metaVal: {
    fontSize: 12,
    fontFamily: theme.mono,
    wordBreak: 'break-all' as const,
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 8,
    marginBottom: 16,
  },
  primary: {
    border: 'none',
    background: theme.accent,
    color: '#fff',
    borderRadius: 980,
    padding: '10px 16px',
    fontSize: 13,
    fontWeight: 650,
    cursor: 'pointer',
    fontFamily: theme.font,
  },
  ghost: {
    border: `1px solid ${theme.borderStrong}`,
    background: 'transparent',
    color: theme.textSecondary,
    borderRadius: 980,
    padding: '10px 14px',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: theme.font,
  },
  paidBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 8,
    padding: 14,
    margin: '14px 0',
    borderRadius: theme.radiusSm,
    background: 'rgba(52,199,89,0.08)',
    border: '1px solid rgba(52,199,89,0.25)',
  },
  paidTitle: { fontSize: 14, fontWeight: 650 },
  link: { color: theme.accent, fontSize: 13, fontWeight: 600, textDecoration: 'none' },
  logBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: theme.radiusSm,
    background: '#111',
    color: '#c8c8c8',
    fontFamily: theme.mono,
    fontSize: 11,
    maxHeight: 220,
    overflow: 'auto',
  },
  logEmpty: { color: '#9A9A9A' },
  logLine: { marginBottom: 4, wordBreak: 'break-all' as const },
  logTime: { color: '#9A9A9A', marginRight: 6 },
};
