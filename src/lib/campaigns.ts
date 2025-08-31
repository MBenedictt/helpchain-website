import { publicClient, factoryAddress, crowdfundingFactoryAbi, crowdfundingAbi } from './contracts';
import { Address, Abi } from 'viem';

function getCampaignDetailsMulticall(address: Address) {
    return [
        { address, abi: crowdfundingAbi as Abi, functionName: 'campaign' },
        { address, abi: crowdfundingAbi as Abi, functionName: 'description' },
        { address, abi: crowdfundingAbi as Abi, functionName: 'goal' },
        { address, abi: crowdfundingAbi as Abi, functionName: 'getContractBalance' },
        { address, abi: crowdfundingAbi as Abi, functionName: 'owner' },
        { address, abi: crowdfundingAbi as Abi, functionName: 'getTiers' },
        { address, abi: crowdfundingAbi as Abi, functionName: 'paused' }
    ];
}

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
    balance: bigint;
    owner: string;
    tiers: Tier[];
    paused: boolean;
};


// ─── Hydrate Helper Functions ──────────────────────────────────────
async function hydrateCampaign(campaign: CampaignStruct): Promise<HydratedCampaign> {
    const address = campaign.campaignAddress;
    const multicallCalls = getCampaignDetailsMulticall(address);

    const [
        name,
        description,
        goal,
        balance,
        owner,
        tiers,
        paused
    ] = (await publicClient.multicall({ contracts: multicallCalls })).map(result => result.result);

    return {
        address,
        name: name as string,
        description: description as string,
        goal: goal as bigint,
        balance: balance as bigint,
        owner: owner as string,
        tiers: tiers as Tier[],
        paused: paused as boolean
    };
}

async function hydrateCampaigns(campaigns: CampaignStruct[]): Promise<HydratedCampaign[]> {
    const multicallCalls = campaigns.flatMap(c => getCampaignDetailsMulticall(c.campaignAddress));

    const results = await publicClient.multicall({ contracts: multicallCalls });

    const hydratedCampaigns = [];
    let resultIndex = 0;
    const CALLS_PER_CAMPAIGN = 8;

    for (const campaign of campaigns) {
        const campaignResults = results.slice(resultIndex, resultIndex + CALLS_PER_CAMPAIGN);
        const [
            name,
            description,
            goal,
            balance,
            owner,
            tiers,
            paused
        ] = campaignResults.map(res => res.result);

        hydratedCampaigns.push({
            address: campaign.campaignAddress,
            name: name as string,
            description: description as string,
            goal: goal as bigint,
            balance: balance as bigint,
            owner: owner as string,
            tiers: tiers as Tier[],
            paused: paused as boolean
        });
        resultIndex += CALLS_PER_CAMPAIGN;
    }

    return hydratedCampaigns;
}

// ─── Main API Functions ─────────────────────────────────────────────
export async function fetchAllCampaigns(): Promise<HydratedCampaign[]> {
    const campaigns = await publicClient.readContract({
        address: factoryAddress,
        abi: crowdfundingFactoryAbi,
        functionName: 'getAllCampaigns',
    }) as CampaignStruct[];

    return await hydrateCampaigns(campaigns);
}

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

export async function fetchCampaignByAddress(address: string): Promise<HydratedCampaign | null> {
    try {
        return await hydrateCampaign({ campaignAddress: address as Address } as CampaignStruct);
    } catch (error) {
        console.error("Failed to fetch campaign:", error);
        return null;
    }
}

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
