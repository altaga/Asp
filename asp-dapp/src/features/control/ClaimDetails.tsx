import React from 'react';
import { GACHA_DEVICE_ID } from '../hire/gateway';
import { PRICE_USDC } from './useCheckoutFlow';

type Props = { isNft: boolean; petitionId?: string | null };

/** Collapsed operator info: device, release command, petition, price. */
export function ClaimDetails({ isNft, petitionId }: Props) {
  return (
    <details className="pop-details">
      <summary>Technical details</summary>
      <dl className="pop-meta">
        <div><dt>Device</dt><dd>{GACHA_DEVICE_ID}</dd></div>
        <div><dt>Release</dt><dd>{isNft ? 'NFT drop (no motor)' : 'DISPENSE_ONCE'}</dd></div>
        <div><dt>Petition</dt><dd>{petitionId || '—'}</dd></div>
        <div><dt>Price</dt><dd>{PRICE_USDC} USDC</dd></div>
      </dl>
    </details>
  );
}
