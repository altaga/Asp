import { useCallback } from 'react';
import { useAccount, useSignTypedData, useSwitchChain } from 'wagmi';
import { x402Client, x402HTTPClient } from '@x402/core/client';
import { ExactEvmScheme } from '@x402/evm/exact/client';
import { monadNetwork } from './appKit';

const NETWORK = `eip155:${monadNetwork.id}` as const;

/**
 * fetch() that answers an x402 402 challenge by signing an EIP-3009 USDC authorization
 * with the connected wallet, then retries once with the payment header.
 */
export function useX402Fetch() {
  const { address, chainId } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  const { switchChainAsync } = useSwitchChain();

  return useCallback(
    async (url: string, init: RequestInit = {}) => {
      if (!address) throw new Error('Wallet not connected');

      const first = await fetch(url, init);
      if (first.status !== 402) return first;

      if (chainId !== monadNetwork.id) await switchChainAsync({ chainId: monadNetwork.id });

      const signer = {
        address,
        signTypedData: (msg: any) => signTypedDataAsync(msg),
      };
      const http = new x402HTTPClient(new x402Client().register(NETWORK, new ExactEvmScheme(signer)));

      const body = await first.json().catch(() => undefined);
      const required = http.getPaymentRequiredResponse((name) => first.headers.get(name), body);
      const payload = await http.createPaymentPayload(required);

      return fetch(url, {
        ...init,
        headers: { ...(init.headers as Record<string, string>), ...http.encodePaymentSignatureHeader(payload) },
      });
    },
    [address, chainId, signTypedDataAsync, switchChainAsync]
  );
}
