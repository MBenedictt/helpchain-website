import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
    metaMaskWallet,
} from '@rainbow-me/rainbowkit/wallets';

const connectors = connectorsForWallets(
    [
        {
            groupName: 'Available Wallet',
            wallets: [metaMaskWallet]
        },
    ],
    {
        appName: 'HelpChain DApp',
        projectId: 'YOUR_PROJECT_ID',
    }
);

export const config = createConfig({
    chains: [sepolia],
    connectors,
    transports: {
        [sepolia.id]: http(),
    },
    ssr: true,
});