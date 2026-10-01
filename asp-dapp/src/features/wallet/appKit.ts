import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { monad, monadTestnet } from '@reown/appkit/networks';

export const REOWN_PROJECT_ID = (process.env.EXPO_PUBLIC_REOWN_PROJECT_ID || '').trim();

const CHAIN_ID = Number(process.env.EXPO_PUBLIC_MONAD_CHAIN_ID || monad.id);
export const monadNetwork = CHAIN_ID === monadTestnet.id ? monadTestnet : monad;

const EXPLORER =
  monadNetwork.id === monadTestnet.id ? 'https://testnet.monadvision.com' : 'https://monadvision.com';

export const wagmiAdapter = new WagmiAdapter({
  projectId: REOWN_PROJECT_ID,
  networks: [monadNetwork],
  ssr: true,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

type AppKitModal = ReturnType<typeof createAppKit>;
let modal: AppKitModal | null = null;

/** Browser-only: the modal touches window/localStorage, so server render never creates it. */
export function ensureAppKit(): AppKitModal | null {
  if (modal || typeof window === 'undefined') return modal;
  if (!REOWN_PROJECT_ID) {
    console.warn('[wallet] EXPO_PUBLIC_REOWN_PROJECT_ID is missing — WalletConnect is disabled.');
    return null;
  }
  const origin = window.location.origin;
  modal = createAppKit({
    adapters: [wagmiAdapter],
    networks: [monadNetwork],
    defaultNetwork: monadNetwork,
    projectId: REOWN_PROJECT_ID,
    metadata: {
      name: 'Asp',
      description: 'Machines you can hire on Monad',
      url: origin,
      icons: [`${origin}/favicon.ico`],
    },
    themeMode: 'light',
    allowUnsupportedChain: false,
    features: { analytics: false, email: false, socials: false, swaps: false, onramp: false },
  });
  return modal;
}

/** Kiosk opens straight on the WalletConnect QR — no wallet picker in between. */
export function openWalletModal() {
  const m = ensureAppKit();
  if (!m) throw new Error('WalletConnect is not configured (missing Reown project id).');
  return m.open({ view: 'ConnectingWalletConnectBasic' });
}

export function explorerTxUrl(hash: string) {
  return `${EXPLORER}/tx/${hash}`;
}
