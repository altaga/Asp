import { useCallback, useState } from 'react';
import { ENROLL_ACTION, enrollWinner } from '../hire/gateway';
import { clearDemoTicket, saveDemoTicket } from './aspDemoTicket';

const { toast } = require('react-hot-toast');

export type GetPhase = 'ready' | 'working' | 'done' | 'error';

/**
 * Off-kiosk winner invite — World ID → ticket.
 * Nullifier is the stable identity; ticket is what the human brings to the kiosk.
 */
export function useGetTicket() {
  const [phase, setPhase] = useState<GetPhase>('ready');
  const [worldOpen, setWorldOpen] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  /** Next person in line — local UI only; does not wipe other winners. */
  const nextPerson = useCallback(() => {
    clearDemoTicket();
    setTicket(null);
    setAlreadyEnrolled(false);
    setAlreadyClaimed(false);
    setDetail(null);
    setWorldOpen(false);
    setPhase('ready');
  }, []);

  const startWorld = useCallback(() => {
    setDetail(null);
    setPhase('working');
    setWorldOpen(true);
  }, []);

  const onWorldOpenChange = useCallback((open: boolean) => {
    setWorldOpen(open);
    if (!open) setPhase((p) => (p === 'working' ? 'ready' : p));
  }, []);

  const onVerified = useCallback(async (idkitResponse: unknown) => {
    setBusy(true);
    try {
      const out = await enrollWinner(idkitResponse, { action: ENROLL_ACTION, signal: 'asp-enroll' });
      const t = out.winner?.ticket;
      if (!t) throw new Error('No ticket returned');
      const claimed = Boolean(out.winner?.claimed_at);
      saveDemoTicket(t);
      setTicket(t);
      setAlreadyEnrolled(Boolean(out.already));
      setAlreadyClaimed(claimed);
      setPhase('done');
      if (claimed) toast.error('Already claimed — no second ticket');
      else if (out.already) toast.success(`Welcome back — same ticket ${t}`);
      else toast.success(`Registered — ${t}`);
    } catch (e: any) {
      const msg = [e?.message, e?.code].filter(Boolean).join(' · ') || 'Get failed';
      setPhase('error');
      setDetail(msg);
      toast.error(msg);
      throw e;
    } finally {
      setBusy(false);
    }
  }, []);

  const onWorldError = useCallback((msg: string) => {
    setPhase('error');
    setDetail(msg);
    toast.error(msg);
  }, []);

  const copyTicket = useCallback(async () => {
    if (!ticket) return;
    try {
      await navigator.clipboard.writeText(ticket);
      toast.success('Ticket copied');
    } catch {
      toast.error('Could not copy');
    }
  }, [ticket]);

  return {
    phase, ticket, alreadyEnrolled, alreadyClaimed, detail, busy, worldOpen,
    enrollAction: ENROLL_ACTION,
    startWorld, onWorldOpenChange, onVerified, onWorldError, copyTicket, nextPerson,
  };
}
