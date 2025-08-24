import { Address } from "viem";
import { publicClient, factoryAddress, crowdfundingFactoryAbi } from "./contracts";
import { fetchUserContributions } from "@/lib/user-contribution";
import { CampaignStruct } from "./campaigns";

export async function fetchDonatedCampaigns(user: Address) {
    const campaigns = await publicClient.readContract({
        address: factoryAddress,
        abi: crowdfundingFactoryAbi,
        functionName: "getAllCampaigns",
    }) as CampaignStruct[]

    const campaignAddresses = campaigns.map((c) => c.campaignAddress);

    const contributions = await fetchUserContributions(user, campaignAddresses);

    const donatedCampaigns = contributions
        .filter((c) => c.totalContribution > 0)
        .map((c) => ({
            ...c,
            name: campaigns.find((camp) => camp.campaignAddress === c.campaign)!.name,
        }));

    return donatedCampaigns;
}