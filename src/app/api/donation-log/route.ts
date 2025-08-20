/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json() as {
            campaignAddress: `0x${string}`;
            backer: `0x${string}`;
            amountWei: string;
            tierIndex: number;
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
                tier_index: body.tierIndex,
                block_time: new Date(body.blockTimestampSec * 1000).toISOString(),
                tx_hash: body.txHash,
            }], { onConflict: "tx_hash" });

        if (upsertErr) throw upsertErr;

        // Delete anything older than the latest 5 for this campaign
        const { data: old } = await supabaseAdmin
            .from("donations")
            .select("id")
            .eq("campaign_address", body.campaignAddress.toLowerCase())
            .order("block_time", { ascending: false })
            .range(5, 999);

        if (old && old.length) {
            const ids = old.map(r => r.id);
            const { error: delErr } = await supabaseAdmin
                .from("donations")
                .delete()
                .in("id", ids);
            if (delErr) throw delErr;
        }

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        console.error("save donation error:", e);
        return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
    }
}