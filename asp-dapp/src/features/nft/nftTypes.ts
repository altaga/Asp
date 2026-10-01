export type NftDrop = {
  tokenId: string;
  edition: string;
  name: string;
  /** data:image/svg+xml;base64,… straight from tokenURI — fully on-chain art. */
  image: string;
  colorway: string | null;
  owner: string;
  contract: string;
  mintTx: string | null;
  tokenUrl: string;
  already: boolean;
};

export type DropStock = {
  total: number;
  remaining: number;
  /** Edition the next paid claim receives; `null` once sold out. */
  next: number | null;
};
