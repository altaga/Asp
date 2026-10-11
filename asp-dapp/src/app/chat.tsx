import React from 'react';
import { ChatPage } from '../features/chat/ChatPage';
import { DispenserShell } from '../features/dispenser/DispenserShell';
import { POP_EVENT } from '../features/dispenser/popTheme';

/** `/chat` — the x402 door: an agent discovers skills and hires machines; PoH-locked skills still need a human. */
export default function ChatRoute() {
  return (
    <DispenserShell
      active="hire"
      title="Asp · Hire"
      getHref="/"
      claimHref="/claim"
      footer={<span>{POP_EVENT} · machines you can hire on Monad</span>}
    >
      <main className="pop-chat">
        <ChatPage />
      </main>
    </DispenserShell>
  );
}
