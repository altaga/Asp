import {
  encodeFunctionData,
  erc20Abi,
  getAddress,
  isHash,
  keccak256,
  parseEventLogs,
  toBytes,
} from 'viem';
import { MONAD_CHAIN_ID, explorerTxUrl, publicClient } from '../monad/chain.js';

const CLOCK_SKEW_MS = 120_000;

/**
 * 16-byte tag appended after the ERC-20 transfer args. USDC ignores trailing calldata,
 * so the tag rides on-chain and binds the payment to exactly one kiosk intent.
 */
export function nonceTag(nonce) {
  return keccak256(toBytes(`asp-kiosk:${nonce}`)).slice(0, 34);
}

export function buildPaymentRequest({ receiver, amount, token, nonce }) {
  const to = getAddress(receiver);
  const transferData = encodeFunctionData({
    abi: erc20Abi,
    functionName: 'transfer',
    args: [to, BigInt(amount)],
  });
  const tag = nonceTag(nonce);
  return {
    chainId: MONAD_CHAIN_ID,
    token: getAddress(token),
    receiver: to,
    amount: String(amount),
    nonceTag: tag,
    data: `${transferData}${tag.slice(2)}`,
  };
}

function fail(error, detail) {
  return { ok: false, error, detail };
}

async function fetchReceipt(hash) {
  try {
    return await publicClient.getTransactionReceipt({ hash });
  } catch (err) {
    if (err?.name === 'TransactionReceiptNotFoundError') return null;
    throw err;
  }
}

// eth_getLogs block-range cap of the primary RPC: public Monad allows 100, Alchemy free tier 10.
const LOG_SPAN = BigInt(process.env.MONAD_LOGS_SPAN || 100);
const MAX_SPANS_PER_SCAN = 8;

export async function currentBlock() {
  return publicClient.getBlockNumber();
}

/**
 * Finds this intent's tagged transfer on-chain without the wallet's hash — covers the phone
 * paying while the WalletConnect reply never reaches the kiosk. Walks forward from `fromBlock`
 * in RPC-sized spans and returns the next block to scan from.
 */
export async function findTaggedTransfer({ nonce, amount, token, receiver, fromBlock }) {
  const head = await publicClient.getBlockNumber();
  let from = BigInt(fromBlock);
  const tag = nonceTag(nonce).slice(2).toLowerCase();
  const want = BigInt(amount);

  for (let i = 0; i < MAX_SPANS_PER_SCAN && from <= head; i++) {
    const to = from + LOG_SPAN - 1n < head ? from + LOG_SPAN - 1n : head;
    const logs = await publicClient.getLogs({
      address: getAddress(token),
      event: erc20Abi.find((x) => x.type === 'event' && x.name === 'Transfer'),
      args: { to: getAddress(receiver) },
      fromBlock: from,
      toBlock: to,
    });
    for (const log of logs) {
      if (log.args.value !== want) continue;
      const tx = await publicClient.getTransaction({ hash: log.transactionHash });
      if (tx.input.toLowerCase().endsWith(tag)) return { txHash: log.transactionHash, nextBlock: String(to + 1n) };
    }
    from = to + 1n;
  }
  return { txHash: null, nextBlock: String(from) };
}

/**
 * Fail-closed USDC settlement check. Only a mined, successful transfer of the exact
 * amount to the gateway, carrying this intent's nonce tag, counts as paid.
 * Throws only on RPC failure (caller maps to 502).
 */
export async function verifyUsdcPayment({ txHash, nonce, amount, token, receiver, notBeforeMs }) {
  if (!isHash(txHash || '')) return fail('invalid-tx-hash', 'txHash must be a 0x-prefixed 32-byte hash.');

  const receipt = await fetchReceipt(txHash);
  if (!receipt) return fail('payment-not-found', 'Transaction not mined yet. Keep polling.');
  if (receipt.status !== 'success') return fail('payment-reverted', 'Transaction reverted on-chain.');

  const tx = await publicClient.getTransaction({ hash: txHash });
  const tokenLc = token.toLowerCase();
  if (!tx.to || tx.to.toLowerCase() !== tokenLc) {
    return fail('payment-wrong-token', 'Transaction was not sent to the USDC contract.');
  }
  if (!tx.input.toLowerCase().endsWith(nonceTag(nonce).slice(2).toLowerCase())) {
    return fail('payment-nonce-mismatch', 'Transaction is not bound to this payment intent.');
  }

  const receiverLc = receiver.toLowerCase();
  const want = BigInt(amount);
  const matched = parseEventLogs({ abi: erc20Abi, eventName: 'Transfer', logs: receipt.logs }).some(
    (log) =>
      log.address.toLowerCase() === tokenLc &&
      log.args.to.toLowerCase() === receiverLc &&
      log.args.value === want
  );
  if (!matched) return fail('payment-amount-mismatch', 'No USDC transfer of the exact amount to the gateway.');

  if (notBeforeMs) {
    const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber });
    if (Number(block.timestamp) * 1000 < notBeforeMs - CLOCK_SKEW_MS) {
      return fail('payment-too-old', 'Transaction predates this payment intent.');
    }
  }

  return {
    ok: true,
    txHash: receipt.transactionHash,
    payer: getAddress(tx.from),
    amount: String(amount),
    receiver: getAddress(receiver),
    blockNumber: String(receipt.blockNumber),
    explorerUrl: explorerTxUrl(receipt.transactionHash),
  };
}
