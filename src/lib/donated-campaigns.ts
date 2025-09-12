import { Address } from "viem";
import { publicClient, crowdfundingAbi } from "./contracts";
import { fetchUserContributions } from "@/lib/user-contribution";
import { fetchAllCampaigns } from "./campaigns";

export async function fetchDonatedCampaigns(user: Address) {
    const campaigns = await fetchAllCampaigns();

    const campaignAddresses = campaigns.map((c) => c.address);

    const contributions = await fetchUserContributions(user, campaignAddresses);

    const donatedCampaigns = await Promise.all(
        contributions
            .filter((c) => c.totalContribution > 0)
            .map(async (c) => {
                const campaignData = campaigns.find(
                    (camp) => camp.address === c.campaign
                )!;

                // get latest withdraw request id
                const withdrawRequestCount = await publicClient.readContract({
                    address: c.campaign,
                    abi: crowdfundingAbi,
                    functionName: "withdrawRequestCount",
                }) as bigint;

                let hasPendingVote = false;
                let canRefund = false;

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

                    hasPendingVote = !req.finalized && vote === 0;
                    canRefund = campaignData.state === 2 || vote === 2;
                }

                return {
                    ...c,
                    name: campaignData.name,
                    hasPendingVote,
                    canRefund,
                };
            })
    );

    return donatedCampaigns;
}