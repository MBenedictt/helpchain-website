import { walletClient } from "@/lib/contracts";
import { crowdfundingAbi } from "@/lib/contracts";
import { Address } from "viem";

export async function confirmWithdrawRequest(
    campaignAddress: Address,
    withdrawId: bigint,
    approve: boolean,
    account: Address
) {
    if (!walletClient) throw new Error("Wallet not connected");

    return walletClient.writeContract({
        address: campaignAddress,
        abi: crowdfundingAbi,
        functionName: "confirmWithdrawRequest",
        account,
        args: [withdrawId, approve],
    });
}