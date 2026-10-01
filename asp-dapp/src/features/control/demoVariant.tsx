import React, { createContext, useContext } from 'react';
import type { ReleaseKind } from '../kiosk/kioskPay';

/**
 * Same Get → Claim screens, two endings: the live gachapon motor, or the `/test` NFT drop
 * (gachapon animation + one limited edition minted to the payer on Monad).
 */
export type DemoVariant = {
  basePath: '' | '/test';
  release: ReleaseKind;
};

const LIVE: DemoVariant = { basePath: '', release: 'motor' };
export const NFT_TEST: DemoVariant = { basePath: '/test', release: 'nft' };

const DemoVariantContext = createContext<DemoVariant>(LIVE);

export function DemoVariantProvider({ value, children }: { value: DemoVariant; children: React.ReactNode }) {
  return <DemoVariantContext.Provider value={value}>{children}</DemoVariantContext.Provider>;
}

export function useDemoVariant() {
  return useContext(DemoVariantContext);
}

/** `/` and `/claim` under the active variant (`/test`, `/test/claim`). */
export function variantHref(variant: DemoVariant, path: '/' | '/claim') {
  if (!variant.basePath) return path;
  return path === '/' ? variant.basePath : `${variant.basePath}${path}`;
}
