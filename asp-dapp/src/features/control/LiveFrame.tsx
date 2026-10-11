import React from 'react';
import { DispenserShell } from '../dispenser/DispenserShell';
import { POP_EVENT } from '../dispenser/popTheme';
import { useDemoVariant, variantHref } from './demoVariant';

type Props = {
  active: 'get' | 'claim';
  title: string;
  children: React.ReactNode;
};

/** Live demo frame (`/`, `/claim`, `/test…`): dispenser shell with variant links. */
export function LiveFrame({ active, title, children }: Props) {
  const variant = useDemoVariant();
  return (
    <DispenserShell
      active={active}
      title={title}
      getHref={variantHref(variant, '/')}
      claimHref={variantHref(variant, '/claim')}
      badge={variant.release === 'nft' ? 'NFT test' : undefined}
      footer={<span>{POP_EVENT} · one human, one item</span>}
    >
      {children}
    </DispenserShell>
  );
}
