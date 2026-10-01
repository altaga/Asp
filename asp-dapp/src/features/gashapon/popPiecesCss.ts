import { pop } from './popTheme';

/** Daishi lineup, capsule ticket, machine, reveal and the proposal switcher. */
export const POP_PIECES_CSS = `
.pop-daishi{width:100%;max-width:560px;background:${pop.paper};border-radius:26px;padding:18px 22px 20px;position:relative;overflow:hidden;
  box-shadow:0 2px 0 ${pop.line},0 14px 30px rgba(35,24,21,.06)}
.pop-daishi::before{content:"";position:absolute;inset:0 auto auto 0;width:64px;height:64px;background:${pop.red};
  clip-path:polygon(0 0,100% 0,0 100%)}
.pop-daishi-head{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin-bottom:14px;padding-left:26px}
.pop-daishi-title{display:flex;flex-direction:column;gap:2px}
.pop-daishi-title b{font-size:18px;font-weight:900}
.pop-daishi-title span{font-size:12px;color:${pop.muted};font-weight:700;letter-spacing:.06em;text-transform:uppercase}
.pop-left{display:flex;align-items:baseline;gap:6px;font-weight:900}
.pop-left small{font-size:13px;color:${pop.muted}}
.pop-left strong{font-size:40px;color:${pop.red};line-height:1}
.pop-left span{font-size:18px;color:${pop.muted}}
.pop-lineup{display:grid;grid-template-columns:repeat(10,1fr);gap:6px;margin:0;padding:0;list-style:none}
.pop-slot{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:11px;font-weight:700;color:${pop.muted};position:relative}
.pop-slot[data-gone=true] svg{filter:grayscale(1);opacity:.35}
.pop-slot[data-yours=true]::after{content:"YOU";position:absolute;top:-10px;padding:1px 6px;border-radius:999px;font-size:9px;
  background:${pop.violet};color:#fff}
.pop-slot[data-yours=true] svg{filter:drop-shadow(0 0 8px rgba(131,110,249,.8))}

.pop-ticket{display:flex;border-radius:24px;overflow:hidden;background:${pop.paper};box-shadow:0 2px 0 ${pop.line},0 18px 40px rgba(35,24,21,.08)}
.pop-ticket-stub{flex:none;width:120px;background:${pop.red};color:#fff;display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:6px;position:relative}
.pop-ticket-stub::after{content:"";position:absolute;right:-1px;top:12px;bottom:12px;border-right:3px dotted ${pop.cream}}
.pop-ticket-stub b{font-size:44px;font-weight:900;line-height:1;writing-mode:vertical-rl}
.pop-ticket-stub span{font-size:11px;font-weight:700;letter-spacing:.08em}
.pop-ticket-body{flex:1;padding:22px 26px;display:flex;flex-direction:column;gap:10px;min-width:0}
.pop-ticket-top{display:flex;justify-content:space-between;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${pop.muted}}
.pop-ticket-code{font-family:${pop.mono};font-size:44px;font-weight:700;letter-spacing:4px;line-height:1.1}
.pop-ticket[data-used=true] .pop-ticket-stub{background:#9B918C}
.pop-ticket[data-used=true] .pop-ticket-code{color:${pop.muted};text-decoration:line-through;text-decoration-thickness:3px}
.pop-stamp{align-self:flex-start;padding:4px 12px;border:2.5px solid ${pop.red};border-radius:10px;color:${pop.red};font-weight:900;
  font-size:14px;transform:rotate(-6deg)}

.pop-machine-wrap{position:relative;width:100%;max-width:clamp(260px,calc((100vh - 330px) * .73),380px)}
.pop-machine{width:100%;height:auto;display:block;overflow:visible}
.pop-handle{cursor:grab;touch-action:none;outline:none}
.pop-handle:active{cursor:grabbing}
.pop-handle[data-locked=true]{cursor:not-allowed}
.pop-handle:focus-visible .pop-handle-disc{stroke:${pop.violet};stroke-width:6}
.pop-turn-hint{position:absolute;right:-6px;top:58%;display:flex;flex-direction:column;align-items:center;gap:2px;font-weight:900;
  color:${pop.red};font-size:15px;pointer-events:none}
.pop-turn-hint small{font-size:12px;color:${pop.muted}}
.pop-lock{position:absolute;left:50%;top:58%;transform:translate(-50%,-50%);padding:8px 14px;border-radius:999px;background:rgba(35,24,21,.82);
  color:#fff;font-size:13px;font-weight:700;white-space:nowrap;pointer-events:none}

.pop-reveal{position:relative;display:grid;grid-template-columns:220px 1fr;gap:22px;align-items:center}
.pop-art{width:220px;height:220px;border-radius:24px;display:block;box-shadow:0 0 0 4px #fff,0 0 0 6px ${pop.violet},0 24px 50px rgba(131,110,249,.45)}
.pop-art-wrap{position:relative;border-radius:24px}
.pop-art-wrap::after{content:"";position:absolute;inset:0;border-radius:24px;pointer-events:none;
  background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,.55) 50%,transparent 65%);background-size:250% 100%}
.pop-win{margin:0;font-size:15px;font-weight:900;color:${pop.red}}
.pop-nft-name{margin:2px 0 6px;font-size:32px;font-weight:900;letter-spacing:-.5px}
.pop-badges{display:flex;flex-wrap:wrap;gap:8px}
.pop-badge{padding:5px 12px;border-radius:999px;font-size:13px;font-weight:700;background:rgba(35,24,21,.06)}
.pop-badge-red{background:${pop.red};color:#fff}
.pop-meta{display:grid;grid-template-columns:1fr 1fr;gap:12px 18px;margin:18px 0 0}
.pop-meta dt{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${pop.muted}}
.pop-meta dd{margin:2px 0 0;font-family:${pop.mono};font-size:14px;font-weight:700}
.pop-meta a{color:${pop.violet}}
.pop-wallet-tip{margin-top:16px;padding:12px 14px;border-radius:16px;background:rgba(131,110,249,.08);font-size:14px;line-height:1.5}
.pop-confetti{position:absolute;inset:-40px;pointer-events:none;overflow:visible}
.pop-confetti i{position:absolute;left:50%;top:40%;width:12px;height:12px;border-radius:50%}

.pop-switcher{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:50;display:flex;align-items:center;gap:6px;
  max-width:calc(100vw - 24px);overflow-x:auto;padding:7px;border-radius:999px;background:rgba(35,24,21,.92);color:#fff;
  box-shadow:0 12px 30px rgba(0,0,0,.25)}
.pop-switcher-label{padding:0 10px;font-size:11px;font-weight:900;letter-spacing:.1em;color:${pop.yellow};white-space:nowrap}
.pop-switcher button,.pop-switcher a{border:none;background:transparent;color:rgba(255,255,255,.7);padding:8px 13px;border-radius:999px;
  font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;text-decoration:none}
.pop-switcher [aria-pressed=true]{background:#fff;color:${pop.ink}}
.pop-switcher-sep{width:1px;height:20px;background:rgba(255,255,255,.2);flex:none}

@media (max-width:960px){
  .pop-reveal{grid-template-columns:1fr;justify-items:center;text-align:center}
  .pop-badges{justify-content:center}
  .pop-ticket-code{font-size:32px}
  .pop-ticket-stub{width:84px}
}
`;
