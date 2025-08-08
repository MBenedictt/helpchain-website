import CrowdfundingFactoryAbi from '../frontend-abis/CrowdfundingFactory.json';
import CrowdfundingAbi from '../frontend-abis/Crowdfunding.json';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'wagmi/chains';

export const factoryAddress = '0x5254E6d6b4a2980699B7052F2D303a311873a9D1';

export const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
});

export const crowdfundingFactoryAbi = CrowdfundingFactoryAbi.abi;
export const crowdfundingAbi = CrowdfundingAbi.abi;