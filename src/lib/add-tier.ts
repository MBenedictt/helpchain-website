import { writeContract } from '@wagmi/core';
import { config } from '@/wagmi';
import { crowdfundingAbi } from './contracts';
import { Address } from 'viem';

export async function addTier(campaignAddress: Address, name: string, amount: bigint) {
    try {
        const txHash = await writeContract(config, {
            address: campaignAddress,
            abi: crowdfundingAbi,
            functionName: 'addTier',
            args: [name, amount],
        });
        return txHash;
    } catch (err) {
        console.error('Failed to add tier:', err);
        throw err;
    }
}