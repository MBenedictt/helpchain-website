import { supabaseClient } from "./supabase/supabaseClient";

export async function fetchDonatedCampaigns(userAddress: string) {
    const { data, error } = await supabaseClient
        .from("donations")
        .select("campaign_address")
        .eq("backer", userAddress.toLowerCase());

    if (error) throw error;

    const donatedCampaigns = Array.from(new Set((data ?? []).map((d) => d.campaign_address)));
    return donatedCampaigns;
}