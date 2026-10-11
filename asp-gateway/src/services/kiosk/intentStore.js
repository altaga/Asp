/**
 * Kiosk payment intents, persisted through the ledger so a paid claim survives a restart.
 * Unique nonce → WalletConnect USDC transfer on Monad; PC polls until paid, then dispenses.
 */
import { ledgerMap } from '../ledger/ledger.js';

const intents = ledgerMap('intents'); // nonce → intent
const consumedTx = ledgerMap('consumedTx'); // txHash (lowercase) → nonce

function nowMs() {
  return Date.now();
}

export function createIntent(record) {
  intents.set(record.nonce, record);
  return record;
}

export function getIntent(nonce) {
  return intents.get(nonce) || null;
}

export function updateIntent(nonce, patch) {
  const intent = intents.get(nonce);
  if (!intent) return null;
  Object.assign(intent, patch, { updated_at: nowMs() });
  return intent;
}

/** Demo reset clears intents but never the spent-tx ledger: a paid tx is single-use forever. */
export function clearIntents() {
  const n = intents.size;
  intents.clear();
  return n;
}

/** Returns false when the tx already paid for a different intent (replay). */
export function consumeTx(txHash, nonce) {
  const key = String(txHash).toLowerCase();
  const owner = consumedTx.get(key);
  if (owner && owner !== nonce) return false;
  consumedTx.set(key, nonce);
  return true;
}

export function txOwner(txHash) {
  return consumedTx.get(String(txHash).toLowerCase()) || null;
}

export function publicIntent(intent) {
  if (!intent) return null;
  return {
    nonce: intent.nonce,
    petition_id: intent.petition_id,
    status: intent.status,
    chainId: intent.chainId,
    amount: intent.amount,
    token: intent.token,
    receiver: intent.receiver,
    data: intent.data || null,
    txHash: intent.txHash || null,
    explorerUrl: intent.explorerUrl || null,
    last_error: intent.last_error || null,
    payer: intent.payer || null,
    receipt: intent.receipt || null,
    tx_id: intent.tx_id || null,
    created_at: intent.created_at,
    paid_at: intent.paid_at || null,
    dispensed_at: intent.dispensed_at || null,
    release: intent.release || 'motor',
    settled_at: intent.settled_at || null,
  };
}
