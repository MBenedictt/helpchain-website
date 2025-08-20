import { walletClient, crowdfundingAbi } from "./contracts";
import { Address } from "viem";

export async function withdraw(campaignAddress: Address) {
    if (!walletClient) throw new Error("Wallet not connected");

    const [account] = await walletClient.getAddresses();

    return walletClient.writeContract({
        address: campaignAddress,
        abi: crowdfundingAbi,
        functionName: "withdraw",
        account,
    });
}