/** Shared surfaces (World modal, chat). Same palette as the dispenser shop in `features/dispenser/popTheme`. */
export const theme = {
  bg: '#FFF8EF',
  surface: '#FFFFFF',
  surfaceElevated: 'rgba(255,255,255,0.9)',
  text: '#231815',
  textSecondary: '#7B6F69',
  textTertiary: '#7B6F69',
  border: 'rgba(35,24,21,0.1)',
  borderStrong: 'rgba(35,24,21,0.16)',
  accent: '#E8112D',
  accentHover: '#B80A20',
  success: '#2E7D32',
  danger: '#B80A20',
  warn: '#FFC94A',
  warnText: '#8A5A00',
  userBubble: '#E8112D',
  assistantBubble: '#FFFFFF',
  shadow: '0 18px 40px rgba(35,24,21,0.12)',
  shadowSoft: '0 2px 0 rgba(35,24,21,0.08)',
  radius: 22,
  radiusSm: 14,
  font: '"Zen Maru Gothic", "Hiragino Maru Gothic ProN", "Helvetica Neue", Arial, sans-serif',
  mono: '"M PLUS 1 Code", ui-monospace, Menlo, Consolas, monospace',
  maxWidth: 760,
};

export type ChatRole = 'user' | 'assistant' | 'system';

export type ChatPhase =
  | 'idle'
  | 'requested'
  | 'awaiting_human'
  | 'authorized'
  | 'awaiting_phone_pay'
  | 'paying'
  | 'executing'
  | 'done'
  | 'denied'
  | 'revoked'
  | 'error';

export type PohCardPayload = {
  petition_id: string;
  device_name: string;
  command: string[];
  release_id?: string | null;
  status: string;
  preferred_action: string;
  job_action?: string;
  release_action?: string | null;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: number;
  poh?: PohCardPayload;
  phase?: ChatPhase;
  link?: { label: string; href: string };
};
