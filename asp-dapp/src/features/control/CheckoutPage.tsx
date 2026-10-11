import React from 'react';
import { ItemReveal } from '../dispenser/ItemReveal';
import { PopSteps } from '../dispenser/PopSteps';
import { readPendingDrop } from '../nft/pendingDrop';
import { useDropStock } from '../nft/useDropStock';
import { WorldVerifyModal } from '../world/WorldVerifyModal';
import { readDemoTicket, saveDemoTicket } from './aspDemoTicket';
import { ClaimActions } from './ClaimActions';
import { ClaimOutcome } from './ClaimOutcome';
import { ClaimTicketCard } from './ClaimTicketCard';
import { CLAIM_STEPS, claimLockLabel, claimMachineState, claimScreen, claimStep, claimTitle } from './claimView';
import { useDemoVariant } from './demoVariant';
import { LiveDispenser } from './LiveDispenser';
import { LiveFrame } from './LiveFrame';
import { usePreviewDrop } from './usePreviewDrop';
import { PRICE_USDC, useCheckoutFlow } from './useCheckoutFlow';
import { variantCopy } from './variantCopy';
import { WalletPayCard } from './WalletPayCard';

const { toast } = require('react-hot-toast');

/** `/claim` and `/test/claim` — ticket → same human → USDC on Monad → the dispenser releases one. */
export function CheckoutPage() {
  const variant = useDemoVariant();
  const copy = variantCopy(variant);
  const isNft = variant.release === 'nft';
  const flow = useCheckoutFlow({ release: variant.release });
  const { stock } = useDropStock(isNft);
  const [draft, setDraft] = React.useState('');
  const [preview] = React.useState(
    () => isNft && typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('preview')
  );
  const demo = usePreviewDrop(preview, stock?.total);

  React.useEffect(() => {
    if (preview || (isNft && readPendingDrop())) return;
    const t = readDemoTicket();
    if (!t) return;
    setDraft(t);
    void flow.loadTicket(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once on mount
  }, []);

  const loadDraft = () => {
    saveDemoTicket(draft);
    void flow.loadTicket(draft);
  };

  const phase = preview ? demo.phase : flow.phase;
  const view = { phase, release: variant.release, hasTicket: Boolean(flow.ticket), dropStuck: Boolean(flow.pendingDrop) };
  const yourNft = preview ? demo.nft : flow.lastHire?.nft ?? null;
  const title = claimTitle(view);
  const used = flow.alreadyClaimed && !flow.pendingDrop;
  const settled = phase === 'executing' || phase === 'done';

  return (
    <LiveFrame active="claim" title={isNft ? 'Asp · Claim (NFT test)' : 'Asp · Claim'}>
      <main className="pop-stage">
        <LiveDispenser
          key={preview ? `preview-${demo.run}` : flow.activePoh?.petition_id || 'idle'}
          state={claimMachineState(view)}
          lockLabel={claimLockLabel(view)}
          screen={claimScreen(view)}
          stock={stock}
          yours={yourNft ? Number(yourNft.tokenId) : null}
        />
        <section className="pop-panel">
          <p className="pop-eyebrow"><b lang="ja">{copy.eyebrowJp}</b> {copy.eyebrow}</p>
          <h1 className="pop-title">{title.lead} <em>{title.accent}</em></h1>
          <p className="pop-lede" aria-live="polite">
            {preview ? 'Preview — sample art, no payment, nothing minted.' : flow.statusText}
          </p>
          <PopSteps steps={CLAIM_STEPS} current={claimStep(view)} />

          {preview ? (
            <>
              {demo.nft ? <ItemReveal nft={demo.nft} price={PRICE_USDC} /> : null}
              <button type="button" className="pop-btn pop-btn-ghost" onClick={demo.replay}>Play again</button>
            </>
          ) : (
            <>
              {!settled ? (
                <ClaimTicketCard draft={draft} onDraft={(v) => { setDraft(v); if (v.trim()) saveDemoTicket(v); }}
                  onContinue={loadDraft} busy={flow.busy} loadedTicket={flow.ticket} ticketReady={flow.ticketReady}
                  used={used} noun={copy.noun} />
              ) : null}
              {!used ? <ClaimActions flow={flow} /> : null}
              {phase === 'awaiting_phone_pay' && flow.kioskPay ? <WalletPayCard payment={flow.kioskPay} onTx={flow.submitTx} /> : null}
              <ClaimOutcome flow={flow} />
            </>
          )}
        </section>
      </main>

      <WorldVerifyModal
        open={flow.worldOpen}
        onOpenChange={flow.setWorldOpen}
        action={flow.enrollAction}
        signal={flow.activePoh?.petition_id || undefined}
        title="Confirm it's you"
        subtitle={`Same World ID as when you got the ticket. That unlocks payment for one ${copy.noun}.`}
        successTitle="Confirmed"
        successSubtitle="Close this to pay."
        onVerified={async (result) => {
          try {
            const out = await flow.onWorldProof(result);
            if (out?.claimAlreadyUsed) return void toast.error('Already claimed — you cannot claim again');
            toast.success('Identity confirmed — ready to pay');
          } catch (e: any) {
            toast.error(e?.message || 'Confirm failed');
            throw e;
          }
        }}
        onError={(msg) => toast.error(msg)}
      />
    </LiveFrame>
  );
}
