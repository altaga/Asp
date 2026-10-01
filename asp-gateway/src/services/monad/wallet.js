import 'dotenv/config';
import { getAddress, isAddress } from 'viem';

/**
 * The gateway only receives USDC, so it holds an address — never a private key.
 * The matching key stays offline with the operator.
 */
function resolveGatewayAddress() {
  const raw = (process.env.GATEWAY_ADDRESS || '').trim();
  return isAddress(raw) ? getAddress(raw) : '';
}

export const gatewayWallet = { address: resolveGatewayAddress() };
