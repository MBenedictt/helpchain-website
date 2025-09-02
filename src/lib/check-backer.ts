import { Address } from "viem";
import { publicClient, crowdfundingAbi } from "./contracts";

export async function checkIsBacker(
    campaignAddress: Address,
    user: Address
): Promise<boolean> {
    try {
        const isBacker = await publicClient.readContract({
            address: campaignAddress,
            abi: crowdfundingAbi,
            functionName: "isBacker",
            args: [user],
        }) as boolean;

        return isBacker;
    } catch (err) {
        console.error("Error checking backer:", err);
        return false;
    }
}