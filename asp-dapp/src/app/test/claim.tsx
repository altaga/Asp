import React from 'react';
import { CheckoutPage } from '../../features/control/CheckoutPage';
import { DemoVariantProvider, NFT_TEST } from '../../features/control/demoVariant';

/** /test/claim — ticket, World, USDC on Monad, then the dispenser drops one NFT edition. */
export default function TestClaimRoute() {
  return (
    <DemoVariantProvider value={NFT_TEST}>
      <CheckoutPage />
    </DemoVariantProvider>
  );
}
