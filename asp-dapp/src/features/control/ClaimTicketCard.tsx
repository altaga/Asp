import React from 'react';

type Props = {
  draft: string;
  onDraft: (v: string) => void;
  onContinue: () => void;
  busy: boolean;
  loadedTicket: string;
  ticketReady: boolean;
  /** Ticket already redeemed — stamp it and ask for another. */
  used: boolean;
  noun: string;
};

/** Ticket entry at the top of Claim; stamps 使用済み when the ticket already took its item. */
export function ClaimTicketCard({ draft, onDraft, onContinue, busy, loadedTicket, ticketReady, used, noun }: Props) {
  return (
    <div className="pop-card pop-enter">
      <label htmlFor="asp-ticket" className="pop-eyebrow" style={{ color: 'inherit' }}>Ticket</label>
      <div className="pop-row" style={{ margin: '8px 0 10px' }}>
        <input
          id="asp-ticket"
          className="pop-ticket-code pop-input"
          style={{ fontSize: 28, flex: 1 }}
          value={draft}
          placeholder="WIN-······"
          autoComplete="off"
          spellCheck={false}
          disabled={busy}
          onChange={(e) => onDraft(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onContinue();
          }}
        />
        <button type="button" className="pop-btn" style={{ width: 'auto' }} disabled={busy || !draft.trim()} onClick={onContinue}>
          Continue
        </button>
      </div>
      {used ? (
        <>
          <p className="pop-stamp" lang="ja" style={{ margin: '4px 0 10px' }}>使用済み USED</p>
          <p className="pop-hint" style={{ textAlign: 'left' }}>
            <b>{loadedTicket || 'This ticket'}</b> already got its {noun}. One human, one item — put a different unused ticket above.
          </p>
        </>
      ) : (
        <p className="pop-hint" style={{ textAlign: 'left' }}>
          {loadedTicket
            ? <><b>{loadedTicket}</b>{ticketReady ? ' · loaded' : ' · tap Continue to look it up'}</>
            : 'No ticket yet — get one first if you need a code.'}
        </p>
      )}
    </div>
  );
}
