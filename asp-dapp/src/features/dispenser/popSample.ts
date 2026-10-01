import { previewNft } from '../nft/nftArt';
import type { NftDrop } from '../nft/nftTypes';

/** Proposal-only sample data — nothing here touches World, the gateway or Monad. */
export const SAMPLE_TICKET = 'ASP-7K2Q';
export const SAMPLE_WALLET = '0x7a3f5E21c09B4d8A11fE6b3C2d9480aB19e4c91e';
export const SAMPLE_PAYMENT_TX = '0x9f2c41d07be3a8e5c6f1b0d2a4e7c93158f6b2a1';
export const SAMPLE_TOTAL = 10;
export const SAMPLE_EDITION = 3;

export function sampleNft(): NftDrop {
  return {
    ...previewNft(SAMPLE_EDITION),
    owner: SAMPLE_WALLET,
    contract: '0x942c1a378b961fb7a95b83ecaf55fecee42c6187',
  };
}
