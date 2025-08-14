import { walletClient, crowdfundingAbi } from "./contracts";
import { Address } from "viem";

export async function fundCampaign(
    campaignAddress: Address,
    tierIndex: number,
    amount: number
) {
    try {
        if (!walletClient) {
            throw new Error("Please connect your wallet.");
        }

        const [account] = await walletClient.getAddresses();

        const txHash = await walletClient.writeContract({
            address: campaignAddress,
            abi: crowdfundingAbi,
            functionName: "fund",
            args: [BigInt(tierIndex)],
            account,
            value: BigInt(amount),
        });

        return txHash;
    } catch (error) {
        console.error("Error funding campaign:", error);
        throw error;
    }
}