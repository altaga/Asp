import React, { useEffect } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ensureAppKit, wagmiConfig } from './appKit';

const queryClient = new QueryClient();

export function WalletProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    ensureAppKit();
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
