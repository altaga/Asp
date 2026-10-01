import { Slot } from 'expo-router';
import { LogBox } from 'react-native';
import { WalletProviders } from '../features/wallet/WalletProviders';

LogBox.ignoreLogs([
  'User rejected the request',
  'Connection request reset',
]);

const { Toaster, toast } = require('react-hot-toast');

// WalletConnect relay / wallet metadata fetches fail noisily on localhost — keep them out of toasts.
if (typeof window !== 'undefined' && !(window as any).__aspToastFilter) {
  (window as any).__aspToastFilter = true;
  const noisy = /metadata|TypeError|Failed to fetch|CORS|net::ERR|Error fetching/i;
  const origError = toast.error.bind(toast);
  toast.error = (message: any, opts?: any) => {
    const text = String(
      typeof message === 'string' ? message : message?.message || message?.error || ''
    );
    if (noisy.test(text)) return '';
    return origError(message, opts);
  };
}

export default function Layout() {
  return (
    <WalletProviders>
      <div style={{ height: '100vh', overflowY: 'auto', backgroundColor: '#F5F5F7', color: '#1D1D1F' }}>
        <style>{`
          @keyframes aspPulse {
            0%, 80%, 100% { opacity: 0.35; transform: translateY(0); }
            40% { opacity: 1; transform: translateY(-2px); }
          }
          button:disabled { opacity: 0.45; cursor: not-allowed !important; }
        `}</style>
        <Slot />
        <Toaster
          position="top-right"
          gutter={10}
          containerStyle={{
            top: 18,
            right: 18,
          }}
          toastOptions={{
            duration: 8000,
            style: {
              background: '#FFFFFF',
              color: '#1D1D1F',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '12px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
              fontSize: '13px',
              padding: '10px 12px',
              maxWidth: '320px',
            },
          }}
        />
      </div>
    </WalletProviders>
  );
}
