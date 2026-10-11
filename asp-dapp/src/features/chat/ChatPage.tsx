import React, { useEffect, useRef, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { useAspChat } from './useAspChat';
import { WorldVerifyModal } from '../world/WorldVerifyModal';
import { theme } from '../../theme/tokens';

import { useAccount, useDisconnect } from 'wagmi';
import { openWalletModal } from '../wallet/appKit';
import { useX402Fetch } from '../wallet/useX402Fetch';

const { toast } = require('react-hot-toast');

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function ChatPage() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const x402Fetch = useX402Fetch();
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const chat = useAspChat({
    accountAddress: address || null,
    x402Fetch,
  });

  const onWalletClick = async () => {
    if (address) return disconnect();
    try {
      await openWalletModal();
    } catch (e: any) {
      toast.error(e?.message || 'Could not open WalletConnect');
    }
  };

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [chat.messages, chat.busy]);

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const value = input;
    setInput('');
    await chat.sendFreeText(value);
  };

  return (
    <div>
      <div style={styles.headerRow}>
        <div>
          <p className="pop-eyebrow">
            <b lang="ja">雇う</b> Hire a machine · x402
          </p>
          <h1 className="pop-title" style={styles.title}>
            Agents can <em>knock.</em>
          </h1>
          <p style={styles.brandSub}>Machines with a World lock still need the human to prove it.</p>
        </div>
        <button type="button" style={styles.chip} onClick={() => void onWalletClick()}>
          {address ? `${shortAddr(address)} · Disconnect` : 'Connect wallet'}
        </button>
      </div>

      <div ref={listRef} style={styles.messageList}>
        {chat.messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            verifyingId={chat.worldOpen ? chat.activePoh?.petition_id : null}
            onVerify={chat.openWorldVerify}
            onRevoke={chat.cancelPoh}
          />
        ))}
      </div>

      <div style={styles.quickRow}>
        <button type="button" style={styles.chip} onClick={() => chat.requestCapsule()} disabled={chat.busy}>
          Request capsule
        </button>
        <button
          type="button"
          style={styles.chip}
          onClick={() => chat.activePoh && chat.openWorldVerify(chat.activePoh)}
          disabled={!chat.activePoh || chat.busy}
        >
          Verify World
        </button>
        <button type="button" style={styles.chipPrimary} onClick={() => chat.payAndDispense()} disabled={chat.busy}>
          Pay & dispense
        </button>
      </div>

      <form style={styles.composer} onSubmit={onSubmit}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message Asp…"
          disabled={chat.busy}
        />
        <button type="submit" style={styles.send} disabled={chat.busy || !input.trim()}>
          Send
        </button>
      </form>

      <WorldVerifyModal
        open={chat.worldOpen}
        onOpenChange={chat.setWorldOpen}
        action={chat.activePoh?.preferred_action || chat.activePoh?.job_action || 'asp-job-pending'}
        signal={address}
        onVerified={async (result) => {
          try {
            await chat.onWorldProof(result);
            toast.success('World verification accepted');
          } catch (e: any) {
            toast.error(e?.message || 'Verify failed');
            throw e;
          }
        }}
        onError={(msg) => toast.error(msg)}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  title: { fontSize: 40, margin: '6px 0 8px' },
  brandSub: { margin: 0, fontSize: 15, color: theme.textSecondary },
  messageList: { minHeight: 360, marginBottom: 12 },
  quickRow: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    border: `1px solid ${theme.borderStrong}`,
    background: theme.surface,
    borderRadius: 980,
    padding: '8px 14px',
    fontSize: 13,
    cursor: 'pointer',
  },
  chipPrimary: {
    border: 'none',
    background: theme.accent,
    color: '#fff',
    borderRadius: 980,
    padding: '8px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  composer: {
    display: 'flex',
    gap: 10,
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: 24,
    padding: 8,
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: 15,
    padding: '10px 12px',
  },
  send: {
    border: 'none',
    background: theme.text,
    color: '#fff',
    borderRadius: 980,
    padding: '10px 18px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
