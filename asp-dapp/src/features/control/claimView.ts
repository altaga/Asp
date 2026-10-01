import type { MachineState } from '../dispenser/DispenserMachine';
import type { PopStep } from '../dispenser/PopSteps';
import type { ReleaseKind } from '../kiosk/kioskPay';
import type { ChatPhase } from '../../theme/tokens';

/** Pure mapping from the checkout flow phase to what the dispenser screens show. */
export const CLAIM_STEPS: PopStep[] = [
  { jp: '本人照合', en: 'Same human' },
  { jp: '支払い', en: 'Pay USDC' },
  { jp: '払い出し', en: 'Dispense' },
  { jp: '受け取り', en: 'Pick up' },
];

type View = { phase: ChatPhase; release: ReleaseKind; hasTicket: boolean; dropStuck: boolean };

export function claimMachineState({ phase, release }: View): MachineState {
  if (phase === 'executing') return 'vending';
  if (phase === 'done') return release === 'nft' ? 'collected' : 'dropped';
  return 'locked';
}

export function claimLockLabel({ phase, hasTicket, dropStuck }: View): string {
  switch (phase) {
    case 'idle': return hasTicket ? 'Tap Continue' : 'Enter your ticket';
    case 'requested': return 'Checking ticket…';
    case 'awaiting_human': return 'Confirm it’s you';
    case 'authorized': return 'Preparing payment…';
    case 'awaiting_phone_pay':
    case 'paying': return 'Pay on your phone to unlock';
    case 'denied': return 'Already claimed';
    case 'revoked': return 'Claim cancelled';
    case 'error': return dropStuck ? 'Paid — retry the drop' : 'Something failed';
    default: return '';
  }
}

export function claimScreen({ phase }: View): string | undefined {
  if (phase === 'awaiting_phone_pay' || phase === 'paying') return 'PAY';
  if (phase === 'denied') return 'USED';
  return undefined;
}

export function claimStep({ phase, dropStuck }: View): number {
  if (phase === 'authorized' || phase === 'awaiting_phone_pay' || phase === 'paying') return 1;
  if (phase === 'executing' || (phase === 'error' && dropStuck)) return 2;
  if (phase === 'done') return 3;
  return 0;
}

export function claimTitle({ phase, release }: View): { lead: string; accent: string } {
  switch (phase) {
    case 'awaiting_human': return { lead: 'Same human?', accent: 'Prove it.' };
    case 'authorized':
    case 'awaiting_phone_pay':
    case 'paying': return { lead: 'Pay once.', accent: 'On Monad.' };
    case 'executing': return { lead: 'Here it', accent: 'comes.' };
    case 'done': return { lead: 'Yours.', accent: release === 'nft' ? 'Numbered.' : 'Limited.' };
    case 'denied': return { lead: 'Already', accent: 'claimed.' };
    case 'revoked': return { lead: 'Claim', accent: 'cancelled.' };
    case 'error': return { lead: 'Something', accent: 'jammed.' };
    default: return { lead: 'Bring your', accent: 'ticket.' };
  }
}
