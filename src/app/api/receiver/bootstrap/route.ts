/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as {
            receiverAddress: `0x${string}`;
            txHash: `0x${string}`;
            blockTimestampSec: number;
        };

        const receiver = body.receiverAddress.toLowerCase();

        // 🔹 Insert ONLY if not exists
        const { error } = await supabaseAdmin
            .from("receiver_trust_stats")
            .upsert(
                [
                    {
                        receiver_address: receiver,
                        trust_count: 0,
                        created_at: new Date(body.blockTimestampSec * 1000).toISOString(),
                    },
                ],
                { onConflict: "receiver_address" }
            );

        if (error) throw error;

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        console.error("bootstrap receiver error:", e);
        return NextResponse.json(
            { ok: false, error: e.message },
            { status: 500 }
        );
    }
}
