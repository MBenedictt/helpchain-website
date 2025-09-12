import { Address } from "viem";
import { publicClient, crowdfundingAbi } from "./contracts";

export async function checkIsBacker(
    campaignAddress: Address,
    user: Address
): Promise<{ isBacker: boolean; totalContribution: number; usedContribution: number }> {
    try {
        // Check if user is registered as backer
        const isBacker = await publicClient.readContract({
            address: campaignAddress,
            abi: crowdfundingAbi,
            functionName: "isBacker",
            args: [user],
        }) as boolean;

        // Fetch contributions
        const [totalContribution, usedContribution] = (await publicClient.readContract({
            address: campaignAddress,
            abi: crowdfundingAbi,
            functionName: "backers",
            args: [user],
        })) as [bigint, bigint];

        const total = Number(totalContribution);
        const used = Number(usedContribution);

        return {
            isBacker: isBacker && total > 0, // ✅ only true if both conditions are satisfied
            totalContribution: total,
            usedContribution: used,
        };
    } catch (err) {
        console.error("Error checking valid backer:", err);
        return { isBacker: false, totalContribution: 0, usedContribution: 0 };
    }
}