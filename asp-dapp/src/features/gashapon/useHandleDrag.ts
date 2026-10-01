import { useCallback, useEffect, useRef, useState } from 'react';

export const MACHINE_VIEW = { w: 320, h: 440 };
export const HANDLE_CENTER = { x: 214, y: 318 };
const FULL_TURN = 360;
const STEP = 45;

type Options = {
  enabled: boolean;
  onStep: () => void;
  onTurned: () => void;
};

/** Clockwise drag around the knob; one full turn fires onTurned. Keyboard/auto turn included. */
export function useHandleDrag({ enabled, onStep, onTurned }: Options) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [angle, setAngle] = useState(0);
  const [turning, setTurning] = useState(false);
  const total = useRef(0);
  const last = useRef<number | null>(null);
  const done = useRef(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback(
    (delta: number) => {
      if (done.current) return;
      const before = total.current;
      total.current = Math.min(FULL_TURN, before + delta);
      if (Math.floor(total.current / STEP) > Math.floor(before / STEP)) onStep();
      setAngle(total.current);
      if (total.current >= FULL_TURN) {
        done.current = true;
        setTurning(false);
        onTurned();
      }
    },
    [onStep, onTurned]
  );

  const pointAngle = (e: React.PointerEvent) => {
    const r = svgRef.current!.getBoundingClientRect();
    const x = (e.clientX - r.left) * (MACHINE_VIEW.w / r.width) - HANDLE_CENTER.x;
    const y = (e.clientY - r.top) * (MACHINE_VIEW.h / r.height) - HANDLE_CENTER.y;
    return (Math.atan2(y, x) * 180) / Math.PI;
  };

  const autoTurn = useCallback(() => {
    if (!enabled || done.current || timer.current) return;
    setTurning(true);
    timer.current = setInterval(() => {
      advance(9);
      if (done.current && timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    }, 16);
  }, [advance, enabled]);

  useEffect(() => () => void (timer.current && clearInterval(timer.current)), []);

  const handleProps = {
    onPointerDown: (e: React.PointerEvent<SVGGElement>) => {
      if (!enabled || done.current) return;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Pointer already released; moves still arrive while it stays over the knob.
      }
      last.current = pointAngle(e);
      setTurning(true);
    },
    onPointerMove: (e: React.PointerEvent<SVGGElement>) => {
      if (last.current === null) return;
      const a = pointAngle(e);
      let d = a - last.current;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      last.current = a;
      if (d > 0) advance(d);
    },
    onPointerUp: () => {
      last.current = null;
      if (!done.current) setTurning(false);
    },
    onKeyDown: (e: React.KeyboardEvent<SVGGElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        autoTurn();
      }
    },
  };

  return { svgRef, angle, turning, handleProps, autoTurn };
}
