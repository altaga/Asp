import type { ItemLook } from '../dispenser/ShelfItem';
import type { DemoVariant } from './demoVariant';

/** What each ending calls the thing you get, and how the dispenser draws it. */
export type VariantCopy = {
  noun: string;
  look: ItemLook;
  eyebrowJp: string;
  eyebrow: string;
};

export function variantCopy(variant: DemoVariant): VariantCopy {
  return variant.release === 'nft'
    ? { noun: 'edition', look: 'edition', eyebrowJp: 'NFTドロップ', eyebrow: 'NFT drop' }
    : { noun: 'item', look: 'mystery', eyebrowJp: '限定アイテム', eyebrow: 'Limited edition item' };
}
