import { createConfig, http } from 'wagmi';
import { polygonMumbai } from 'wagmi/chains';
import { metaMask, walletConnect } from 'wagmi/connectors';

// Set up wagmi config
export const config = createConfig({
  chains: [polygonMumbai],
  connectors: [
    metaMask(),
    walletConnect({ projectId: 'YOUR_PROJECT_ID' }), // Replace with your WalletConnect project ID
  ],
  transports: {
    [polygonMumbai.id]: http(),
  },
}); 