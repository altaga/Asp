import { getAddress } from 'viem';
import { artifact, clients, EXPLORER } from './lib.mjs';

const address = getAddress(process.env.ASP_DROP_ADDRESS || '');
const { abi } = artifact();
const { publicClient, walletClient } = clients();

const [minted, max] = await Promise.all([
  publicClient.readContract({ address, abi, functionName: 'totalMinted' }),
  publicClient.readContract({ address, abi, functionName: 'MAX_SUPPLY' }),
]);
const count = max - minted;
if (count === 0n) {
  console.log(`All ${max} editions already minted.`);
  process.exit(0);
}

const { request } = await publicClient.simulateContract({
  account: walletClient.account,
  address,
  abi,
  functionName: 'mintEditions',
  args: [count],
});
const hash = await walletClient.writeContract(request);
console.log('Mint tx:', `${EXPLORER}/tx/${hash}`);
const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: 60_000 });
if (receipt.status !== 'success') throw new Error('Mint reverted');

const remaining = await publicClient.readContract({ address, abi, functionName: 'remaining' });
console.log(`Minted ${count} editions into the contract — ${remaining} ready to drop.`);
