import { publicClient } from "./contracts";
import { formatUnits } from "viem";
import type { Address } from "viem";

export type DonationLog = {
    backer: Address;
    amount: string;
    tierIndex: number;
    timestamp: string;
    txHash: string;
};

export async function fetchDonationLogs(campaignAddress: Address): Promise<DonationLog[]> {
    const currentBlock = await publicClient.getBlockNumber();

    const logs = await publicClient.getLogs({
        address: campaignAddress,
        event: {
            type: "event",
            name: "DonationReceived",
            inputs: [
                { indexed: true, name: "backer", type: "address" },
                { indexed: false, name: "amount", type: "uint256" },
                { indexed: false, name: "tierIndex", type: "uint256" },
                { indexed: false, name: "timestamp", type: "uint256" },
            ],
        },
        fromBlock: currentBlock > BigInt(600) ? currentBlock - BigInt(600) : BigInt(0),
        toBlock: "latest",
    });

    const parsedLogs = logs.map((log) => ({
        backer: log.args.backer as Address,
        amount: formatUnits(log.args.amount as bigint, 0),
        tierIndex: Number(log.args.tierIndex),
        timestamp: new Date(Number(log.args.timestamp) * 1000).toLocaleString(),
        txHash: log.transactionHash,
    }));

    return parsedLogs.slice(-5).reverse();
}