import { writeContract } from "@wagmi/core";
import { config } from "@/wagmi";
import { crowdfundingAbi } from "./contracts";
import { Address } from "viem";

export async function removeTier(campaignAddress: Address, index: number) {
    return await writeContract(config, {
        address: campaignAddress,
        abi: crowdfundingAbi,
        functionName: "removeTier",
        args: [BigInt(index)],
    });
}