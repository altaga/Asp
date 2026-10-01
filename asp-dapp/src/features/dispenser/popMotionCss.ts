/** Keyframes + motion classes. Reduced motion lands every animation on its end frame. */
export const POP_MOTION_CSS = `
@keyframes popFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes popPulse{0%{transform:scale(1);opacity:.9}100%{transform:scale(1.45);opacity:0}}
@keyframes popDash{to{stroke-dashoffset:-18}}
@keyframes popFall{0%{transform:translate(0,0)}18%{transform:translate(0,-3px) scale(1.06)}30%{transform:translate(0,0)}
  80%{transform:translate(var(--dx),var(--dy))}88%{transform:translate(var(--dx),calc(var(--dy) - 9px))}100%{transform:translate(var(--dx),var(--dy))}}
@keyframes popSettle{0%,100%{transform:rotate(0)}30%{transform:rotate(-6deg)}65%{transform:rotate(4deg)}}
@keyframes popLift{to{transform:translateY(-36px) scale(1.15);opacity:0}}
@keyframes popFlash{0%{transform:scale(.2);opacity:0}40%{opacity:1}100%{transform:scale(2.2);opacity:0}}
@keyframes popReveal{0%{transform:translateY(24px) scale(.92);opacity:0}100%{transform:none;opacity:1}}
@keyframes popShine{0%{background-position:150% 0}100%{background-position:-60% 0}}
@keyframes popCount{0%{transform:scale(1.6);color:#836EF9}100%{transform:scale(1)}}
@keyframes popIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes popSpin{to{transform:rotate(360deg)}}

.pop-float{animation:popFloat 4s ease-in-out infinite}
.pop-push-pulse{transform-box:fill-box;transform-origin:center;animation:popPulse 1.3s ease-out infinite}
.pop-next-ring{animation:popDash .8s linear infinite}
.pop-falling{animation:popFall 1.3s cubic-bezier(.45,.05,.55,1) both}
.pop-tray-item{transform-box:fill-box;transform-origin:center bottom;animation:popSettle .7s ease-out}
.pop-tray-wait{animation:popSettle .9s ease-in-out infinite}
.pop-machine[data-state=collected] .pop-tray-item{animation:popLift .7s ease-out forwards}
.pop-flash{transform-box:fill-box;transform-origin:center;animation:popFlash .8s ease-out forwards}
.pop-reveal-art{animation:popReveal .6s cubic-bezier(.2,.9,.3,1) both}
.pop-art-wrap::after{animation:popShine 2.4s ease-in-out .6s infinite}
.pop-left strong[data-bump=true]{display:inline-block;animation:popCount .7s ease-out}
.pop-enter{animation:popIn .45s ease-out both}
.pop-spinner{width:56px;height:56px;border-radius:50%;border:6px solid rgba(232,17,45,.15);border-top-color:#E8112D;animation:popSpin .9s linear infinite}

@media (prefers-reduced-motion:reduce){
  .pop-root *,.pop-root *::before,.pop-root *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition:none!important}
}
`;
