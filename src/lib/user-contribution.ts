import { Address } from "viem";
import { publicClient, crowdfundingAbi } from "./contracts";

export async function fetchUserContributions(user: Address, campaignAddresses: Address[]) {
  const results = await Promise.all(
    campaignAddresses.map(async (addr) => {
      const contribution = await publicClient.readContract({
        address: addr,
        abi: crowdfundingAbi,
        functionName: "backers",
        args: [user],
      });

      return {
        campaign: addr,
        totalContribution: Number(contribution),
      };
    })
  );

  return results;
}