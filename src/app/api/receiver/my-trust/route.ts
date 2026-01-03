import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const receiver = searchParams.get("receiver");
    const voter = searchParams.get("voter");

    if (!receiver || !voter) {
        return NextResponse.json({ voteType: null });
    }

    const { data } = await supabaseAdmin
        .from("receiver_trusts")
        .select("vote_type")
        .eq("receiver_address", receiver.toLowerCase())
        .eq("trusted_by", voter.toLowerCase())
        .maybeSingle();

    return NextResponse.json({
        voteType: data?.vote_type ?? null,
    });
}
