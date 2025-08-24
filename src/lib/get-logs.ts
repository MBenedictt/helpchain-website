import { supabaseClient } from "./supabase/supabaseClient";
import type { Address } from "viem";

export type DonationLog = {
    backer: Address;
    amount: string;
    tierIndex: number;
    timestamp: string;
    txHash: string;
};

export async function fetchDonationLogs(campaignAddress: Address): Promise<DonationLog[]> {
    const { data, error } = await supabaseClient
        .from("donations")
        .select("*")
        .eq("campaign_address", campaignAddress.toLowerCase())
        .order("block_time", { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error fetching donations:", error);
        return [];
    }

    // map to match DonationLog type
    return data.map((row) => ({
        backer: row.backer as Address,
        amount: row.amount.toString(),
        tierIndex: row.tier_index,
        timestamp: new Date(row.block_time).toLocaleString(),
        txHash: row.tx_hash,
    }));
}

export async function fetchDonationDetail(campaignAddress: `0x${string}`, backer: `0x${string}`) {
    const { data, error } = await supabaseClient
        .from("donations")
        .select("amount, block_time, tx_hash")
        .eq("campaign_address", campaignAddress.toLowerCase())
        .eq("backer", backer.toLowerCase())
        .order("block_time", { ascending: false });

    if (error) throw error;

    return data.map((row) => ({
        amount: row.amount,
        date: new Date(row.block_time).toLocaleString(),
        txHash: row.tx_hash,
    }));
}