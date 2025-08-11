import { writeContract } from '@wagmi/core';
import { config } from '@/wagmi'; // this is your wagmi config
import { Address } from 'viem';
import { crowdfundingAbi } from './contracts';

export async function togglePause(campaignAddress: Address) {
    try {
        const txHash = await writeContract(config, {
            address: campaignAddress,
            abi: crowdfundingAbi,
            functionName: 'togglePause',
            args: [],
        });

        console.log('Transaction sent:', txHash);
        return txHash;
    } catch (error) {
        console.error('Failed to toggle pause:', error);
        throw error;
    }
}