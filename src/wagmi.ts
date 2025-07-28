import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Chain } from 'wagmi/chains';

export const taraniumTestnet: Chain = {
    id: 9924,
    name: 'Taranium Testnet',
    nativeCurrency: {
        name: 'Taranium',
        symbol: 'TARAN',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://testnet-rpc.taranium.com/'],
        },
        public: {
            http: ['https://testnet-rpc.taranium.com/'],
        },
    },
    blockExplorers: {
        default: { name: 'Taranium Scan', url: 'https://testnet-scan.taranium.com' },
    },
    testnet: true,
};

export const config = getDefaultConfig({
    appName: 'HelpChain DApp',
    projectId: 'YOUR_PROJECT_ID',
    chains: [taraniumTestnet],
    ssr: true, // If your dApp uses server side rendering (SSR)
});