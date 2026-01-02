import CrowdfundingFactoryAbi from '../frontend-abis/CrowdfundingFactory.json';
import CrowdfundingAbi from '../frontend-abis/Crowdfunding.json';
import { createPublicClient, createWalletClient, custom, EIP1193Provider, http } from 'viem';
import { sepolia } from 'wagmi/chains';

// Your deployed factory address
export const factoryAddress = '0xd164594840847A777f9bf5Be4b3006F73a363598';

// Infura key from environtment variables
const infuraKey = process.env.NEXT_PUBLIC_INFURA_API_KEY;

// Public client (read-only)
export const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://sepolia.infura.io/v3/${infuraKey}`),
});

// Wallet client (write, requires user to connect wallet)
export const walletClient = typeof window !== 'undefined' && (window as { ethereum?: EIP1193Provider }).ethereum
    ? createWalletClient({
        chain: sepolia,
        transport: custom((window as { ethereum: EIP1193Provider }).ethereum),
    })
    : null;

export const crowdfundingFactoryAbi = CrowdfundingFactoryAbi.abi;
export const crowdfundingAbi = CrowdfundingAbi.abi;
