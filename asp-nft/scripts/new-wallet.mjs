import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { DAPP_ENV, NFT_ENV, readEnvValue, upsertEnv } from './lib.mjs';

// Fresh minter wallet for the drop. The key only ever lands in gitignored .env files.
const existing = readEnvValue(NFT_ENV, 'NFT_MINTER_PRIVATE_KEY');
if (/^0x[0-9a-fA-F]{64}$/.test(existing)) {
  console.log('Minter already exists:', privateKeyToAccount(existing).address);
  process.exit(0);
}

const key = generatePrivateKey();
upsertEnv(NFT_ENV, 'NFT_MINTER_PRIVATE_KEY', key);
upsertEnv(DAPP_ENV, 'NFT_MINTER_PRIVATE_KEY', key);
console.log('New minter wallet:', privateKeyToAccount(key).address);
console.log('Key saved to asp-nft/.env and asp-dapp/.env (both gitignored). Fund it with MON on Monad.');
