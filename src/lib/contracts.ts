import CrowdfundingFactoryAbi from '../frontend-abis/CrowdfundingFactory.json';
import CrowdfundingAbi from '../frontend-abis/Crowdfunding.json';
import { createPublicClient, createWalletClient, custom, EIP1193Provider, http } from 'viem';
import { sepolia } from 'wagmi/chains';

// Your deployed factory address
export const factoryAddress = '0xE7501c6Fa54000CAb76a993114740AA483318d5F';

// Public client (read-only)
export const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
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