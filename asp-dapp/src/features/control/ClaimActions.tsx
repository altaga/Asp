import React from 'react';
import type { useCheckoutFlow } from './useCheckoutFlow';

type Flow = ReturnType<typeof useCheckoutFlow>;

/** Whatever the claim needs next: start, World ID, pay again, cancel. Hidden when nothing applies. */
export function ClaimActions({ flow }: { flow: Flow }) {
  const { phase, busy, activePoh } = flow;
  const canRequest =
    !busy && flow.ticketReady && (phase === 'idle' || phase === 'error' || phase === 'revoked' || phase === 'denied');
  const canVerify = !busy && Boolean(activePoh) && (phase === 'awaiting_human' || activePoh?.status === 'pending_human');
  const canRetryQr = !busy && activePoh?.status === 'authorized' && (phase === 'authorized' || phase === 'error');
  const canRevoke =
    !busy && Boolean(activePoh) && (phase === 'awaiting_human' || phase === 'authorized' || phase === 'awaiting_phone_pay');
  const working = busy && phase !== 'awaiting_phone_pay' && phase !== 'executing';

  if (!canRequest && !canVerify && !canRetryQr && !canRevoke && !working && !flow.errorDetail) return null;

  return (
    <div className="pop-card pop-enter">
      {flow.errorDetail ? <pre className="pop-error">{flow.errorDetail}</pre> : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {canRequest ? (
          <button type="button" className="pop-btn" onClick={() => void flow.requestCapsule()}>
            {phase === 'idle' ? 'Start claim' : 'Start claim again'}
          </button>
        ) : null}
        {canVerify ? (
          <>
            <button type="button" className="pop-btn" onClick={() => flow.openWorldVerify()}>Confirm with World ID</button>
            <button type="button" className="pop-btn pop-btn-ghost" onClick={() => void flow.skipWorld()}>
              Skip World (demo)
            </button>
          </>
        ) : null}
        {canRetryQr ? (
          <button type="button" className="pop-btn pop-btn-ghost" onClick={() => flow.retryQr()}>Pay again</button>
        ) : null}
        {working ? <button type="button" className="pop-btn" disabled>Working…</button> : null}
        {canRevoke ? (
          <button type="button" className="pop-btn pop-btn-ghost" onClick={() => void flow.revoke()}>Cancel claim</button>
        ) : null}
      </div>
    </div>
  );
}
