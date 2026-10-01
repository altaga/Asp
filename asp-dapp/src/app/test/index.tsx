import React from 'react';
import { SignupPage } from '../../features/control/SignupPage';
import { DemoVariantProvider, NFT_TEST } from '../../features/control/demoVariant';

/** /test — same Get flow; the ticket later claims an NFT drop instead of the motor. */
export default function TestGetRoute() {
  return (
    <DemoVariantProvider value={NFT_TEST}>
      <SignupPage />
    </DemoVariantProvider>
  );
}
