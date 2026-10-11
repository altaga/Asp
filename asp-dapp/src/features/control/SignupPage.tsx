import React from 'react';
import { useDropStock } from '../nft/useDropStock';
import { WorldVerifyModal } from '../world/WorldVerifyModal';
import { useDemoVariant, variantHref } from './demoVariant';
import { GetPanel } from './GetPanel';
import { LiveDispenser } from './LiveDispenser';
import { LiveFrame } from './LiveFrame';
import { useGetTicket } from './useGetTicket';
import { variantCopy } from './variantCopy';

/** `/` and `/test` — prove human with World ID, get the ticket that lets this person claim one item. */
export function SignupPage() {
  const variant = useDemoVariant();
  const copy = variantCopy(variant);
  const get = useGetTicket();
  const { stock } = useDropStock(variant.release === 'nft');
  const held = get.phase === 'done' && get.ticket && !get.alreadyClaimed;

  return (
    <LiveFrame active="get" title={variant.release === 'nft' ? 'Asp · Get (NFT test)' : 'Asp · Get'}>
      <main className="pop-stage">
        <LiveDispenser
          state="locked"
          lockLabel={held ? 'Ticket ready — go claim' : get.alreadyClaimed ? 'Already claimed' : 'Prove you’re human to unlock'}
          stock={stock}
        />
        <GetPanel
          phase={get.phase}
          ticket={get.ticket}
          alreadyEnrolled={get.alreadyEnrolled}
          alreadyClaimed={get.alreadyClaimed}
          detail={get.detail}
          busy={get.busy}
          noun={copy.noun}
          claimHref={variantHref(variant, '/claim')}
          onVerify={get.startWorld}
          onCopy={() => void get.copyTicket()}
          onNext={get.nextPerson}
        />
      </main>

      <WorldVerifyModal
        open={get.worldOpen}
        onOpenChange={get.onWorldOpenChange}
        action={get.enrollAction}
        signal="asp-enroll"
        title="Confirm with World ID"
        subtitle="One check. One ticket. Only you can claim it later."
        successTitle="You're in"
        successSubtitle="Close this to see your ticket."
        onVerified={get.onVerified}
        onError={get.onWorldError}
      />
    </LiveFrame>
  );
}
