/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json() as {
            campaignAddress: `0x${string}`;
            contractWithdrawId: number;
            amountWei: string;
            txHash: `0x${string}`;
            votingDurationSec: number;
            proposalUrl: string;
        };

        // 1. Insert into withdrawals and return the new row (to get its id)
        const { data: inserted, error: withdrawErr } = await supabaseAdmin
            .from("withdrawals")
            .insert([{
                contract_withdraw_id: body.contractWithdrawId,
                campaign_address: body.campaignAddress.toLowerCase(),
                amount: body.amountWei,
                voting_deadline: new Date(Date.now() + body.votingDurationSec * 1000).toISOString(),
                tx_hash: body.txHash,
                proposal_url: body.proposalUrl,
                requires_proof: true,
            }])
            .select("id") // fetch the new id
            .single();

        if (withdrawErr) throw withdrawErr;
        if (!inserted) throw new Error("Failed to fetch inserted withdrawal");

        // 2. Insert into withdrawal_files using the DB id
        const { error: fileErr } = await supabaseAdmin
            .from("withdrawal_files")
            .insert([{
                withdrawal_id: inserted.id, // <-- use DB PK, not contract ID
                file_type: "proposal",
                file_url: body.proposalUrl,
            }]);

        if (fileErr) throw fileErr;

        return NextResponse.json({ ok: true, withdrawalId: inserted.id });
    } catch (e: any) {
        console.error("save withdraw request error:", e);
        return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
    }
}