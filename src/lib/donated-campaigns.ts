import { Address } from "viem";
import { publicClient, factoryAddress, crowdfundingFactoryAbi, crowdfundingAbi } from "./contracts";
import { fetchUserContributions } from "@/lib/user-contribution";
import { CampaignStruct } from "./campaigns";

export async function fetchDonatedCampaigns(user: Address) {
    const campaigns = await publicClient.readContract({
        address: factoryAddress,
        abi: crowdfundingFactoryAbi,
        functionName: "getAllCampaigns",
    }) as CampaignStruct[];

    const campaignAddresses = campaigns.map((c) => c.campaignAddress);

    const contributions = await fetchUserContributions(user, campaignAddresses);

    const donatedCampaigns = await Promise.all(
        contributions
            .filter((c) => c.totalContribution > 0)
            .map(async (c) => {
                const campaignData = campaigns.find(
                    (camp) => camp.campaignAddress === c.campaign
                )!;

                // get latest withdraw request id
                const withdrawRequestCount = await publicClient.readContract({
                    address: c.campaign,
                    abi: crowdfundingAbi,
                    functionName: "withdrawRequestCount",
                }) as bigint;

                let hasPendingVote = false;

                if (withdrawRequestCount > BigInt(0)) {
                    // check latest request
                    const latestId = withdrawRequestCount;
                    const req = await publicClient.readContract({
                        address: c.campaign,
                        abi: crowdfundingAbi,
                        functionName: "getWithdrawRequest",
                        args: [latestId],
                    }) as { finalized: boolean };

                    const vote = await publicClient.readContract({
                        address: c.campaign,
                        abi: crowdfundingAbi,
                        functionName: "getVote",
                        args: [latestId, user],
                    });

                    hasPendingVote = !req.finalized && vote === BigInt(0);
                }

                return {
                    ...c,
                    name: campaignData.name,
                    hasPendingVote,
                };
            })
    );

    return donatedCampaigns;
}