import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { isHash } from 'viem';
import { settings } from '../settings/settings.js';
import {
  assertHireAllowed,
  getPetition,
  markPetitionUsed,
  touchExpiry,
} from '../policy/store.js';
import { markWinnerClaimed } from '../policy/winners.js';
import { requireAdmin } from '../policy/adminGate.js';
import {
  clearIntents,
  consumeTx,
  createIntent,
  getIntent,
  publicIntent,
  txOwner,
  updateIntent,
} from './intentStore.js';
import {
  buildPaymentRequest,
  currentBlock,
  findTaggedTransfer,
  verifyUsdcPayment,
} from './monadPayment.js';

const GACHA_DEFAULT_ID = 'Sub_A7C440A00001';

function findSkill(target_hardware_id, command) {
  const cmd0 = Array.isArray(command) ? String(command[0]) : '';
  return settings.skills.find(
    (s) => s.target_hardware_id === target_hardware_id && String(s.command?.[0]) === cmd0
  );
}

function nowMs() {
  return Date.now();
}

function payResponse(intent, extra = {}) {
  return {
    ok: true,
    ...extra,
    nonce: intent.nonce,
    intent: publicIntent(intent),
    payment: {
      chainId: intent.chainId,
      to: intent.token,
      data: intent.data,
      value: '0',
      amount: intent.amount,
      token: intent.token,
      receiver: intent.receiver,
    },
  };
}

/**
 * Re-checks the chain for this intent's tx. Fail closed: only a verified transfer flips
 * the intent to paid. Throws on RPC failure so callers can answer 502.
 */
async function confirmPayment(intent) {
  if (intent.status === 'paid' || intent.status === 'dispensed') {
    return { ok: true, intent };
  }
  if (!intent.txHash && intent.scan_block) {
    const found = await findTaggedTransfer({
      nonce: intent.nonce,
      amount: intent.amount,
      token: intent.token,
      receiver: intent.receiver,
      fromBlock: intent.scan_block,
    });
    intent = updateIntent(intent.nonce, {
      scan_block: found.nextBlock,
      ...(found.txHash && !txOwner(found.txHash) ? { txHash: found.txHash } : {}),
    });
  }
  if (!intent.txHash) return { ok: false, error: 'payment-not-submitted', intent };

  const result = await verifyUsdcPayment({
    txHash: intent.txHash,
    nonce: intent.nonce,
    amount: intent.amount,
    token: intent.token,
    receiver: intent.receiver,
    notBeforeMs: intent.created_at,
  });

  if (!result.ok) {
    // Still mining: keep the hash. Anything else is a bad tx — drop it so the phone can retry.
    const patch =
      result.error === 'payment-not-found'
        ? { last_error: null }
        : { txHash: null, last_error: result.error };
    return { ok: false, error: result.error, detail: result.detail, intent: updateIntent(intent.nonce, patch) };
  }

  if (!consumeTx(result.txHash, intent.nonce)) {
    return {
      ok: false,
      error: 'payment-tx-replayed',
      detail: 'This transaction already paid for a different intent.',
      intent: updateIntent(intent.nonce, { txHash: null, last_error: 'payment-tx-replayed' }),
    };
  }

  return {
    ok: true,
    intent: updateIntent(intent.nonce, {
      status: 'paid',
      payer: result.payer,
      explorerUrl: result.explorerUrl,
      paid_at: intent.paid_at || nowMs(),
      last_error: null,
    }),
  };
}

function burnEntitlement(gate, payer) {
  if (gate.petition?.petition_id) markPetitionUsed(gate.petition.petition_id);
  if (gate.petition?.winner_ticket) {
    markWinnerClaimed({ ticket: gate.petition.winner_ticket, petition_id: gate.petition.petition_id });
  }
  if (gate.petition && payer && gate.petition.requester !== payer) {
    gate.petition.requester = payer;
  }
}

/**
 * Kiosk pay — parallel to x402 hire.
 * Phone wallet joins over WalletConnect and sends a nonce-tagged USDC transfer on Monad;
 * the kiosk hands us the hash, we verify on-chain, then dispense without a second charge.
 */
export function createKioskRouter({ dispatch }) {
  const router = Router();

  async function makePayIntent({ petition_id, amount, release }) {
    const receiver = settings.monad.address;
    if (!receiver) {
      const err = new Error('GATEWAY_ADDRESS is not configured.');
      err.code = 'gateway-address-missing';
      throw err;
    }
    const nonce = randomUUID();
    const request = buildPaymentRequest({ receiver, amount, token: settings.monad.usdc, nonce });
    const startBlock = await currentBlock().catch(() => null);
    return createIntent({
      nonce,
      petition_id: petition_id || null,
      chainId: request.chainId,
      amount: request.amount,
      token: request.token,
      receiver: request.receiver,
      data: request.data,
      status: 'pending',
      lab: !petition_id,
      release: release === 'nft' ? 'nft' : 'motor',
      created_at: nowMs(),
      updated_at: nowMs(),
      txHash: null,
      scan_block: startBlock === null ? null : String(startBlock),
      payer: null,
      receipt: null,
      tx_id: null,
      paid_at: null,
      dispensed_at: null,
      settled_at: null,
    });
  }

  async function sendPayIntent(res, { petition_id, skill, lab, release }) {
    try {
      const intent = await makePayIntent({ petition_id, amount: skill.price, release });
      return res.status(201).json(
        payResponse(intent, {
          ...(lab ? { lab: true } : {}),
          next: {
            step: 'phone_pay',
            message: lab
              ? 'Lab only: connect a phone wallet over WalletConnect, send the USDC transfer, post the tx hash. No World and no motor.'
              : 'Connect the phone wallet over WalletConnect, send payment.data to payment.to, then POST the hash to /asp/kiosk/intent/:nonce/tx and poll until paid.',
          },
        })
      );
    } catch (err) {
      return res.status(500).json({
        ok: false,
        error: err.code || 'pay-intent-failed',
        detail: String(err?.message || err),
      });
    }
  }

  // POST /asp/kiosk/lab/intent — pay-only smoke test (no World / no petition)
  router.post('/asp/kiosk/lab/intent', (req, res) => {
    const skill =
      findSkill(GACHA_DEFAULT_ID, ['DISPENSE_ONCE']) ||
      settings.skills.find((s) => s.price && s.token);

    if (!skill?.price) {
      return res.status(500).json({
        ok: false,
        error: 'invalid-skill-config',
        detail: 'No priced skill available for lab pay.',
      });
    }
    return sendPayIntent(res, { petition_id: null, skill, lab: true });
  });

  // POST /asp/kiosk/intent — USDC pay request for an authorized petition
  router.post('/asp/kiosk/intent', (req, res) => {
    const petition_id = typeof req.body?.petition_id === 'string' ? req.body.petition_id.trim() : '';
    if (!petition_id) {
      return res.status(400).json({ ok: false, error: 'missing-petition_id' });
    }

    const petition = getPetition(petition_id);
    if (!petition) {
      return res.status(404).json({ ok: false, error: 'petition-not-found' });
    }

    const expiry = touchExpiry(petition);
    if (!expiry.ok) {
      return res.status(403).json({
        ok: false,
        error: expiry.error,
        detail: 'Petition expired. Create a new petition and verify again.',
      });
    }

    if (petition.status !== 'authorized') {
      return res.status(403).json({
        ok: false,
        error: 'pending-human',
        detail: 'Petition must be authorized (Proof of Human) before creating a pay request.',
        status: petition.status,
      });
    }

    if (petition.used_at) {
      return res.status(403).json({
        ok: false,
        error: 'petition-already-used',
        detail: 'This authorization was already consumed.',
      });
    }

    const skill = findSkill(petition.target_hardware_id, petition.command);
    if (!skill?.price) {
      return res.status(500).json({
        ok: false,
        error: 'invalid-skill-config',
        detail: 'Skill must define price and token.',
      });
    }
    const release = req.body?.release === 'nft' ? 'nft' : 'motor';
    return sendPayIntent(res, { petition_id, skill, lab: false, release });
  });

  // POST /asp/kiosk/intent/:nonce/tx — kiosk hands over the hash the phone wallet returned
  router.post('/asp/kiosk/intent/:nonce/tx', async (req, res) => {
    const intent = getIntent(String(req.params.nonce || '').trim());
    if (!intent) {
      return res.status(404).json({ ok: false, error: 'intent-not-found' });
    }

    const txHash = typeof req.body?.txHash === 'string' ? req.body.txHash.trim() : '';
    if (!isHash(txHash)) {
      return res.status(400).json({ ok: false, error: 'invalid-tx-hash' });
    }
    const owner = txOwner(txHash);
    if (owner && owner !== intent.nonce) {
      return res.status(409).json({ ok: false, error: 'payment-tx-replayed' });
    }
    if (intent.status === 'pending') {
      updateIntent(intent.nonce, { txHash, last_error: null });
    }

    try {
      const out = await confirmPayment(getIntent(intent.nonce));
      return res.status(out.ok ? 200 : 202).json({
        ok: true,
        paid: out.ok,
        error: out.ok ? undefined : out.error,
        intent: publicIntent(out.intent),
      });
    } catch (err) {
      return res.status(502).json({
        ok: false,
        error: 'payment-lookup-failed',
        detail: String(err?.message || err),
      });
    }
  });

  // GET /asp/kiosk/intent/:nonce — poll on-chain settlement
  router.get('/asp/kiosk/intent/:nonce', async (req, res) => {
    const intent = getIntent(String(req.params.nonce || '').trim());
    if (!intent) {
      return res.status(404).json({ ok: false, error: 'intent-not-found' });
    }

    try {
      const out = await confirmPayment(intent);
      return res.json({
        ok: true,
        intent: publicIntent(out.intent),
        error: out.ok ? undefined : out.error,
      });
    } catch (err) {
      console.warn('[KIOSK] payment lookup failed:', err?.message || err);
      return res.json({ ok: true, intent: publicIntent(intent), error: 'payment-lookup-failed' });
    }
  });

  /**
   * Shared gate for every release path: verified USDC payment, live World petition, then the
   * ticket is burned. Returns { error: { status, body } } or what the caller releases against.
   */
  async function settlePaidIntent(nonce, release, txIdInput) {
    const fail = (status, body) => ({ error: { status, body } });
    let intent = getIntent(nonce);
    if (!intent) return fail(404, { ok: false, error: 'intent-not-found' });

    if (!intent.petition_id || intent.lab) {
      return fail(400, {
        ok: false,
        error: 'lab-intent-no-dispense',
        detail: 'Lab pay requests have no World petition. Payment confirm is enough — release stays on the full checkout path.',
        intent: publicIntent(intent),
      });
    }
    if ((intent.release || 'motor') !== release) {
      return fail(409, {
        ok: false,
        error: 'wrong-release-path',
        detail: `This payment was opened for the ${intent.release || 'motor'} release, not ${release}.`,
      });
    }

    let paid;
    try {
      paid = await confirmPayment(intent);
    } catch (err) {
      return fail(502, { ok: false, error: 'payment-lookup-failed', detail: String(err?.message || err) });
    }
    if (!paid.ok) {
      return fail(402, {
        ok: false,
        error: paid.error || 'payment-not-found',
        detail: paid.detail || 'No verified USDC transfer for this intent yet. Keep polling.',
        intent: publicIntent(paid.intent),
      });
    }
    intent = paid.intent;

    const petition = getPetition(intent.petition_id);
    if (!petition) return fail(404, { ok: false, error: 'petition-not-found' });

    const skill = findSkill(petition.target_hardware_id, petition.command);
    if (!skill) {
      return fail(404, { ok: false, error: 'unknown-skill', detail: `No skill for ${petition.target_hardware_id}` });
    }

    // The phone that paid may differ from whoever opened the petition.
    const payer = intent.payer || petition.requester;
    const tx_id =
      (typeof txIdInput === 'string' && txIdInput.trim()) ||
      `kiosk_${intent.nonce.slice(0, 8)}_${Date.now().toString(36)}`;
    const hireBody = {
      tx_id,
      requester: payer,
      target_hardware_id: petition.target_hardware_id,
      command: [...petition.command],
      petition_id: petition.petition_id,
    };

    const gate = assertHireAllowed({ skill, body: hireBody, skipRequesterMatch: true });
    if (!gate.ok) return fail(gate.status || 403, { ok: false, error: gate.error, detail: gate.detail });

    // Payment confirmed → burn entitlement now (one ticket, one claim), even if release fails.
    burnEntitlement(gate, payer);
    return { intent, petition, skill, payer, tx_id, hireBody };
  }

  function settledResponse(intent, already) {
    return {
      ok: true,
      already,
      petition_id: intent.petition_id,
      payer: intent.payer,
      transaction: intent.txHash,
      explorerUrl: intent.explorerUrl || null,
      intent: publicIntent(intent),
    };
  }

  // POST /asp/kiosk/settle — NFT release: same checks and ticket burn as dispense, no motor.
  router.post('/asp/kiosk/settle', async (req, res) => {
    const nonce = typeof req.body?.nonce === 'string' ? req.body.nonce.trim() : '';
    if (!nonce) return res.status(400).json({ ok: false, error: 'missing-nonce' });

    const existing = getIntent(nonce);
    if (existing?.settled_at) return res.json(settledResponse(existing, true));

    const settled = await settlePaidIntent(nonce, 'nft');
    if (settled.error) return res.status(settled.error.status).json(settled.error.body);

    const intent = updateIntent(nonce, { settled_at: nowMs(), payer: settled.payer });
    return res.json(settledResponse(intent, false));
  });

  // POST /asp/kiosk/dispense — verify payment, then dispatch (no x402)
  router.post('/asp/kiosk/dispense', async (req, res) => {
    const nonce = typeof req.body?.nonce === 'string' ? req.body.nonce.trim() : '';
    if (!nonce) {
      return res.status(400).json({ ok: false, error: 'missing-nonce' });
    }

    let intent = getIntent(nonce);
    if (!intent) {
      return res.status(404).json({ ok: false, error: 'intent-not-found' });
    }

    if (intent.status === 'dispensed' && intent.receipt) {
      return res.json({
        ok: true,
        message: 'already-dispensed',
        tx_id: intent.tx_id,
        petition_id: intent.petition_id,
        receipt: intent.receipt,
        gateway: intent.receiver,
        payer: intent.payer,
        transaction: intent.txHash,
        explorerUrl: intent.explorerUrl || null,
        intent: publicIntent(intent),
      });
    }

    const settled = await settlePaidIntent(nonce, 'motor', req.body?.tx_id);
    if (settled.error) return res.status(settled.error.status).json(settled.error.body);
    const { petition, skill, payer, tx_id, hireBody } = settled;
    intent = settled.intent;

    try {
      const receipt = await dispatch(hireBody, skill);
      intent = updateIntent(nonce, { status: 'dispensed', dispensed_at: nowMs(), tx_id, receipt });

      return res.json({
        ok: true,
        message: 'execution correct',
        tx_id,
        petition_id: petition.petition_id,
        target: petition.target_hardware_id,
        receipt,
        gateway: intent.receiver,
        payer,
        transaction: intent.txHash,
        explorerUrl: intent.explorerUrl || null,
        intent: publicIntent(intent),
      });
    } catch (e) {
      updateIntent(nonce, { tx_id });
      return res.status(504).json({
        ok: false,
        error: 'esp32-no-receipt',
        detail: e.message,
        claimed: true,
        transaction: intent.txHash,
        explorerUrl: intent.explorerUrl || null,
      });
    }
  });

  // Operator-only: wipe kiosk intents (the spent-tx ledger is never cleared)
  router.post('/asp/kiosk/reset', (req, res) => {
    if (!requireAdmin(req, res)) return;
    const cleared = clearIntents();
    return res.json({ ok: true, intentsCleared: cleared });
  });

  return router;
}
