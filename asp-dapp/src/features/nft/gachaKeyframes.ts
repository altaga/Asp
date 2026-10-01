/** CSS keyframes for GachaDrop. Reduced motion jumps every animation to its end state. */
export const GACHA_KEYFRAMES = `
@keyframes aspKnob { to { transform: rotate(720deg); } }
@keyframes aspShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
@keyframes aspJiggle { 0%,100% { transform: translate(0,0); } 30% { transform: translate(2px,-5px); } 60% { transform: translate(-3px,2px); } }
@keyframes aspDrop {
  0% { transform: translate(37px,-6px) scale(.5); opacity: 0; }
  15% { transform: translate(37px,0) scale(1); opacity: 1; }
  55% { transform: translate(18px,44px); }
  70% { transform: translate(10px,28px); }
  84% { transform: translate(4px,44px); }
  92% { transform: translate(2px,38px); }
  100% { transform: translate(0,44px); opacity: 1; }
}
@keyframes aspWobble { 0%,100% { transform: translate(0,44px) rotate(-9deg); } 50% { transform: translate(0,44px) rotate(9deg); } }
@keyframes aspTopOff { to { transform: translate(-46px,-70px) rotate(-55deg); opacity: 0; } }
@keyframes aspBottomOff { to { transform: translate(36px,34px) rotate(35deg); opacity: 0; } }
@keyframes aspFlash { 0% { transform: scale(.2); opacity: 0; } 40% { opacity: 1; } 100% { transform: scale(1.6); opacity: 0; } }
@keyframes aspReveal { 0% { transform: scale(.2) rotate(-12deg); opacity: 0; } 60% { transform: scale(1.05) rotate(2deg); opacity: 1; } 100% { transform: scale(1) rotate(0); opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
}
`;
