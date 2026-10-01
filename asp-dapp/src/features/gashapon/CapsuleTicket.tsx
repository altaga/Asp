import React from 'react';
import { POP_EVENT } from './popTheme';

type Props = {
  code: string;
  used?: boolean;
  children?: React.ReactNode;
};

/** The World-bound ticket: red stub with 限定, code on the body, stamp when verified. */
export function CapsuleTicket({ code, used, children }: Props) {
  return (
    <section className="pop-ticket pop-enter" data-used={used} aria-label={used ? 'Used ticket' : 'Your ticket'}>
      <div className="pop-ticket-stub">
        <b lang="ja">限定</b>
        <span>{used ? 'USED' : 'WINNER'}</span>
      </div>
      <div className="pop-ticket-body">
        <div className="pop-ticket-top">
          <span>{POP_EVENT}</span>
          <span>1 human · 1 capsule</span>
        </div>
        <div className="pop-ticket-code">{code}</div>
        <span className="pop-stamp" lang="ja">
          {used ? '使用済み USED' : '本人確認 VERIFIED'}
        </span>
        {children}
      </div>
    </section>
  );
}
