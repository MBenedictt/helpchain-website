import { supabaseClient } from "./supabase/supabaseClient";
import type { Address } from "viem";

export type WithdrawalLog = {
    amount: string;
    finalized: boolean;
    success: boolean | null;
    timestamp: string;
    txHash: string | null;
    proposalUrl: string | null;
    proofUrl: string | null;
};

export async function fetchWithdrawalLogs(
    campaignAddress: Address
): Promise<WithdrawalLog[]> {
    const { data, error } = await supabaseClient
        .from("withdrawals")
        .select("amount, created_at, finalized, success, tx_hash, proposal_url, proof_url")
        .eq("campaign_address", campaignAddress.toLowerCase())
        .order("created_at", { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error fetching withdrawals:", error);
        return [];
    }

    return data.map((row) => ({
        amount: row.amount.toString(),
        finalized: row.finalized,
        success: row.success,
        timestamp: new Date(row.created_at).toLocaleString(),
        txHash: row.tx_hash,
        proposalUrl: row.proposal_url,
        proofUrl: row.proof_url,
    }));
}