// =============================================================================
//  Asp Gateway — x402 HTTP Routes
//  -----------------------------------------------------------------------------
//   POST /asp/hire        — x402 paid petition
//   GET  /asp/health      — liveness probe
//
//   The hire route implements the full x402 challenge / response dance with
//   the exact EVM scheme (EIP-3009 USDC) on Monad.
// =============================================================================

import express from 'express';
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { paymentMiddleware } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { settings } from "../settings/settings.js";
import { assertHireAllowed, markPetitionUsed } from "../policy/store.js";
const { skills, devices } = settings;

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getBaseUrl(req) {
  const host = req.get('host');
  return `${req.protocol}://${host}`;
}

function examplePetitionFor(skill) {
  const petition = {
    tx_id: "tx_demo_001",
    requester: "0xYOUR_MONAD_ADDRESS",
    target_hardware_id: skill.target_hardware_id,
    command: skill.command,
  };

  if (skill.execution_model === 'AGENTIC') {
    petition.user_prompt = "Inspect the workspace and summarize any issues.";
    petition.context = skill.system_prompt || "[SYSTEM CONTEXT] Execute the requested reasoning task.";
  }

  return petition;
}

function renderSkillCards(skillsList) {
  return skillsList.map((skill) => `
    <article class="card">
      <div class="pill-row">
        <span class="pill">${escapeHtml(skill.execution_model)}</span>
        <span class="pill subtle">${escapeHtml(skill.type)}</span>
      </div>
      <h3>${escapeHtml(skill.name)}</h3>
      <p>${escapeHtml(skill.description || 'No description provided.')}</p>
      <dl class="meta">
        <div><dt>Target</dt><dd>${escapeHtml(skill.target_hardware_id)}</dd></div>
        <div><dt>Command</dt><dd>${escapeHtml(JSON.stringify(skill.command))}</dd></div>
        <div><dt>Price</dt><dd>${escapeHtml(skill.price)} USDC base units</dd></div>
      </dl>
    </article>
  `).join('');
}

function renderUserPage({ req, gatewayAddress }) {
  const baseUrl = getBaseUrl(req);
  const exampleSkill = skills[0];
  const exampleJson = JSON.stringify(examplePetitionFor(exampleSkill), null, 2);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Asp Gateway</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700;900&display=swap" />
  <style>
    :root {
      color-scheme: light;
      --bg: #FFF8EF;
      --panel: #FFFFFF;
      --panel-2: #FFF8EF;
      --line: rgba(35,24,21,0.1);
      --text: #231815;
      --muted: #7B6F69;
      --accent: #E8112D;
      --accent-2: #836EF9;
      --shadow: 0 2px 0 rgba(35,24,21,0.08), 0 18px 40px rgba(35,24,21,0.06);
      font-family: "Zen Maru Gothic", "Hiragino Maru Gothic ProN", "Helvetica Neue", Arial, sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      border-top: 6px solid var(--accent);
      background: var(--bg) radial-gradient(rgba(232,17,45,.07) 1.6px, transparent 1.6px) 0 0 / 22px 22px;
      color: var(--text);
    }
    a { color: inherit; text-decoration: none; }
    .shell { max-width: 1180px; margin: 0 auto; padding: 32px 24px 80px; }
    .nav, .hero, .section, .footer {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 24px;
      box-shadow: var(--shadow);
      backdrop-filter: blur(18px);
    }
    .nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      margin-bottom: 24px;
    }
    .brand { font-size: 14px; color: var(--muted); }
    .nav-links { display: flex; gap: 12px; flex-wrap: wrap; }
    .nav-links a, .cta {
      padding: 10px 14px;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: var(--panel);
      font-size: 14px;
      font-weight: 700;
    }
    .cta.primary {
      background: var(--accent);
      color: #fff;
      font-weight: 900;
      border: none;
      box-shadow: 0 4px 0 #B80A20;
    }
    .hero {
      padding: 48px;
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }
    h1, h2, h3, p { margin: 0; }
    h1 { font-size: 54px; line-height: 1.02; letter-spacing: -2px; max-width: 12ch; }
    .lead { margin-top: 18px; font-size: 18px; color: var(--muted); line-height: 1.6; max-width: 58ch; }
    .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 24px; }
    .hero-panel, .section { padding: 28px; }
    .hero-panel {
      background: var(--panel-2);
      border: 1px solid var(--line);
      border-radius: 20px;
    }
    .eyebrow { color: var(--accent-2); font-size: 12px; text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 10px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 18px; }
    .card {
      background: var(--panel-2);
      border: 1px solid var(--line);
      border-radius: 18px;
      padding: 22px;
    }
    .card h3 { font-size: 20px; margin: 14px 0 10px; }
    .card p { color: var(--muted); line-height: 1.6; min-height: 72px; }
    .pill-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .pill {
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #fff;
      background: var(--accent);
      font-weight: 700;
    }
    .pill.subtle { background: rgba(131,110,249,0.1); color: var(--accent-2); }
    .meta { margin-top: 14px; display: grid; gap: 10px; }
    .meta div { display: grid; gap: 4px; }
    .meta dt { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; }
    .meta dd { margin: 0; font-size: 14px; word-break: break-word; }
    .section { margin-top: 24px; }
    .section-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 18px; }
    .section-header p { color: var(--muted); max-width: 60ch; line-height: 1.6; }
    .steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .step {
      padding: 20px;
      background: var(--panel-2);
      border: 1px solid var(--line);
      border-radius: 18px;
    }
    .step strong { display: inline-block; margin-bottom: 10px; font-size: 12px; color: var(--accent-2); }
    pre {
      margin: 0;
      overflow-x: auto;
      padding: 20px;
      border-radius: 18px;
      background: #231815;
      border: 1px solid var(--line);
      color: #FFF8EF;
      font-size: 13px;
      line-height: 1.6;
    }
    .footer { margin-top: 24px; padding: 22px 28px; display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; color: var(--muted); }
    @media (max-width: 980px) {
      .hero, .grid, .steps { grid-template-columns: 1fr; }
      h1 { font-size: 42px; }
    }
  </style>
</head>
<body>
  <div class="shell">
    <nav class="nav">
      <div>
        <div class="eyebrow">Asp Gateway</div>
        <div class="brand">Public x402 access layer for device and agent capabilities</div>
      </div>
      <div class="nav-links">
        <a href="/user">User Page</a>
        <a href="/agentic">Agentic Page</a>
        <a href="/asp/skills">Skills JSON</a>
        <a href="/asp/status">Gateway Status</a>
      </div>
    </nav>

    <section class="hero">
      <div>
        <div class="eyebrow">Human-Friendly Overview</div>
        <h1>Hire real Asp capabilities over x402.</h1>
        <p class="lead">
          Machines you can hire on Monad. Clients discover skills, request a paid action through x402,
          sign a USDC authorization and get an execution receipt back. Skills with a World lock
          (like the limited drop) won't move until a real human proves it.
        </p>
        <div class="hero-actions">
          <a class="cta primary" href="/agentic">Open Agentic Integration Guide</a>
          <a class="cta" href="/asp/skills">See Live Skills JSON</a>
          <a class="cta" href="/asp/health">Health Check</a>
        </div>
      </div>
      <aside class="hero-panel">
        <div class="eyebrow">Live Endpoint</div>
        <h3>${escapeHtml(baseUrl)}</h3>
        <div class="meta">
          <div><dt>Gateway Address</dt><dd>${escapeHtml(gatewayAddress || 'Unavailable')}</dd></div>
          <div><dt>Primary x402 Route</dt><dd>POST ${escapeHtml(baseUrl)}/asp/hire</dd></div>
          <div><dt>Discovery Routes</dt><dd>GET /asp/skills, /asp/status, /asp/health</dd></div>
        </div>
      </aside>
    </section>

    <section class="section">
      <div class="section-header">
        <div>
          <div class="eyebrow">Capabilities</div>
          <h2>What this gateway can do right now</h2>
        </div>
        <p>These entries are backed by the live gateway skill registry, so this page reflects what clients can actually request through the paid x402 surface.</p>
      </div>
      <div class="grid">${renderSkillCards(skills)}</div>
    </section>

    <section class="section">
      <div class="section-header">
        <div>
          <div class="eyebrow">How It Works</div>
          <h2>Simple x402 request flow</h2>
        </div>
        <p>The payment challenge and device dispatch are handled by the gateway. Your app only needs to send a valid petition and complete the x402 signature flow.</p>
      </div>
      <div class="steps">
        <div class="step"><strong>1. Discover</strong><p>Read available skills from <code>/asp/skills</code> and choose a target plus command.</p></div>
        <div class="step"><strong>2. Request</strong><p>POST a petition to <code>/asp/hire</code> with the skill payload.</p></div>
        <div class="step"><strong>3. Pay</strong><p>Handle the x402 challenge and sign a USDC authorization on Monad with any EVM wallet.</p></div>
        <div class="step"><strong>4. Receive</strong><p>Read the gateway receipt, execution response, and transaction hash.</p></div>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <div>
          <div class="eyebrow">Example Request</div>
          <h2>Minimal petition payload</h2>
        </div>
        <p>Use this as the starting body before the x402 challenge-response handshake. Agentic skills also require <code>user_prompt</code> and <code>context</code>.</p>
      </div>
      <pre>${escapeHtml(exampleJson)}</pre>
    </section>

    <footer class="footer">
      <span>Human page: <strong>/user</strong></span>
      <span>Agent page: <strong>/agentic</strong></span>
      <span>Machine routes: <strong>/asp/hire</strong>, <strong>/asp/skills</strong>, <strong>/asp/status</strong></span>
    </footer>
  </div>
</body>
</html>`;
}

function renderAgenticPage({ req, gatewayAddress }) {
  const baseUrl = getBaseUrl(req);
  const capabilities = skills.map((skill) => ({
    id: skill.id,
    name: skill.name,
    description: skill.description,
    type: skill.type,
    execution_model: skill.execution_model,
    price: skill.price,
    asset: skill.asset,
    target_hardware_id: skill.target_hardware_id,
    command: skill.command,
    proof_of_human: skill.proof_of_human || null,
    requires_user_prompt: skill.execution_model === 'AGENTIC',
    example_petition: examplePetitionFor(skill),
  }));

  const agentGuide = {
    product: "Asp Gateway",
    purpose: "Expose paid machine capabilities through x402 over HTTP.",
    base_url: baseUrl,
    gateway_address: gatewayAddress,
    discovery: {
      health: `${baseUrl}/asp/health`,
      status: `${baseUrl}/asp/status`,
      skills: `${baseUrl}/asp/skills`,
      user_page: `${baseUrl}/user`,
      agentic_page: `${baseUrl}/agentic`,
    },
    payment_flow: [
      "GET skills and choose a supported command.",
      "POST petition to /asp/hire.",
      `If HTTP 402 Payment Required is returned, complete the x402 flow with an exact EVM scheme client on ${settings.monad.network} (Monad USDC, EIP-3009).`,
      "Replay the request with payment proof.",
      "Read receipt, tx_id, transaction hash, and response payload."
    ],
    network: settings.monad.network,
    asset: settings.monad.usdc,
    route_contracts: {
      hire: {
        method: "POST",
        url: `${baseUrl}/asp/hire`,
        content_type: "application/json",
        required_fields: ["tx_id", "requester", "target_hardware_id", "command"],
        extra_fields_for_agentic: ["user_prompt", "context"],
      },
    },
    capabilities,
  };

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Asp Gateway Agentic Interface</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #160E0C;
      --panel: #231815;
      --line: rgba(255,248,239,0.1);
      --text: #FFF8EF;
      --muted: #B8ABA4;
      --accent: #FF4D62;
      --accent-2: #A796FF;
      font-family: "SFMono-Regular", Consolas, Menlo, Monaco, monospace;
    }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--text); }
    .wrap { max-width: 1160px; margin: 0 auto; padding: 28px 22px 64px; }
    .panel {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 20px;
    }
    h1, h2, h3, p { margin: 0; }
    h1 { font-size: 34px; margin-bottom: 12px; }
    h2 { font-size: 20px; margin-bottom: 12px; }
    p, li { color: var(--muted); line-height: 1.65; }
    .topline { color: var(--accent); text-transform: uppercase; letter-spacing: 0.14em; font-size: 12px; margin-bottom: 10px; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .route {
      padding: 14px 16px;
      border-radius: 14px;
      border: 1px solid var(--line);
      background: rgba(255,255,255,0.02);
      margin-top: 10px;
    }
    code.inline { color: var(--accent-2); }
    pre {
      margin: 0;
      overflow-x: auto;
      padding: 18px;
      border-radius: 16px;
      background: #0E0807;
      border: 1px solid var(--line);
      color: #FFF8EF;
      font-size: 12.5px;
      line-height: 1.6;
    }
    .links { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px; }
    .links a {
      display: inline-block;
      padding: 10px 12px;
      border-radius: 999px;
      border: 1px solid var(--line);
      color: var(--text);
      text-decoration: none;
    }
    @media (max-width: 900px) { .row { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="panel">
      <div class="topline">Agentic Page</div>
      <h1>Asp Gateway machine-usable interface</h1>
      <p>This page is written for external agents, SDK builders, and automation systems that need to understand the gateway surface quickly and invoke x402-protected capabilities correctly.</p>
      <div class="links">
        <a href="/user">Human Page</a>
        <a href="/asp/skills">Raw Skills JSON</a>
        <a href="/asp/status">Status</a>
        <a href="/asp/health">Health</a>
      </div>
    </section>

    <section class="panel row">
      <div>
        <h2>Integration Notes</h2>
        <div class="route">Base URL: <code class="inline">${escapeHtml(baseUrl)}</code></div>
        <div class="route">Primary route: <code class="inline">POST /asp/hire</code></div>
        <div class="route">Gateway address: <code class="inline">${escapeHtml(gatewayAddress || 'Unavailable')}</code></div>
        <div class="route">Required petition fields: <code class="inline">tx_id</code>, <code class="inline">requester</code>, <code class="inline">target_hardware_id</code>, <code class="inline">command</code></div>
        <div class="route">Agentic capabilities additionally require: <code class="inline">user_prompt</code>, <code class="inline">context</code></div>
      </div>
      <div>
        <h2>Execution Semantics</h2>
        <p>Deterministic skills map to fixed device commands. Agentic skills dispatch requests whose content depends on user intent plus system context.</p>
        <p style="margin-top:12px;">If the request is unpaid, the route returns an x402 challenge. Use an exact EVM x402 client on Monad to satisfy the challenge, then resend the request with payment proof.</p>
      </div>
    </section>

    <section class="panel">
      <h2>Canonical Agent Guide</h2>
      <pre>${escapeHtml(JSON.stringify(agentGuide, null, 2))}</pre>
    </section>
  </div>
</body>
</html>`;
}

export function createX402Router({ gatewayAddress, dispatch, brokerState, inFlight }) {
  const router = express.Router();

  // Setup the x402 SDK Facilitator Client
  const facilitatorClient = new HTTPFacilitatorClient({
      url: settings.facilitator.url,
  });

  const resourceServer = new x402ResourceServer(facilitatorClient)
      .register(settings.monad.network, new ExactEvmScheme())
      .onAfterSettle(async (ctx) => {
        const req = ctx.transportContext?.request?.adapter?.req;
        if (req) req.x402Settlement = ctx.result;
      });

  // Pre-middleware to ensure the petition is valid BEFORE checking for payment
  const validatePetition = (req, res, next) => {
    const petition = req.body;
    if (!isValidPetition(petition)) {
      return res.status(400).json({
        ok:       false,
        error:    'invalid-petition',
        expected: ['tx_id', 'requester', 'target_hardware_id', 'command'],
      });
    }

    const skill = skills.find(s => 
      s.target_hardware_id === petition.target_hardware_id && 
      s.command[0] === petition.command[0]
    );

    if (!skill) {
      return res.status(404).json({
        ok: false,
        error: 'unknown-skill',
        detail: `No active skill found for target ${petition.target_hardware_id} and command ${petition.command}`
      });
    }

    if (skill.execution_model === 'AGENTIC') {
      if (typeof petition.user_prompt !== 'string' || typeof petition.context !== 'string') {
        return res.status(400).json({
          ok: false,
          error: 'invalid-petition',
          expected: ['user_prompt', 'context', 'tx_id', 'requester', 'target_hardware_id', 'command'],
          detail: 'Agentic skills require both user_prompt and context fields.'
        });
      }
    }

    if (!skill.price || !skill.token) {
      return res.status(500).json({
        ok: false,
        error: 'invalid-skill-config',
        detail: `Skill ${skill.id || skill.name || 'unknown'} must define both price and token in config/skills.json`
      });
    }

    // Proof of Human gate — before payment middleware (fail closed, no MQTT).
    const gate = assertHireAllowed({ skill, body: petition });
    if (!gate.ok) {
      return res.status(gate.status || 403).json({
        ok: false,
        error: gate.error,
        detail: gate.detail,
        petition: gate.petition
          ? {
              petition_id: gate.petition.petition_id,
              status: gate.petition.status,
              expires_at: gate.petition.expires_at,
            }
          : undefined,
        next:
          gate.error === 'human-proof-required' || gate.error === 'pending-human'
            ? {
                create_petition: 'POST /asp/petition',
                verify: 'POST /asp/proof-of-human/verify',
              }
            : undefined,
      });
    }
    req.policyPetition = gate.petition;

    req.skill = skill;
    next();
  };

  // One middleware per skill: price, asset, and description differ, the route does not.
  const pricedMiddleware = new Map();
  const middlewareFor = (skill) => {
    const key = skill.id || `${skill.target_hardware_id}:${skill.command?.[0]}`;
    if (!pricedMiddleware.has(key)) {
      const routesConfig = {
        'POST /asp/hire': {
          accepts: {
            scheme: 'exact',
            network: settings.monad.network,
            payTo: gatewayAddress,
            // Circle USDC on Monad signs EIP-3009 under the domain ("USDC", "2").
            // upfront = settle on-chain before the handler runs, so a motor never moves on an unpaid hire.
            price: {
              amount: skill.price,
              asset: skill.token,
              extra: { name: 'USDC', version: '2', paymentFlow: 'upfront' },
            },
          },
          description: `Hire ${skill.name || skill.id || 'skill'} for task execution`,
          mimeType: 'application/json',
        },
      };
      pricedMiddleware.set(key, paymentMiddleware(routesConfig, resourceServer));
    }
    return pricedMiddleware.get(key);
  };

  const applySkillPricing = (req, res, next) => {
    if (!gatewayAddress) {
      return res.status(503).json({ ok: false, error: 'gateway-address-missing' });
    }
    return middlewareFor(req.skill)(req, res, next);
  };

  // The middleware issues the 402 challenge, reads the PAYMENT-SIGNATURE header,
  // and settles on Monad via the facilitator before calling the final handler.
  router.post('/asp/hire', validatePetition, applySkillPricing, async (req, res) => {
    const petition = req.body;
    const skill = req.skill;

    // Re-check after payment (status may have changed; never dispatch without auth).
    const gate = assertHireAllowed({ skill, body: petition });
    if (!gate.ok) {
      return res.status(gate.status || 403).json({
        ok: false,
        error: gate.error,
        detail: gate.detail,
      });
    }
    
    // (c) dispatch using Unified Taxonomy
    try {
      const receipt = await dispatch(petition, skill);
      
      if (receipt.response) {
        console.log(`[GATEWAY] 🧠 AI Response for ${petition.target_hardware_id}:\n\x1b[36m${receipt.response}\x1b[0m`);
      }

      if (gate.petition?.petition_id) {
        markPetitionUsed(gate.petition.petition_id);
      }

      return res.json({
        ok:          true,
        message:     'execution correct',
        tx_id:       petition.tx_id,
        petition_id: gate.petition?.petition_id || petition.petition_id || null,
        target:      petition.target_hardware_id,
        receipt,
        gateway:     gatewayAddress,
        payer:       petition.requester,
        transaction: req.x402Settlement?.transaction || null,
        network:     req.x402Settlement?.network || settings.monad.network,
      });
    } catch (e) {
      return res.status(504).json({
        ok:    false,
        error: 'esp32-no-receipt',
        detail: e.message,
      });
    }
  });

  router.get('/asp/health', (req, res) => {
    res.json({ ok: true, gateway: gatewayAddress, uptime: process.uptime() });
  });

  router.get('/', (req, res) => {
    res.redirect('/user');
  });

  router.get('/user', (req, res) => {
    res.type('html').send(renderUserPage({ req, gatewayAddress }));
  });

  router.get('/agentic', (req, res) => {
    res.type('html').send(renderAgenticPage({ req, gatewayAddress }));
  });

  router.get('/asp/skills', (req, res) => {
    res.json({
      ok: true,
      skills
    });
  });

  // ── GET /asp/agent-guide.json ─────────────────────────────────────────
  // Exposes an AI-optimized, grouped schema of all hardware targets and instructions.
  router.get('/asp/agent-guide.json', (req, res) => {
    const baseUrl = getBaseUrl(req);
    
    // We now have the natively hierarchical 'devices' schema imported from settings!
    res.json({
      ok: true,
      system_description: "Asp Gateway - Exposes paid machine capabilities through x402 over HTTP.",
      agent_routing_instructions: [
        "For limited merch, capsule, gacha, or gachapon requests, use the Event Gachapon target and command DISPENSE_ONCE.",
        "Skills with proof_of_human.required=true BLOCK hire until a petition is authorized via World Proof of Human. Never blind-dispatch.",
        "Flow: POST /asp/petition → tell the human to verify (Selfie Check) → POST /asp/proof-of-human/verify → POST /asp/hire with petition_id + x402 payment.",
        "If the user refers to a robotic arm, select that PASSIVE target and its listed commands (no PoH required today).",
      ],
      route_contracts: {
        petition: {
          method: "POST",
          url: `${baseUrl}/asp/petition`,
          required_fields: ["requester", "target_hardware_id", "command"],
        },
        proof_of_human_verify: {
          method: "POST",
          url: `${baseUrl}/asp/proof-of-human/verify`,
          required_fields: ["petition_id", "idkitResponse"],
        },
        hire: {
          method: "POST",
          url: `${baseUrl}/asp/hire`,
          required_fields: ["tx_id", "requester", "target_hardware_id", "command"],
          when_poh_required: ["petition_id"],
          extra_fields_for_agentic: ["user_prompt", "context"],
        }
      },
      hardware_targets: devices
    });
  });

  // ── GET /asp/status ───────────────────────────────────────────────────
  // Subsystem snapshot — matches the simulator's surface.
  router.get('/asp/status', (req, res) => {
    res.json({
      ok:       true,
      gateway:  gatewayAddress,
      uptime:   process.uptime(),
      broker:   brokerState ? brokerState() : null,
      inflight: inFlight ? inFlight.size : 0,
    });
  });

  return router;
}

function isValidPetition(p) {
  return p
    && typeof p.tx_id              === 'string' && p.tx_id.length              > 0
    && typeof p.requester          === 'string' && p.requester.length          > 0
    && typeof p.target_hardware_id === 'string' && p.target_hardware_id.length > 0
    && Array.isArray(p.command)    && p.command.length            > 0;
}
