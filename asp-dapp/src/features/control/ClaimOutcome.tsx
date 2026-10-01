import React from 'react';
import { ItemReceived } from '../dispenser/ItemReceived';
import { ItemReveal } from '../dispenser/ItemReveal';
import { explorerTxUrl } from '../wallet/appKit';
import type { useCheckoutFlow } from './useCheckoutFlow';
import { PRICE_USDC } from './useCheckoutFlow';

type Flow = ReturnType<typeof useCheckoutFlow>;

function deviceStatus(receipt: unknown): string {
  if (!receipt || typeof receipt !== 'object') return '';
  const r = receipt as any;
  if (r.status) return String(r.status);
  if (r.ok === true) return 'ok';
  if (r.task) return String(r.task);
  return '';
}

/** End of the claim: the NFT edition (test), the item notice (live), or the paid-drop retry. */
export function ClaimOutcome({ flow }: { flow: Flow }) {
  const hire = flow.lastHire;
  const txUrl = hire?.txHash ? hire.explorerUrl || explorerTxUrl(hire.txHash) : null;

  if (flow.release === 'nft' && flow.phase === 'error' && flow.pendingDrop) {
    return (
      <div className="pop-card pop-enter">
        <p className="pop-status">You already paid — the drop didn’t land yet. Retrying never charges again.</p>
        <button type="button" className="pop-btn" disabled={flow.busy} onClick={flow.retryDrop}>
          {flow.busy ? 'Retrying…' : 'Retry the drop'}
        </button>
      </div>
    );
  }

  if (flow.phase !== 'done' || !hire) return null;

  if (flow.release === 'nft') {
    return hire.nft ? <ItemReveal nft={hire.nft} price={PRICE_USDC} paymentTx={hire.txHash} paymentUrl={txUrl} /> : null;
  }
  return (
    <ItemReceived
      txHash={hire.txHash}
      txUrl={txUrl}
      payer={hire.payer}
      device={deviceStatus(hire.deviceReceipt) || 'ok'}
      price={PRICE_USDC}
    />
  );
}
