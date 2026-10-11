// Renders the Asp brand (dispenser mark) and the capsule art to PNG.
// Run from asp-dapp: npm run brand
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { COLORWAYS, capsuleSvg } from '../src/features/nft/nftArt.ts';
import { pop, POP_FONTS_HREF } from '../src/features/dispenser/popTheme.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const dapp = path.resolve(here, '..');
const repo = path.resolve(dapp, '..');
const out = {
  brand: path.join(repo, 'images', 'brand'),
  capsules: path.join(repo, 'images', 'capsules'),
  appAssets: path.join(dapp, 'assets'),
};

const WHITE = '#FFFFFF';

const page = (body, css = '') => `<!doctype html><html><head>
<link rel="stylesheet" href="${POP_FONTS_HREF}">
<style>
  html,body{margin:0;background:transparent}
  body{font-family:${pop.font}}
  .asp{font-weight:900;letter-spacing:-0.03em;line-height:1;text-box:trim-both cap alphabetic}
  ${css}
</style></head><body>${body}</body></html>`;

/** Wordmark alone, tight crop. */
const mark = (color) =>
  page(`<div id="s" style="display:inline-block;padding:0.12em 0.1em;font-size:600px">
    <div class="asp" style="color:${color}">ASP</div></div>`);

/** Header lockup: ASP + 限定自販機 pill, as in DispenserShell. */
const lockup = (color, pillBg) =>
  page(`<div id="s" style="display:inline-flex;align-items:center;gap:0.3em;padding:0.14em 0.12em;font-size:400px">
    <span class="asp" style="color:${color};display:block">ASP</span>
    <span lang="ja" style="white-space:nowrap;font-size:0.38em;font-weight:700;color:${color};
      padding:0.22em 0.7em;border-radius:999px;background:${pillBg}">限定自販機</span></div>`);

/** Square app tile. `radius` 0 for store icons (the OS masks them). */
const tile = ({ size, bg, fg, scale, radius = 0, jp = false }) =>
  page(`<div id="s" style="width:${size}px;height:${size}px;background:${bg};border-radius:${radius}px;
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${size * 0.02}px">
    <div class="asp" style="color:${fg};font-size:${size * scale}px">ASP</div>
    ${jp ? `<div lang="ja" style="color:${fg};font-size:${size * 0.075}px;font-weight:700;opacity:.85;margin-top:${size * 0.05}px">限定自販機</div>` : ''}
  </div>`);

const solid = (size, bg) => page(`<div id="s" style="width:${size}px;height:${size}px;background:${bg}"></div>`);

const capsule = (tokenId, size) =>
  page(`<img id="s" width="${size}" height="${size}" style="display:block"
    src="data:image/svg+xml;utf8,${encodeURIComponent(capsuleSvg(tokenId))}">`);

async function shot(browser, html, file, viewport = { width: 2400, height: 2400 }) {
  const tab = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  await tab.setContent(html, { waitUntil: 'networkidle' });
  await tab.evaluate(() => document.fonts.ready);
  await tab.locator('#s').screenshot({ path: file, omitBackground: true });
  await tab.close();
  console.log('  ' + path.relative(repo, file));
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

async function main() {
  await Promise.all(Object.values(out).map((dir) => mkdir(dir, { recursive: true })));
  const browser = await chromium.launch();
  try {
    const b = (name) => path.join(out.brand, name);
    await shot(browser, mark(pop.red), b('asp-mark.png'));
    await shot(browser, mark(WHITE), b('asp-mark-white.png'));
    await shot(browser, lockup(pop.red, 'rgba(232,17,45,.08)'), b('asp-lockup.png'));
    await shot(browser, lockup(WHITE, 'rgba(255,255,255,.14)'), b('asp-lockup-white.png'));
    await shot(browser, tile({ size: 1024, bg: pop.red, fg: WHITE, scale: 0.3, jp: true }), b('asp-icon.png'));
    await shot(browser, tile({ size: 1024, bg: pop.red, fg: WHITE, scale: 0.34, radius: 224 }), b('asp-icon-rounded.png'));

    const a = (name) => path.join(out.appAssets, name);
    await shot(browser, tile({ size: 1024, bg: pop.red, fg: WHITE, scale: 0.3, jp: true }), a('icon.png'));
    await shot(browser, tile({ size: 256, bg: pop.red, fg: WHITE, scale: 0.36, radius: 56 }), a('favicon.png'));
    await shot(browser, tile({ size: 1024, bg: 'transparent', fg: WHITE, scale: 0.2 }), a('android-icon-foreground.png'));
    await shot(browser, tile({ size: 1024, bg: 'transparent', fg: WHITE, scale: 0.2 }), a('android-icon-monochrome.png'));
    await shot(browser, solid(1024, pop.red), a('android-icon-background.png'));
    await shot(browser, lockup(pop.red, 'rgba(232,17,45,.08)'), a('splash-icon.png'));
    for (let id = 1; id <= COLORWAYS.length; id++) {
      const name = `capsule-${String(id).padStart(2, '0')}-${slug(COLORWAYS[id - 1].name)}.png`;
      await shot(browser, capsule(id, 1024), path.join(out.capsules, name));
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
