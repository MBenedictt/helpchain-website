'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { fetchUserCampaigns } from '@/lib/campaigns';
import { Address } from 'viem';

import Navbar from '../components/Navbar';
import { Separator } from '../components/ui/separator';
import CreateCampaignButton from '../components/CreateCampaignButton';
import SkeletonCard from '../components/SkeletonCard';
import { Ban, BanknoteArrowDown, ExternalLink, Power } from 'lucide-react';
import { togglePause } from '@/lib/toggle-paused';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import AddTiersButton from '../components/AddTierButton';
import Link from 'next/link';

type Campaign = {
    address: string;
    name: string;
    description: string;
    goal: bigint;
    deadline: bigint;
    balance: bigint;
    owner: string;
    tiers: {
        name: string;
        amount: bigint;
        backers: bigint;
    }[];
    paused: boolean;
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

    const handleActive = async (campaignAddress: Address) => {
        try {
            const tx = await togglePause(campaignAddress);
            alert(`Pause toggled! Tx: ${tx}`);
        } catch (err) {
            alert('Failed to toggle pause');
        }
    };


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

                {!isConnected ? (
                    <p className="text-gray-500 col-span-3">
                        You haven’t connected your wallet.
                    </p>
                ) : loading ? (
                    <div className="grid grid-cols-3 gap-6 max-[991px]:grid-cols-1">
                        {[...Array(3)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : campaigns.length === 0 ? (
                    <p className="text-gray-500 col-span-3">
                        You haven’t created any campaigns yet.
                    </p>
                ) : (
                    <div className="grid grid-cols-3 gap-6 max-[991px]:grid-cols-1">
                        {campaigns.map((c, i) => {
                            return (
                                <div
                                    key={i}
                                    className="p-4 border rounded-lg shadow-sm bg-white"
                                >
                                    <div className='flex items-center gap-2 mb-1'>
                                        <h2 className="text-lg font-bold">{c.name}</h2>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Link href={`https://sepolia.etherscan.io/address/${c.address}`} target="_blank" className='text-gray-400 hover:text-gray-600 bg-gray-100 p-1 rounded transition'><ExternalLink size={16} /></Link>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>View on-chain</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <div
                                        className={`px-3 py-1 rounded-full text-[10px] font-medium w-fit mb-2
                                        ${c.paused ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                                    >
                                        {c.paused ? "Not Active" : "Active"}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">Goal: {c.goal}</p>
                                    <p className="text-sm text-gray-600 mb-1">Balance: {c.balance}</p>

                                    <div className="mt-4 flex justify-end gap-2">
                                        {!c.paused && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        className="cursor-pointer bg-green-500 hover:bg-green-700 text-white text-sm font-bold p-2 rounded"
                                                    >
                                                        <BanknoteArrowDown size={16} />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Withdraw</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}

                                        {!c.paused && (
                                            <AddTiersButton campaignAddress={c.address as Address} />
                                        )}

                                        <AlertDialog>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <AlertDialogTrigger asChild>
                                                        <button
                                                            className={`cursor-pointer text-sm font-bold p-2 rounded transition text-white
                                                            ${c.paused ? "bg-blue-500 hover:bg-blue-700" : "bg-red-500 hover:bg-red-700"}`}
                                                        >
                                                            {c.paused ? <Power size={16} /> : <Ban size={16} />}
                                                        </button>
                                                    </AlertDialogTrigger>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{c.paused ? "Activate" : "Deactivate"}</p>
                                                </TooltipContent>
                                            </Tooltip>

                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        {c.paused ? "Activate Campaign?" : "Deactivate Campaign?"}
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {c.paused
                                                            ? "This will make the campaign active and visible to donors."
                                                            : "This will hide the campaign from new contributions. You can activate it again at any time."}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className='cursor-pointer'>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className='cursor-pointer bg-lime-300 hover:bg-lime-400 text-black'
                                                        onClick={() => handleActive(c.address as Address)}
                                                    >
                                                        {c.paused ? "Activate" : "Deactivate"}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>
        </div>
    );
}