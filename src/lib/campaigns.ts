import { publicClient, factoryAddress, crowdfundingFactoryAbi, crowdfundingAbi } from './contracts';
import { Address, Abi } from 'viem';

function getCampaignDetailsMulticall(address: Address) {
    return [
        { address, abi: crowdfundingAbi as Abi, functionName: 'campaign' },
        { address, abi: crowdfundingAbi as Abi, functionName: 'description' },
        { address, abi: crowdfundingAbi as Abi, functionName: 'goal' },
        { address, abi: crowdfundingAbi as Abi, functionName: 'getContractBalance' },
        { address, abi: crowdfundingAbi as Abi, functionName: 'owner' },
        { address, abi: crowdfundingAbi as Abi, functionName: 'compoundingContributions' },
        { address, abi: crowdfundingAbi as Abi, functionName: 'state' },
        { address, abi: crowdfundingAbi as Abi, functionName: 'deadline' },
    ];
}

export type CampaignStruct = {
    campaignAddress: Address;
    owner: Address;
    name: string;
    creationTime: bigint;
};

export type HydratedCampaign = {
    address: Address;
    name: string;
    description: string;
    goal: bigint;
    balance: bigint;
    owner: string;
    compounding: bigint;
    state: number;
    deadline: bigint;      // unix timestamp (seconds)
    isTimed: boolean;      // helper frontend
    isExpired: boolean;    // helper frontend
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
        compounding,
        state,
        deadline
    ] = (await publicClient.multicall({ contracts: multicallCalls }))
        .map(result => result.result);

    const now = BigInt(Math.floor(Date.now() / 1000));

    return {
        address,
        name: name as string,
        description: description as string,
        goal: goal as bigint,
        balance: balance as bigint,
        owner: owner as string,
        compounding: compounding as bigint,
        state: state as number,
        deadline: deadline as bigint,
        isTimed: (deadline as bigint) > BigInt(0),
        isExpired: (deadline as bigint) > BigInt(0) && (deadline as bigint) < now,
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
            compounding,
            state,
            deadline
        ] = campaignResults.map(res => res.result);

        const now = BigInt(Math.floor(Date.now() / 1000));

        hydratedCampaigns.push({
            address: campaign.campaignAddress,
            name: name as string,
            description: description as string,
            goal: goal as bigint,
            balance: balance as bigint,
            owner: owner as string,
            compounding: compounding as bigint,
            state: state as number,
            deadline: deadline as bigint,
            isTimed: (deadline as bigint) > BigInt(0),
            isExpired: (deadline as bigint) > BigInt(0) && (deadline as bigint) < now,
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

    // hydrate ALL first
    const hydrated = await hydrateCampaigns(campaigns);

    // filter BEFORE pagination
    const activeCampaigns = hydrated.filter(c => c.state === 0);

    // paginate AFTER filtering
    const start = (page - 1) * perPage;
    const paginated = activeCampaigns.slice(start, start + perPage);

    return {
        campaigns: paginated,
        total: activeCampaigns.length,
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
