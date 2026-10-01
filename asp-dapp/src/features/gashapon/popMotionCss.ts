/** Keyframes + motion classes. Reduced motion lands every animation on its end frame. */
export const POP_MOTION_CSS = `
@keyframes popFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes popJiggle{0%,100%{transform:translate(0,0)}30%{transform:translate(2px,-6px)}60%{transform:translate(-3px,3px)}}
@keyframes popHint{0%,100%{transform:translateX(0);opacity:.9}50%{transform:translateX(6px);opacity:1}}
@keyframes popDrop{0%{transform:translateY(-70px) scale(.6);opacity:0}25%{opacity:1}55%{transform:translateY(0) scale(1)}
  70%{transform:translateY(-18px)}84%{transform:translateY(0)}92%{transform:translateY(-6px)}100%{transform:translateY(0)}}
@keyframes popWobble{0%,100%{transform:rotate(-10deg)}50%{transform:rotate(10deg)}}
@keyframes popTopOff{to{transform:translate(-40px,-60px) rotate(-60deg);opacity:0}}
@keyframes popBottomOff{to{transform:translate(34px,30px) rotate(40deg);opacity:0}}
@keyframes popFlash{0%{transform:scale(.2);opacity:0}40%{opacity:1}100%{transform:scale(2.2);opacity:0}}
@keyframes popReveal{0%{transform:scale(.3) rotate(-14deg);opacity:0}60%{transform:scale(1.06) rotate(3deg);opacity:1}100%{transform:scale(1) rotate(0)}}
@keyframes popShine{0%{background-position:150% 0}100%{background-position:-60% 0}}
@keyframes popBurst{0%{transform:translate(-50%,-50%) scale(.4);opacity:1}100%{transform:translate(calc(-50% + var(--x)),calc(-50% + var(--y))) scale(1) rotate(var(--r));opacity:0}}
@keyframes popCount{0%{transform:scale(1.6);color:#836EF9}100%{transform:scale(1)}}
@keyframes popIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes popSpin{to{transform:rotate(360deg)}}

.pop-float{animation:popFloat 4s ease-in-out infinite}
.pop-dome-cap{transform-box:fill-box;transform-origin:center}
.pop-machine[data-state=ready] .pop-dome-cap,.pop-machine[data-turning=true] .pop-dome-cap{animation:popJiggle .45s ease-in-out infinite}
.pop-turn-hint{animation:popHint 1.2s ease-in-out infinite}
.pop-out-cap{transform-box:fill-box;transform-origin:center}
.pop-machine[data-state=dropped] .pop-out-cap{animation:popDrop .9s cubic-bezier(.3,.7,.4,1) both,popWobble .9s ease-in-out .9s infinite}
.pop-machine[data-state=open] .pop-out-top{transform-box:fill-box;animation:popTopOff .7s ease-out forwards}
.pop-machine[data-state=open] .pop-out-bottom{transform-box:fill-box;animation:popBottomOff .7s ease-out forwards}
.pop-flash{transform-box:fill-box;transform-origin:center;animation:popFlash .8s ease-out forwards}
.pop-reveal-art{animation:popReveal .8s cubic-bezier(.2,.9,.3,1.2) both}
.pop-art-wrap::after{animation:popShine 2.4s ease-in-out .6s infinite}
.pop-confetti i{animation:popBurst 1.4s cubic-bezier(.15,.7,.3,1) forwards}
.pop-left strong[data-bump=true]{display:inline-block;animation:popCount .7s ease-out}
.pop-enter{animation:popIn .45s ease-out both}
.pop-spinner{width:56px;height:56px;border-radius:50%;border:6px solid rgba(232,17,45,.15);border-top-color:#E8112D;animation:popSpin .9s linear infinite}

@media (prefers-reduced-motion:reduce){
  .pop-root *,.pop-root *::before,.pop-root *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition:none!important}
}
`;
