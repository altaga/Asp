import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { FALL_MS } from './dispenserLayout';
import { buzz, popSound } from './popSound';

type Options = {
  /** PUSH is pressable (proposal flow). */
  enabled: boolean;
  /** The system is releasing an item right now (real flow: payment settled) — vend without a press. */
  forced?: boolean;
  onDispensed?: () => void;
};

/** One vend: press (or forced) → motor whirr → item lands in the tray → onDispensed. */
export function useDispense({ enabled, forced = false, onDispensed }: Options) {
  const [vending, setVending] = useState(false);
  const [landed, setLanded] = useState(false);
  const done = useRef(onDispensed);
  done.current = onDispensed;

  const started = useRef(false);

  const vend = useCallback(() => {
    if (started.current) return;
    started.current = true;
    setVending(true);
    popSound.press();
    buzz(10);
    setTimeout(() => popSound.whirr(), 120);
  }, []);

  const dispense = useCallback(() => {
    if (enabled) vend();
  }, [enabled, vend]);

  useEffect(() => {
    if (forced) vend();
  }, [forced, vend]);

  useEffect(() => {
    if (!vending) return;
    const t = setTimeout(() => {
      setLanded(true);
      popSound.thud();
      buzz([20, 40, 60]);
      done.current?.();
    }, FALL_MS);
    return () => clearTimeout(t);
  }, [vending]);

  const buttonProps = {
    onClick: dispense,
    onKeyDown: (e: KeyboardEvent<SVGGElement>) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      dispense();
    },
  };

  return { vending, landed, dispense, buttonProps };
}
