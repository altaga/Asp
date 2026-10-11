/**
 * Disk-backed ledger for the state that enforces "one human, one item":
 * tickets ↔ nullifiers, per-release claims, petitions, pay intents and spent tx hashes.
 * A restart must never reopen a claim or let a paid tx be reused.
 */
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve(process.env.ASP_DATA_DIR || 'data');
const FILE = path.join(DATA_DIR, 'ledger.json');
const FLUSH_MS = 500;

const maps = new Map(); // name → Map<string, unknown>
const saved = readLedgerFile();
let lastJson = '';

function readLedgerFile() {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch (err) {
    if (err.code !== 'ENOENT') console.error(`[LEDGER] could not read ${FILE}: ${err.message}`);
    return {};
  }
}

/** A Map restored from disk under `name`; values are mutated in place and picked up by the next flush. */
export function ledgerMap(name) {
  const map = new Map(Object.entries(saved[name] || {}));
  maps.set(name, map);
  return map;
}

export function flushLedger() {
  const snapshot = {};
  for (const [name, map] of maps) snapshot[name] = Object.fromEntries(map);
  const json = JSON.stringify(snapshot);
  if (json === lastJson) return;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${FILE}.tmp`;
  fs.writeFileSync(tmp, json);
  fs.renameSync(tmp, FILE);
  lastJson = json;
}

export function ledgerStats() {
  return Object.fromEntries([...maps].map(([name, map]) => [name, map.size]));
}

setInterval(() => {
  try {
    flushLedger();
  } catch (err) {
    console.error(`[LEDGER] flush failed: ${err.message}`);
  }
}, FLUSH_MS).unref();
