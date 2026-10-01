/**
 * Postinstall: Expo Web cannot resolve idkit WASM via import.meta.url.
 * Copies wasm to /public and rewrites the loader URL (see Knowledge/world-id.md).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const wasmSrc = path.join(root, 'node_modules', '@worldcoin', 'idkit-core', 'dist', 'idkit_wasm_bg.wasm');
const wasmDestDir = path.join(root, 'public');
const wasmDest = path.join(wasmDestDir, 'idkit_wasm_bg.wasm');
const distDir = path.join(root, 'node_modules', '@worldcoin', 'idkit-core', 'dist');
// Metro picks index.cjs; a relative URL resolves against the page path and 404s under nested routes like /test/claim.
const loaders = ['index.js', 'index.cjs', 'idkit.global.js'].map((f) => path.join(distDir, f));

if (!fs.existsSync(wasmSrc)) {
  console.warn('[patch-idkit-wasm] wasm source missing — skip');
  process.exit(0);
}

fs.mkdirSync(wasmDestDir, { recursive: true });
fs.copyFileSync(wasmSrc, wasmDest);

for (const file of loaders) {
  if (!fs.existsSync(file)) continue;
  const name = path.basename(file);
  const src = fs.readFileSync(file, 'utf8');
  const next = src
    .replace(
      /new URL\(\s*"idkit_wasm_bg\.wasm"\s*,\s*import\.meta\.url\s*\)/g,
      'new URL("/idkit_wasm_bg.wasm", window.location.origin)'
    )
    .replace(/new URL\(\s*"idkit_wasm_bg\.wasm"/g, 'new URL("/idkit_wasm_bg.wasm"');
  if (next !== src) {
    fs.writeFileSync(file, next);
    console.log(`[patch-idkit-wasm] patched ${name}`);
  } else if (src.includes('"/idkit_wasm_bg.wasm"')) {
    console.log(`[patch-idkit-wasm] ${name} already patched`);
  } else {
    console.warn(`[patch-idkit-wasm] ${name}: pattern not found — check idkit-core version`);
  }
}

console.log('[patch-idkit-wasm] public/idkit_wasm_bg.wasm ready');
