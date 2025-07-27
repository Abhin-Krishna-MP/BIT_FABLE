import { createConfig, http } from 'wagmi';
import { localhost } from 'wagmi/chains';
import { metaMask, walletConnect } from 'wagmi/connectors';

// Set up wagmi config
export const config = createConfig({
  chains: [localhost],
  connectors: [
    metaMask(),
    walletConnect({ projectId: 'YOUR_PROJECT_ID' }), // Replace with your WalletConnect project ID
  ],
  transports: {
    [localhost.id]: http(),
  },
}); 