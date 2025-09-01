import { walletClient, crowdfundingAbi } from "./contracts";
import { Address } from "viem";

export async function createWithdrawRequest(
    campaignAddress: Address,
    amount: bigint,
    votingDuration: bigint
) {
    if (!walletClient) throw new Error("Wallet not connected");

    const [account] = await walletClient.getAddresses();

    return walletClient.writeContract({
        address: campaignAddress,
        abi: crowdfundingAbi,
        functionName: "createWithdrawRequest",
        args: [amount, votingDuration],
        account,
    });
}