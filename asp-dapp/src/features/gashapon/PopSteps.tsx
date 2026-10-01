import React from 'react';

export type PopStep = { jp: string; en: string };

type Props = { steps: PopStep[]; current: number };

/** Numbered pill rail; steps before `current` read as done. */
export function PopSteps({ steps, current }: Props) {
  return (
    <ol className="pop-steps" aria-label="Progress">
      {steps.map((s, i) => (
        <li
          key={s.en}
          className="pop-step"
          data-on={i === current}
          data-done={i < current}
          aria-current={i === current ? 'step' : undefined}
        >
          <span className="pop-step-num">{i < current ? '✓' : i + 1}</span>
          <span className="pop-step-txt">
            <span lang="ja">{s.jp}</span>
            <small>{s.en}</small>
          </span>
        </li>
      ))}
    </ol>
  );
}
