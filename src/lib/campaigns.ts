import { publicClient, factoryAddress, crowdfundingFactoryAbi, crowdfundingAbi } from './contracts';
import { Address } from 'viem';

export type CampaignStruct = {
    campaignAddress: Address;
    owner: Address;
    name: string;
    creationTime: bigint;
};

export type Tier = {
    name: string;
    amount: bigint;
    backers: bigint;
};

export type HydratedCampaign = {
    address: Address;
    name: string;
    description: string;
    goal: bigint;
    deadline: bigint;
    balance: bigint;
    owner: string;
    tiers: Tier[];
    paused: boolean;
};

// ─── Fetch All Campaigns ─────────────────────────────────────────────
export async function fetchAllCampaigns(): Promise<HydratedCampaign[]> {
    const campaigns = await publicClient.readContract({
        address: factoryAddress,
        abi: crowdfundingFactoryAbi,
        functionName: 'getAllCampaigns',
    }) as CampaignStruct[];

    return await hydrateCampaigns(campaigns);
}

// ─── Fetch Paginated Campaigns ──────────────────────────────────────
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

// ─── Fetch Campaign by Address ──────────────────────────────────────
export async function fetchCampaignByAddress(address: string): Promise<HydratedCampaign | null> {
    try {
        return await hydrateCampaign({ campaignAddress: address as Address } as CampaignStruct);
    } catch (error) {
        console.error("Failed to fetch campaign:", error);
        return null;
    }
}

// ─── Fetch User Campaigns ───────────────────────────────────────────
export async function fetchUserCampaigns(address: Address): Promise<HydratedCampaign[]> {
    try {
        const campaigns = await publicClient.readContract({
            address: factoryAddress,
            abi: crowdfundingFactoryAbi,
            functionName: 'getUserCampaigns',
            args: [address],
        }) as CampaignStruct[];

        return await hydrateCampaigns(campaigns);
    } catch (err) {
        console.error('Failed to fetch user campaigns:', err);
        return [];
    }
}

// ─── Hydrate Helpers ────────────────────────────────────────────────
async function hydrateCampaigns(campaigns: CampaignStruct[]): Promise<HydratedCampaign[]> {
    return await Promise.all(
        campaigns.map(c => hydrateCampaign(c))
    );
}

async function hydrateCampaign(campaign: CampaignStruct): Promise<HydratedCampaign> {
    const address = campaign.campaignAddress;

    const [name, description, goal, deadline, balance, owner, tiers, paused] = await Promise.all([
        publicClient.readContract({ address, abi: crowdfundingAbi, functionName: 'campaign' }) as Promise<string>,
        publicClient.readContract({ address, abi: crowdfundingAbi, functionName: 'description' }) as Promise<string>,
        publicClient.readContract({ address, abi: crowdfundingAbi, functionName: 'goal' }) as Promise<bigint>,
        publicClient.readContract({ address, abi: crowdfundingAbi, functionName: 'deadline' }) as Promise<bigint>,
        publicClient.readContract({ address, abi: crowdfundingAbi, functionName: 'getContractBalance' }) as Promise<bigint>,
        publicClient.readContract({ address, abi: crowdfundingAbi, functionName: 'owner' }) as Promise<string>,
        publicClient.readContract({ address, abi: crowdfundingAbi, functionName: 'getTiers' }) as Promise<Tier[]>,
        publicClient.readContract({ address, abi: crowdfundingAbi, functionName: 'paused' }) as Promise<boolean>
    ]);

    return {
        address,
        name,
        description,
        goal,
        deadline,
        balance,
        owner,
        tiers,
        paused
    };
}