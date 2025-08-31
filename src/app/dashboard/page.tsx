'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { fetchUserCampaigns } from '@/lib/campaigns';
import { Address } from 'viem';

import Navbar from '../components/Navbar';
import { Separator } from '../components/ui/separator';
import CreateCampaignButton from '../components/CreateCampaignButton';
import SkeletonCard from '../components/SkeletonCard';
import { Ban, BanknoteArrowDown, ExternalLink, Eye, Power } from 'lucide-react';
import { togglePause } from '@/lib/toggle-paused';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '../components/ui/tooltip';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import AddTiersButton from '../components/AddTierButton';
import Link from 'next/link';
import { fetchDonatedCampaigns } from '@/lib/donated-campaigns';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '../components/ui/tabs';
import Footer from '../components/Footer';
import RefundButton from '../components/refundButton';
import { publicClient } from '@/lib/contracts';
import { toast } from 'sonner';
import { Progress } from '../components/ui/progress';
import { Skeleton } from '../components/ui/skeleton';
import Image from 'next/image';
import { DonationDetailButton } from '../components/DonationDetailButton';

type Campaign = {
    address: string;
    name: string;
    description: string;
    goal: bigint;
    balance: bigint;
    owner: string;
    tiers: {
        name: string;
        amount: bigint;
        backers: bigint;
    }[];
    paused: boolean;
};

type Contribution = {
    campaign: Address;
    name: string;
    totalContribution: number;
};

function shortenAddress(address: string) {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function Dashboard() {
    const { address, isConnected } = useAccount();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [donatedCampaigns, setDonatedCampaigns] = useState<Contribution[]>([]);

    async function loadUserCampaigns() {
        if (!address) return;
        setLoading(true);
        const data = await fetchUserCampaigns(address as Address);
        setCampaigns(data);
        setLoading(false);
    }

    async function loadDonatedCampaigns() {
        if (!address) return;
        setLoading(true);
        try {
            const campaigns = await fetchDonatedCampaigns(address as Address);
            console.log("Fetched donated campaigns:", campaigns);
            setDonatedCampaigns(campaigns);
        } catch (err) {
            console.error("Error loading contributions:", err);
            toast.error("Error loading contributions. Try again later.", {
                closeButton: true,
                position: "top-right",
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUserCampaigns();
        loadDonatedCampaigns();
    }, [address]);

    const handleActive = async (campaignAddress: Address, paused: boolean) => {
        try {
            toast.loading("Sending transaction...")

            const txHash = await togglePause(campaignAddress)

            toast.loading("Waiting for confirmation...")

            await publicClient.waitForTransactionReceipt({ hash: txHash })

            toast.dismiss()
            toast.success(
                paused ? "Campaign activated successfully!" : "Campaign paused successfully!",
                {
                    closeButton: true,
                    position: "top-right",
                }
            )
        } catch (err) {
            toast.dismiss()
            console.error("Failed to toggle pause:", err)
            toast.error("Failed to toggle pause. Try again later.", {
                closeButton: true,
                position: "top-right",
            })
        }
    }

    return (
        <div className="font-inter">
            <Navbar />
            <div className="max-w-7xl max-lg:w-full mx-auto mt-[120px] px-10">
                <div className="flex justify-between items-center max-[991px]:flex-col max-[991px]:items-start mb-5">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-gray-500 mt-2">
                            This is your dashboard where you can manage your campaigns and
                            donations.
                        </p>
                    </div>

                    <div className="max-[991px]:mt-5">
                        <CreateCampaignButton onCampaignCreated={loadUserCampaigns} />
                    </div>
                </div>

                <Separator className="bg-gray-200 mb-8" />

                {!isConnected ? (
                    <p className="text-gray-500 col-span-3">
                        You haven’t connected your wallet.
                    </p>
                ) : (
                    <Tabs defaultValue="campaigns" className="w-full">
                        <TabsList className="mb-6">
                            <TabsTrigger value="campaigns" className='cursor-pointer'>My Campaigns</TabsTrigger>
                            <TabsTrigger value="donations" className='cursor-pointer'>My Donations</TabsTrigger>
                        </TabsList>

                        {/* --- CAMPAIGNS TAB --- */}
                        <TabsContent value="campaigns">
                            {loading ? (
                                <div className="flex flex-col gap-5">
                                    {[...Array(3)].map((_, i) => (
                                        <Skeleton className="w-full h-[250px] rounded-lg" key={i} />
                                    ))}
                                </div>
                            ) : campaigns.length === 0 ? (
                                <p className="text-gray-500 col-span-3">
                                    You haven’t created any campaigns yet.
                                </p>
                            ) : (
                                <div className="gap-5">
                                    {campaigns.map((c, i) => (
                                        <div
                                            key={i}
                                            className="p-5"
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="text-3xl max-lg:text-2xl max-md:text-xl font-bold">{c.name}</h2>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href={`https://sepolia.etherscan.io/address/${c.address}`}
                                                            target="_blank"
                                                            className="text-gray-400 hover:text-gray-600 bg-gray-100 p-1 rounded transition"
                                                        >
                                                            <ExternalLink className='w-[20px] h-[20px] max-md:w-[16px] max-md:h-[16px]' />
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>View on-chain</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>

                                            <Progress value={Number((c.balance * BigInt(100)) / c.goal)} className='mt-5 mb-3' />

                                            <div className='flex justify-between items-center'>
                                                <div
                                                    className={`px-3 py-1 rounded-full text-[10px] font-medium w-fit mb-2
                                                    ${c.paused
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-green-100 text-green-800'
                                                        }`}
                                                >
                                                    {c.paused ? 'Not Active' : 'Active'}
                                                </div>

                                                <p className="text-gray-500 font-semibold">
                                                    ${c.goal.toString()} Goal
                                                </p>
                                            </div>

                                            <p className="text-gray-500 text-sm mt-2">
                                                Campaign Balance:
                                            </p>
                                            <p className="text-black text-xl font-semibold">
                                                ${c.balance.toString()}
                                            </p>

                                            <div className="mt-4 flex justify-start gap-2">
                                                {!c.paused && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button className="flex items-center gap-2 cursor-pointer border border-gray-300 font-semibold text-black hover:bg-gray-100 hover:scale-105 py-2 px-4 max-sm:px-3 rounded transition" disabled>
                                                                <BanknoteArrowDown size={20} /> <span className='text-sm max-sm:hidden'>Withdraw</span>
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Withdraw (Coming Soon)</p>
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
                                                                    className={`cursor-pointer text-sm font-semibold py-2 px-3 rounded transition
                                                                        ${c.paused
                                                                            ? 'bg-lime-100 border border-lime-300 hover:bg-lime-200 text-black hover:scale-105'
                                                                            : 'bg-red-100 border border-red-300 hover:bg-red-200 text-red-600 hover:scale-105'
                                                                        }`}
                                                                >
                                                                    {c.paused ? (
                                                                        <div className='flex items-center gap-2'>
                                                                            <Power size={16} /> <span className='text-sm max-sm:hidden'>Activate</span>
                                                                        </div>
                                                                    ) : (
                                                                        <Ban size={16} />
                                                                    )}
                                                                </button>
                                                            </AlertDialogTrigger>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{c.paused ? 'Activate' : 'Deactivate'}</p>
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>
                                                                {c.paused
                                                                    ? 'Activate Campaign?'
                                                                    : 'Deactivate Campaign?'}
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                {c.paused
                                                                    ? 'This will make the campaign active and visible to donors.'
                                                                    : 'This will hide the campaign from new contributions. You can activate it again at any time.'}
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="cursor-pointer">
                                                                Cancel
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                className="cursor-pointer bg-lime-300 hover:bg-lime-400 text-black"
                                                                onClick={() =>
                                                                    handleActive(c.address as Address, c.paused)
                                                                }
                                                            >
                                                                {c.paused ? 'Activate' : 'Deactivate'}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        {/* --- DONATIONS TAB --- */}
                        <TabsContent value="donations">
                            <div className="gap-5">
                                {loading ? (
                                    <div className="flex flex-col gap-5">
                                        {[...Array(3)].map((_, i) => (
                                            <Skeleton className="w-full h-[200px] rounded-lg" key={i} />
                                        ))}
                                    </div>
                                ) : donatedCampaigns.length === 0 ? (
                                    <p className="text-gray-500 col-span-3">
                                        You have not donated to any campaigns yet.
                                    </p>
                                ) : (
                                    donatedCampaigns.map((c, i) => {
                                        return (
                                            <div
                                                key={i}
                                                className="p-5 flex items-center gap-5 max-md:flex-col max-md:gap-3"
                                            >
                                                <div className='w-[250px] h-full max-md:w-full max-md:h-[100px] rounded-lg bg-gray-100'>
                                                    <Image
                                                        src="/assets/help.jpg"
                                                        alt="Campaign thumbnail"
                                                        width={300}
                                                        height={250}
                                                        className="object-cover w-[250px] h-full max-md:w-full max-md:h-[100px] rounded-lg"
                                                    />
                                                </div>
                                                <div className='w-full h-full'>
                                                    <div>
                                                        <p className='font-[400] text-gray-700'>You have donated a total of</p>
                                                        <h2 className="text-3xl font-bold mt-1 mb-2">
                                                            ${c.totalContribution}
                                                        </h2>
                                                    </div>

                                                    <p className="text-gray-600 mb-3 text-sm">
                                                        To{" "}
                                                        <span className="font-bold text-black">
                                                            <Link
                                                                href={`https://sepolia.etherscan.io/address/${c.campaign}`}
                                                                target="_blank"
                                                                className="cursor-pointer hover:underline"
                                                            >
                                                                {shortenAddress(c.campaign)}
                                                            </Link>
                                                        </span>
                                                        {" "}&ldquo;{c.name}&rdquo; Campaign
                                                    </p>

                                                    <div className="mt-4 flex justify-start gap-2">
                                                        <DonationDetailButton campaignAddress={c.campaign} backer={address as Address} />

                                                        <RefundButton campaignAddress={c.campaign} />
                                                    </div>
                                                </div>

                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
            </div>
            <Footer />
        </div>
    );
}
