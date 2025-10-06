/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json() as {
            campaignAddress: `0x${string}`;
            backer: `0x${string}`;
            amountWei: string;
            txHash: `0x${string}`;
            blockTimestampSec: number;
        };

        // Upsert the new donation
        const { error: upsertErr } = await supabaseAdmin
            .from("donations")
            .upsert([{
                campaign_address: body.campaignAddress.toLowerCase(),
                backer: body.backer.toLowerCase(),
                amount: body.amountWei,
                block_time: new Date(body.blockTimestampSec * 1000).toISOString(),
                tx_hash: body.txHash,
            }], { onConflict: "tx_hash" });

        if (upsertErr) throw upsertErr;

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        console.error("save donation error:", e);
        return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
    }
}