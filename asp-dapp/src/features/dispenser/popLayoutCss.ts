import { pop } from './popTheme';

/** Layout + components. Desktop-first two-column stage, stacks under 960px. */
export const POP_LAYOUT_CSS = `
.pop-root{min-height:100vh;display:flex;flex-direction:column;font-family:${pop.font};color:${pop.ink};
  background:${pop.cream};background-image:radial-gradient(rgba(232,17,45,.07) 1.6px,transparent 1.6px);background-size:22px 22px}
.pop-root *{box-sizing:border-box}
.pop-root button{font-family:inherit}
.pop-root :focus-visible{outline:3px solid ${pop.violet};outline-offset:3px}

.pop-header{position:sticky;top:0;z-index:30;background:${pop.paper};border-top:6px solid ${pop.red};box-shadow:0 1px 0 ${pop.line}}
.pop-header-inner{max-width:1240px;margin:0 auto;padding:12px 40px;display:flex;align-items:center;justify-content:space-between;gap:24px}
.pop-brand{display:flex;align-items:baseline;gap:10px;text-decoration:none}
.pop-brand-mark{font-size:34px;font-weight:900;color:${pop.red};letter-spacing:-1px;line-height:1}
.pop-brand-jp{white-space:nowrap;font-size:13px;font-weight:700;color:${pop.red};padding:3px 9px;border-radius:999px;background:rgba(232,17,45,.08)}
.pop-nav{display:flex;gap:6px;padding:5px;border-radius:999px;background:${pop.cream}}
.pop-nav a{padding:9px 22px;border-radius:999px;text-decoration:none;font-weight:700;font-size:15px;color:${pop.muted}}
.pop-nav a[aria-current=page]{background:${pop.red};color:#fff;box-shadow:0 4px 12px rgba(232,17,45,.3)}
.pop-header-side{display:flex;align-items:center;gap:10px}
.pop-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;font-size:12px;font-weight:700;
  border:1.5px solid ${pop.line};background:${pop.paper};color:${pop.ink}}
.pop-chip-violet{border-color:rgba(131,110,249,.35);color:${pop.violet};background:rgba(131,110,249,.08)}
.pop-chip-test{border-color:${pop.ink};background:${pop.ink};color:#fff;letter-spacing:.06em;text-transform:uppercase}
.pop-icon-btn{width:38px;height:38px;border-radius:50%;border:1.5px solid ${pop.line};background:${pop.paper};cursor:pointer;font-size:16px}

.pop-stage{flex:1;width:100%;max-width:1240px;margin:0 auto;padding:32px 40px 140px;display:grid;
  grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:56px;align-items:start}
.pop-hero{position:sticky;top:96px;display:flex;flex-direction:column;align-items:center;gap:22px}
.pop-panel{display:flex;flex-direction:column;gap:18px;min-width:0}

.pop-eyebrow{margin:0;display:inline-flex;gap:8px;align-items:center;font-size:13px;font-weight:700;letter-spacing:.08em;
  text-transform:uppercase;color:${pop.red}}
.pop-eyebrow b{font-size:15px;letter-spacing:0}
.pop-title{margin:0;font-size:52px;line-height:1.04;font-weight:900;letter-spacing:-1.5px}
.pop-title em{font-style:normal;color:${pop.red}}
.pop-lede{margin:0;font-size:18px;line-height:1.6;color:${pop.muted};max-width:520px}

.pop-card{background:${pop.paper};border-radius:28px;padding:26px;box-shadow:0 2px 0 ${pop.line},0 18px 40px rgba(35,24,21,.06)}
.pop-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:18px 24px;border:none;border-radius:999px;
  background:${pop.red};color:#fff;font-size:18px;font-weight:900;cursor:pointer;text-decoration:none;
  box-shadow:0 6px 0 ${pop.redDeep};transition:transform .08s ease,box-shadow .08s ease}
.pop-btn:active{transform:translateY(4px);box-shadow:0 2px 0 ${pop.redDeep}}
.pop-btn-ghost{background:${pop.paper};color:${pop.ink};box-shadow:0 0 0 2px ${pop.line} inset}
.pop-btn-ghost:active{box-shadow:0 0 0 2px ${pop.line} inset}
.pop-row{display:flex;gap:12px}
.pop-hint{margin:0;font-size:14px;color:${pop.muted};text-align:center}

.pop-steps{display:flex;gap:8px;margin:0;padding:0;list-style:none}
.pop-step{flex:1;display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:16px;background:rgba(35,24,21,.04);color:${pop.muted}}
.pop-step-num{flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-weight:900;font-size:14px;
  background:${pop.paper};box-shadow:0 0 0 1.5px ${pop.line} inset}
.pop-step-txt{display:flex;flex-direction:column;line-height:1.15;font-size:13px;font-weight:700}
.pop-step-txt small{font-size:11px;font-weight:500}
.pop-step[data-on=true]{background:${pop.red};color:#fff}
.pop-step[data-on=true] .pop-step-num{background:#fff;color:${pop.red};box-shadow:none}
.pop-step[data-done=true] .pop-step-num{background:${pop.ink};color:#fff;box-shadow:none}

.pop-footer{max-width:1240px;width:100%;margin:0 auto;padding:0 40px 120px;display:flex;justify-content:space-between;align-items:center;
  gap:12px;font-size:13px;color:${pop.muted}}
.pop-footer a{color:${pop.muted};font-weight:700;text-decoration:none}
.pop-footer-reset{border:1.5px solid ${pop.line};background:${pop.paper};color:${pop.muted};border-radius:999px;padding:8px 14px;
  font-size:13px;font-weight:700;cursor:pointer}
.pop-error{margin:0 0 14px;padding:12px;border-radius:14px;background:rgba(232,17,45,.07);color:${pop.redDeep};font-size:12px;
  font-family:${pop.mono};white-space:pre-wrap;word-break:break-word}
.pop-status{margin:0 0 14px;font-size:16px;line-height:1.5;font-weight:700}
.pop-chat{flex:1;width:100%;max-width:820px;margin:0 auto;padding:32px 24px 80px}
.pop-input{width:100%;padding:10px 16px;border:2px solid rgba(35,24,21,.12);border-radius:18px;background:${pop.cream};min-width:0}

@media (max-width:960px){
  .pop-stage{grid-template-columns:1fr;gap:28px;padding:24px 20px 140px}
  .pop-hero{position:static}
  .pop-title{font-size:38px}
  .pop-header-inner{padding:10px 18px}
  .pop-nav a{padding:8px 14px;font-size:14px}
  .pop-header-side .pop-chip,.pop-brand-jp{display:none}
  .pop-footer{padding:0 20px 120px}
}
`;
