import { publicClient, factoryAddress, crowdfundingFactoryAbi, crowdfundingAbi } from './contracts';
import { Address } from 'viem';

type CampaignStruct = {
    campaignAddress: Address;
    owner: Address;
    name: string;
    creationTime: bigint;
};

export async function fetchAllCampaigns() {
    const campaigns = await publicClient.readContract({
        address: factoryAddress,
        abi: crowdfundingFactoryAbi,
        functionName: 'getAllCampaigns',
    }) as CampaignStruct[]; // 👈 Explicitly cast it

    const campaignData = await Promise.all(
        campaigns.map(async (campaign) => {
            const address = campaign.campaignAddress;

            const [name, description, goal, deadline, balance, owner] = await Promise.all([
                publicClient.readContract({
                    address,
                    abi: crowdfundingAbi,
                    functionName: 'campaign',
                }) as Promise<string>,
                publicClient.readContract({
                    address,
                    abi: crowdfundingAbi,
                    functionName: 'description',
                }) as Promise<string>,
                publicClient.readContract({
                    address,
                    abi: crowdfundingAbi,
                    functionName: 'goal',
                }) as Promise<bigint>,
                publicClient.readContract({
                    address,
                    abi: crowdfundingAbi,
                    functionName: 'deadline',
                }) as Promise<bigint>,
                publicClient.readContract({
                    address,
                    abi: crowdfundingAbi,
                    functionName: 'getContractBalance',
                }) as Promise<bigint>,
                publicClient.readContract({
                    address,
                    abi: crowdfundingAbi,
                    functionName: 'owner',
                }) as Promise<string>,
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
        })
    );

    return campaignData;
}