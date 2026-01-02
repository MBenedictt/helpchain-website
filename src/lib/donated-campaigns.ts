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

                const withdrawRequestCount = await publicClient.readContract({
                    address: c.campaign,
                    abi: crowdfundingAbi,
                    functionName: "withdrawRequestCount",
                }) as bigint;

                let hasPendingVote = false;

                if (withdrawRequestCount > BigInt(0)) {
                    const latestId = withdrawRequestCount;

                    const req = await publicClient.readContract({
                        address: c.campaign,
                        abi: crowdfundingAbi,
                        functionName: "getWithdrawRequest",
                        args: [latestId],
                    }) as [
                            bigint,
                            bigint,
                            bigint,
                            bigint,
                            bigint,
                            bigint,
                            boolean,
                            boolean
                        ];

                    const vote = await publicClient.readContract({
                        address: c.campaign,
                        abi: crowdfundingAbi,
                        functionName: "getVote",
                        args: [latestId, user],
                    }) as number;

                    hasPendingVote = !req[6] && vote === 0;
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
