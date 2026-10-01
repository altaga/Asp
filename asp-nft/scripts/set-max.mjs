import { getAddress } from 'viem';
import { artifact, clients, EXPLORER } from './lib.mjs';

const address = getAddress(process.env.ASP_DROP_ADDRESS || '');
if (!process.argv[2]) throw new Error('Usage: npm run set-max -- <newMaxSupply>');
const next = BigInt(process.argv[2]);
const { abi } = artifact();
const { publicClient, walletClient } = clients();

const [current, minted] = await Promise.all([
  publicClient.readContract({ address, abi, functionName: 'maxSupply' }),
  publicClient.readContract({ address, abi, functionName: 'totalMinted' }),
]);
if (next < minted) throw new Error(`Cap can't go below the ${minted} already minted.`);

const { request } = await publicClient.simulateContract({
  account: walletClient.account,
  address,
  abi,
  functionName: 'setMaxSupply',
  args: [next],
});
const hash = await walletClient.writeContract(request);
console.log('Set max tx:', `${EXPLORER}/tx/${hash}`);
const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: 60_000 });
if (receipt.status !== 'success') throw new Error('setMaxSupply reverted');
console.log(`maxSupply ${current} → ${next} (${minted} minted so far).`);
