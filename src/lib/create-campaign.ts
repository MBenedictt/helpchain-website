'use client';

import { writeContract } from '@wagmi/core';
import { sepolia } from 'wagmi/chains';
import { config } from '@/wagmi'; // this is your wagmi config
import { factoryAddress, crowdfundingFactoryAbi } from './contracts';

interface CreateCampaignParams {
    name: string;
    description: string;
    goal: bigint;
}

export async function createCampaign({
    name,
    description,
    goal,
}: CreateCampaignParams) {
    try {
        const tx = await writeContract(config, {
            address: factoryAddress,
            abi: crowdfundingFactoryAbi,
            functionName: 'createCampaign',
            chain: sepolia,
            args: [name, description, goal]
        });

        return tx;
    } catch (error) {
        console.error('Error creating campaign:', error);
        throw error;
    }
}