import { Address } from "viem";
import { publicClient, crowdfundingAbi } from "./contracts";

export async function fetchUserContributions(user: Address, campaignAddresses: Address[]) {
  const results = await Promise.all(
    campaignAddresses.map(async (addr) => {
      const [totalContribution, usedContribution] = await publicClient.readContract({
        address: addr,
        abi: crowdfundingAbi,
        functionName: "backers",
        args: [user],
      }) as [bigint, bigint];

      return {
        campaign: addr,
        totalContribution: Number(totalContribution),
        usedContribution: Number(usedContribution),
      };
    })
  );

  return results;
}