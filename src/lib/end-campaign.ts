import { writeContract } from '@wagmi/core';
import { config } from '@/wagmi';
import { Address } from 'viem';
import { crowdfundingAbi } from './contracts';

export async function endCampaign(campaignAddress: Address) {
    try {
        const txHash = await writeContract(config, {
            address: campaignAddress,
            abi: crowdfundingAbi,
            functionName: 'endCampaign',
            args: [],
        });

        console.log('End campaign tx sent:', txHash);
        return txHash;
    } catch (error) {
        console.error('Failed to end campaign:', error);
        throw error;
    }
}