import { formatEther } from 'viem';
import { artifact, clients, DAPP_ENV, EXPLORER, NFT_ENV, upsertEnv } from './lib.mjs';

if (process.env.ASP_DROP_ADDRESS && !process.argv.includes('--force')) {
  console.log('Already deployed at', process.env.ASP_DROP_ADDRESS, '(pass --force to deploy a new one)');
  process.exit(0);
}

const { account, publicClient, walletClient } = clients();
const { abi, bytecode } = artifact();
const balance = await publicClient.getBalance({ address: account.address });
console.log(`Minter ${account.address} has ${formatEther(balance)} MON`);

const hash = await walletClient.deployContract({ abi, bytecode, args: [account.address] });
console.log('Deploy tx:', `${EXPLORER}/tx/${hash}`);
const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: 60_000 });
if (receipt.status !== 'success' || !receipt.contractAddress) throw new Error('Deploy reverted');

upsertEnv(NFT_ENV, 'ASP_DROP_ADDRESS', receipt.contractAddress);
upsertEnv(DAPP_ENV, 'EXPO_PUBLIC_ASP_DROP_ADDRESS', receipt.contractAddress);
console.log('AspDrop:', `${EXPLORER}/address/${receipt.contractAddress}`);
