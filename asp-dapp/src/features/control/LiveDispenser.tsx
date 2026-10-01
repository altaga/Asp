import React from 'react';
import { DispenserMachine, type MachineState } from '../dispenser/DispenserMachine';
import { StockMeter } from '../dispenser/StockMeter';
import type { DropStock } from '../nft/nftTypes';
import { useDemoVariant } from './demoVariant';
import { variantCopy } from './variantCopy';

type Props = {
  state: MachineState;
  lockLabel?: string;
  screen?: string;
  /** NFT ending only — live run from AspDrop. */
  stock?: DropStock | null;
  /** NFT ending only — the edition this person received. */
  yours?: number | null;
};

/**
 * Hero column of the live screens. The motor ending shows sealed boxes and no count (we don't
 * track physical stock); the NFT ending shows the real numbered run and what comes out next.
 */
export function LiveDispenser({ state, lockLabel, screen, stock, yours }: Props) {
  const copy = variantCopy(useDemoVariant());
  const edition = copy.look === 'edition' && stock;
  return (
    <section className="pop-hero" aria-label="Dispenser">
      <DispenserMachine
        state={state}
        look={edition ? 'edition' : 'mystery'}
        total={edition ? stock.total : undefined}
        next={edition ? yours ?? stock.next : undefined}
        lockLabel={lockLabel}
        screen={screen}
      />
      {edition ? <StockMeter total={stock.total} next={stock.next} yours={yours} /> : null}
    </section>
  );
}
