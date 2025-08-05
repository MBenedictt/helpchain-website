'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchCampaignByAddress } from "@/lib/campaigns";
import { toast } from "sonner";

type Campaign = {
    address: string;
    name: string;
    description: string;
    goal: bigint;
    deadline: bigint;
    balance: bigint;
    owner: string;
};

export default function CampaignPage() {
    const { slug } = useParams();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchCampaignByAddress(slug as string);
                setCampaign(data);
            } catch (err) {
                console.error("Error loading campaigns:", err);
                toast.error("Failed to fetch campaigns, try again later.", {
                    closeButton: true,
                    position: "top-right",
                });
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [slug]);

    if (loading) {
        return <div className="text-center mt-20 text-gray-500">Loading campaign...</div>;
    }

    if (!campaign) {
        return (
            <div className="text-center mt-20 text-red-500">
                Campaign not found or failed to load.
            </div>
        );
    }

    return (
        <main className="max-w-4xl mx-auto mt-20 px-4">
            <h1 className="text-3xl font-bold mb-4">{campaign.name}</h1>
            <p className="text-gray-500 mb-2">{campaign.description}</p>
            <p><strong>Goal:</strong> {Number(campaign.goal)} wei</p>
            <p><strong>Raised:</strong> {Number(campaign.balance)} wei</p>
            <p><strong>Deadline:</strong> {new Date(Number(campaign.deadline) * 1000).toLocaleString()}</p>
            <p><strong>Owner:</strong> {campaign.owner}</p>
        </main>
    );
}