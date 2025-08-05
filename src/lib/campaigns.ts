import { publicClient, factoryAddress, crowdfundingFactoryAbi, crowdfundingAbi } from './contracts';
import { Address } from 'viem';

export type CampaignStruct = {
    campaignAddress: Address;
    owner: Address;
    name: string;
    creationTime: bigint;
};

// Fetch and hydrate ALL campaigns
export async function fetchAllCampaigns() {
    const campaigns = await publicClient.readContract({
        address: factoryAddress,
        abi: crowdfundingFactoryAbi,
        functionName: 'getAllCampaigns',
    }) as CampaignStruct[];

    return await hydrateCampaigns(campaigns);
}

// Fetch and hydrate paginated campaigns
export async function getPaginatedCampaigns(page: number, perPage: number) {
    const campaigns = await publicClient.readContract({
        address: factoryAddress,
        abi: crowdfundingFactoryAbi,
        functionName: 'getAllCampaigns',
    }) as CampaignStruct[];

    const paginated = campaigns.slice((page - 1) * perPage, page * perPage);
    const hydrated = await hydrateCampaigns(paginated);

    return {
        campaigns: hydrated,
        total: campaigns.length,
    };
}

// Hydrate a single campaign by address
export async function fetchCampaignByAddress(address: string) {
    try {
        return await hydrateCampaign({ campaignAddress: address as Address } as CampaignStruct);
    } catch (error) {
        console.error("Failed to fetch campaign:", error);
        return null;
    }
}

// Helper: hydrate a list of CampaignStructs
async function hydrateCampaigns(campaigns: CampaignStruct[]) {
    return await Promise.all(
        campaigns.map(async (campaign) => hydrateCampaign(campaign))
    );
}

// Helper: hydrate a single campaign
async function hydrateCampaign(campaign: CampaignStruct) {
    const address = campaign.campaignAddress;

    const [name, description, goal, deadline, balance, owner] = await Promise.all([
        publicClient.readContract({ address, abi: crowdfundingAbi, functionName: 'campaign' }) as Promise<string>,
        publicClient.readContract({ address, abi: crowdfundingAbi, functionName: 'description' }) as Promise<string>,
        publicClient.readContract({ address, abi: crowdfundingAbi, functionName: 'goal' }) as Promise<bigint>,
        publicClient.readContract({ address, abi: crowdfundingAbi, functionName: 'deadline' }) as Promise<bigint>,
        publicClient.readContract({ address, abi: crowdfundingAbi, functionName: 'getContractBalance' }) as Promise<bigint>,
        publicClient.readContract({ address, abi: crowdfundingAbi, functionName: 'owner' }) as Promise<string>,
    ]);

    return {
        address,
        name,
        description,
        goal,
        deadline,
        balance,
        owner,
    };
}
