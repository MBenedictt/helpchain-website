/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseClient } from "./supabase/supabaseClient";
import { crowdfundingAbi, publicClient } from "./contracts";
import { Address } from "viem";

export type Withdrawal = {
    id: number;
    contract_withdraw_id: number;   // must be stored in Supabase
    campaign_address: string;
    amount: number;
    proposal_url: string | null;
    proof_url: string | null;
    finalized: boolean;
    finalized_at: string | null;
    success: boolean | null;
    tx_hash: string | null;
    created_at: string;
    voting_deadline: string;
};

export type WithdrawalWithVotes = Withdrawal & {
    yesWeight: number;
    noWeight: number;
    yesPercentage: number;
    userVote?: number;
};

export async function fetchActiveWithdrawalRequests(
    campaignAddress: string
): Promise<WithdrawalWithVotes[]> {
    // Step 1: fetch from Supabase
    const { data, error } = await supabaseClient
        .from("withdrawals")
        .select("*")
        .eq("campaign_address", campaignAddress)
        .eq("finalized", false)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching active withdrawals:", error.message);
        return [];
    }

    const withdrawals = data as Withdrawal[];

    // Step 2: augment with contract data
    const augmented = await Promise.all(
        withdrawals.map(async (w) => {
            try {
                const req: any = await publicClient.readContract({
                    address: w.campaign_address as Address,
                    abi: crowdfundingAbi,
                    functionName: "getWithdrawRequest",
                    args: [BigInt(w.contract_withdraw_id)],
                });

                const yesWeight = Number(req[2]);
                const noWeight = Number(req[3]);
                const total = yesWeight + noWeight;
                const yesPercentage = total > 0 ? (yesWeight / total) * 100 : 0;

                return {
                    ...w,
                    yesWeight,
                    noWeight,
                    yesPercentage,
                };
            } catch (err) {
                console.error(
                    `Error fetching contract data for withdrawal ${w.id}:`,
                    err
                );
                return {
                    ...w,
                    yesWeight: 0,
                    noWeight: 0,
                    yesPercentage: 0,
                };
            }
        })
    );

    return augmented;
}