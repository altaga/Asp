import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { monad } from 'viem/chains';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const NFT_ENV = join(ROOT, '.env');
export const DAPP_ENV = join(ROOT, '..', 'asp-dapp', '.env');
export const EXPLORER = 'https://monadvision.com';

/** Set KEY=value in a dotenv file without touching other lines. Never logs the value. */
export function upsertEnv(file, key, value) {
  const lines = existsSync(file) ? readFileSync(file, 'utf8').split(/\r?\n/) : [];
  const i = lines.findIndex((l) => l.startsWith(`${key}=`));
  if (i >= 0) lines[i] = `${key}=${value}`;
  else {
    if (lines.length && lines[lines.length - 1] === '') lines.pop();
    lines.push(`${key}=${value}`, '');
  }
  writeFileSync(file, lines.join('\n'));
}

export function readEnvValue(file, key) {
  if (!existsSync(file)) return '';
  const line = readFileSync(file, 'utf8').split(/\r?\n/).find((l) => l.startsWith(`${key}=`));
  return line ? line.slice(key.length + 1).trim() : '';
}

export function clients() {
  const key = (process.env.NFT_MINTER_PRIVATE_KEY || '').trim();
  if (!/^0x[0-9a-fA-F]{64}$/.test(key)) throw new Error('NFT_MINTER_PRIVATE_KEY missing — run `npm run wallet` first.');
  const account = privateKeyToAccount(key);
  const transport = http(process.env.MONAD_RPC_URL || monad.rpcUrls.default.http[0]);
  return {
    account,
    publicClient: createPublicClient({ chain: monad, transport }),
    walletClient: createWalletClient({ chain: monad, account, transport }),
  };
}

export function artifact() {
  const file = join(ROOT, 'build', 'AspDrop.json');
  if (!existsSync(file)) throw new Error('No build/AspDrop.json — run `npm run compile` first.');
  return JSON.parse(readFileSync(file, 'utf8'));
}
