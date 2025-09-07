import { walletClient, crowdfundingAbi } from "./contracts";
import { Address } from "viem";

export async function submitProofTx(
    campaignAddress: Address,
    withdrawId: bigint
) {
    if (!walletClient) throw new Error("Wallet not connected");

    const [account] = await walletClient.getAddresses();

    return walletClient.writeContract({
        address: campaignAddress,
        abi: crowdfundingAbi,
        functionName: "submitProof",
        args: [withdrawId],
        account,
    });
}