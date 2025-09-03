import { Address } from "viem";
import { publicClient, crowdfundingAbi } from "./contracts";

export async function getUserVote(
    campaignAddress: Address,
    withdrawId: bigint,
    voter: Address
): Promise<number> {
    try {
        const vote = await publicClient.readContract({
            address: campaignAddress,
            abi: crowdfundingAbi,
            functionName: "getVote",
            args: [withdrawId, voter],
        }) as number;

        return vote; // 0 = not voted, 1 = yes, 2 = no
    } catch (err) {
        console.error("Error fetching user vote:", err);
        return 0;
    }
}