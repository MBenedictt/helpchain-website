import CrowdfundingFactoryAbi from '../frontend-abis/CrowdfundingFactory.json';
import CrowdfundingAbi from '../frontend-abis/Crowdfunding.json';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'wagmi/chains';

export const factoryAddress = '0x6A30cEbB2e60314E6eD5Cb0e3B022681D14469E3';

export const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
});

export const crowdfundingFactoryAbi = CrowdfundingFactoryAbi.abi;
export const crowdfundingAbi = CrowdfundingAbi.abi;