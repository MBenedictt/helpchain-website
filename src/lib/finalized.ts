import { Address } from "viem";
import { walletClient, crowdfundingAbi } from "./contracts";

export async function finalizeWithdrawRequest(
    campaignAddress: Address,
    withdrawId: bigint
) {
    try {
        if (!walletClient) {
            throw new Error("Please connect your wallet.");
        }

        const [account] = await walletClient.getAddresses();

        const txHash = await walletClient.writeContract({
            address: campaignAddress,
            abi: crowdfundingAbi,
            functionName: "finalizeWithdrawRequest",
            args: [withdrawId],
            account,
        });

        return txHash;
    } catch (error) {
        console.error("Error finalizing withdraw request:", error);
        throw error;
    }
}