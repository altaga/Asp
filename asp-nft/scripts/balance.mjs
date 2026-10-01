import { formatEther } from 'viem';
import { clients } from './lib.mjs';

const { account, publicClient } = clients();
const wei = await publicClient.getBalance({ address: account.address });
console.log(`${account.address}: ${formatEther(wei)} MON`);
