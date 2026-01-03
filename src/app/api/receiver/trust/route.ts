/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const receiver = body.receiverAddress.toLowerCase();
        const voter = body.voterAddress.toLowerCase();
        const voteType: "trust" | "flag" = body.voteType;

        // 1️⃣ Check previous vote
        const { data: existing } = await supabaseAdmin
            .from("receiver_trusts")
            .select("vote_type")
            .eq("receiver_address", receiver)
            .eq("trusted_by", voter)
            .maybeSingle();

        // 2️⃣ Upsert vote
        const { error: upsertError } = await supabaseAdmin
            .from("receiver_trusts")
            .upsert(
                {
                    receiver_address: receiver,
                    trusted_by: voter,
                    vote_type: voteType,
                },
                { onConflict: "receiver_address, trusted_by" }
            );

        if (upsertError) throw upsertError;

        // 3️⃣ Update stats safely
        if (!existing) {
            // first vote
            await supabaseAdmin.rpc("increment_trust_stats", {
                receiver,
                trust_delta: voteType === "trust" ? 1 : 0,
                flag_delta: voteType === "flag" ? 1 : 0,
            });
        } else if (existing.vote_type !== voteType) {
            // change vote
            await supabaseAdmin.rpc("increment_trust_stats", {
                receiver,
                trust_delta: voteType === "trust" ? 1 : -1,
                flag_delta: voteType === "flag" ? 1 : -1,
            });
        }

        return NextResponse.json({ ok: true, voteType });
    } catch (e: any) {
        console.error("vote error:", e);
        return NextResponse.json(
            { ok: false, error: e.message },
            { status: 500 }
        );
    }
}
