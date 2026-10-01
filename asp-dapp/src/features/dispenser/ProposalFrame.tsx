import React from 'react';
import { DispenserShell } from './DispenserShell';
import { POP_EVENT } from './popTheme';

type Props = { active: 'get' | 'claim'; title: string; children: React.ReactNode };

/** /pop proposal pages: the real shell, pointed at the proposal routes, with sample-data footer. */
export function ProposalFrame({ active, title, children }: Props) {
  return (
    <DispenserShell
      active={active}
      title={title}
      getHref="/pop"
      claimHref="/pop/claim"
      footer={
        <>
          <span>{POP_EVENT} · one human, one item</span>
          <span>Design proposal — sample data</span>
        </>
      }
    >
      {children}
    </DispenserShell>
  );
}
