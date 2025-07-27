import { createConfig, http } from 'wagmi';
import { localhost } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// Set up wagmi config for localhost with RainbowKit
export const config = getDefaultConfig({
  appName: 'Startup Quest Voting',
  projectId: 'YOUR_PROJECT_ID', // Optional for localhost
  chains: [localhost],
  transports: {
    [localhost.id]: http('http://127.0.0.1:8545'),
  },
}); 