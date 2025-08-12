'use client';

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { fetchCampaignByAddress } from "@/lib/campaigns";
import { toast } from "sonner";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import Link from "next/link";
import { Progress } from "@/app/components/ui/progress";
import BackButton from "@/app/components/BackButton";

type Campaign = {
    address: string;
    name: string;
    description: string;
    goal: bigint;
    deadline: bigint;
    balance: bigint;
    owner: string;
};

function shortenAddress(address: string) {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
}

export default function CampaignPage() {
    const { slug } = useParams();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchCampaignByAddress(slug as string);
                if (!data) {
                    notFound(); // redirect to /not-found
                    return;
                }
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

    return (
        <div className="font-inter">
            <Navbar />
            <div className="max-w-7xl mx-auto mt-20 px-4">
                <BackButton />
                <h1 className="text-3xl font-bold mb-4">{campaign!.name}</h1>
                <div className="flex gap-5">
                    <div className="w-8/12">
                        <Image src="/assets/help.jpg" alt="Campaign thumbnail" width={1920} height={1080} className="object-cover w-full h-[400px] rounded-lg mb-5" />
                        <div className="border-b border-gray-300 mb-4 pb-2">
                            <h2 className="text-sm">Fund Raised</h2>
                            <p className="mb-2 text-2xl font-bold">${Number(campaign!.balance)}</p>
                            <Progress value={Number((campaign!.balance * BigInt(100)) / campaign!.goal)} />
                            <div className="flex justify-between items-center my-2 text-gray-500">
                                <p className="text-sm">${Number(campaign!.goal)} Goal</p>
                                <p className="text-sm">Deadline: {new Date(Number(campaign!.deadline) * 1000).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="border-b border-gray-300 mb-4 pb-4">
                            <p className="mb-1">Campaign Address: </p>
                            <Link href={`https://sepolia.etherscan.io/address/${campaign!.address}`} className="text-gray-500 hover:text-gray-600 hover:underline">{shortenAddress(campaign!.address)}</Link>
                            <p className="mb-1 mt-2">Organized by: </p>
                            <Link href={`https://sepolia.etherscan.io/address/${campaign!.owner}`} target="_blank" className="text-gray-500 hover:text-gray-600 hover:underline">{shortenAddress(campaign!.owner)}</Link>
                        </div>
                        <h1 className="mb-2">Description</h1>
                        <p className="text-gray-500 mb-2">{campaign!.description}</p>
                    </div>
                    <div className="w-4/12 sticky top-20 h-fit rounded shadow-md">KONTOL</div>
                </div>

            </div>
        </div>

    );
}