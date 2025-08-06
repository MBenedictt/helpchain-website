'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { fetchUserCampaigns } from '@/lib/campaigns';
import { Address } from 'viem';

import Navbar from '../components/Navbar';
import { Separator } from '../components/ui/separator';
import CreateCampaignButton from '../components/CreateCampaignButton';
import SkeletonCard from '../components/SkeletonCard';

type Campaign = {
    address: string;
    name: string;
    description: string;
    goal: bigint;
    deadline: bigint;
    balance: bigint;
    owner: string;
};

export default function Dashboard() {
    const { address, isConnected } = useAccount();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            if (!address) return;
            setLoading(true);
            const data = await fetchUserCampaigns(address as Address);
            setCampaigns(data);
            setLoading(false);
        }
        load();
    }, [address]);

    return (
        <div className="font-inter">
            <Navbar />
            <div className="max-w-7xl max-lg:w-full mx-auto mt-[120px] px-10">
                <div className="flex justify-between items-center max-[991px]:flex-col max-[991px]:items-start mb-5">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-gray-500 mt-2">
                            This is your dashboard where you can manage your campaigns and donations.
                        </p>
                    </div>

                    <div className="max-[991px]:mt-5">
                        <CreateCampaignButton />
                    </div>
                </div>

                <Separator className="bg-gray-200 mb-8" />

                {loading ? (
                    <div className="grid grid-cols-3 gap-6 max-[991px]:grid-cols-1">
                        {[...Array(3)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : campaigns.length === 0 ? (
                    <p className="text-gray-500 col-span-3">You haven’t created any campaigns yet.</p>
                ) : (
                    <div className="grid grid-cols-3 gap-6 max-[991px]:grid-cols-1">
                        {campaigns.map((c, i) => (
                            <div key={i} className="p-4 border rounded-lg shadow-sm bg-white">
                                <h2 className="text-lg font-bold mb-2">{c.name}</h2>
                                <p className="text-sm text-gray-600 mb-1">Goal: {c.goal}</p>
                                <p className="text-sm text-gray-600">Balance: {c.balance}</p>
                                <p className="text-sm text-gray-600 mb-1">Owner: {c.owner}</p>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}