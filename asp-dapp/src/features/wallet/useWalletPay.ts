import { useCallback, useEffect, useRef, useState } from 'react';
import { useAccount, useDisconnect, useSendTransaction, useSwitchChain } from 'wagmi';
import { openWalletModal } from './appKit';
import type { KioskPayment } from '../kiosk/kioskPay';

export type WalletPayStage = 'idle' | 'connecting' | 'approve' | 'sent' | 'error';

function readableError(e: any) {
  const msg = String(e?.shortMessage || e?.message || e);
  if (/reject|denied|cancel/i.test(msg)) return 'Payment was rejected in the wallet.';
  return msg;
}

/**
 * Phone wallet pays over WalletConnect: connect (QR) → switch to Monad → send the
 * gateway-built USDC transfer → hand the hash back. Sends at most once per nonce.
 */
export function useWalletPay(payment: KioskPayment | null, onTx: (txHash: string) => Promise<void> | void) {
  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();
  const { disconnect } = useDisconnect();
  const [stage, setStage] = useState<WalletPayStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const wantPay = useRef(false);
  const sentFor = useRef<string | null>(null);

  const send = useCallback(async () => {
    if (!payment || sentFor.current === payment.nonce) return;
    sentFor.current = payment.nonce;
    wantPay.current = false;
    setError(null);
    setStage('approve');
    try {
      if (chainId !== payment.chainId) await switchChainAsync({ chainId: payment.chainId });
      const hash = await sendTransactionAsync({
        chainId: payment.chainId,
        to: payment.to,
        data: payment.data,
        value: 0n,
      });
      setStage('sent');
      await onTx(hash);
      // Shared kiosk screen: drop the session so the next customer pairs their own phone.
      disconnect();
    } catch (e) {
      sentFor.current = null;
      setStage('error');
      setError(readableError(e));
    }
  }, [chainId, disconnect, onTx, payment, sendTransactionAsync, switchChainAsync]);

  useEffect(() => {
    if (isConnected && wantPay.current) void send();
  }, [isConnected, send]);

  useEffect(() => {
    sentFor.current = null;
    wantPay.current = false;
    setStage('idle');
    setError(null);
  }, [payment?.nonce]);

  const start = useCallback(async () => {
    if (!payment) return;
    wantPay.current = true;
    if (isConnected) return send();
    setStage('connecting');
    try {
      await openWalletModal();
    } catch (e) {
      wantPay.current = false;
      setStage('error');
      setError(readableError(e));
    }
  }, [isConnected, payment, send]);

  return { stage, error, address: address || null, isConnected, start, disconnect };
}
