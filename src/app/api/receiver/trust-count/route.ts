import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const receiver = searchParams.get("receiver");

    if (!receiver) {
        return NextResponse.json({ trustCount: 0 });
    }

    const { data, error } = await supabaseAdmin
        .from("receiver_trust_stats")
        .select("trust_count")
        .eq("receiver_address", receiver.toLowerCase())
        .single();

    if (error || !data) {
        return NextResponse.json({ trustCount: 0 });
    }

    return NextResponse.json({
        trustCount: data.trust_count,
    });
}