'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { fetchUserCampaigns } from '@/lib/campaigns';
import { Address } from 'viem';

import Navbar from '../components/Navbar';
import { Separator } from '../components/ui/separator';
import CreateCampaignButton from '../components/CreateCampaignButton';
import { Ban, ExternalLink } from 'lucide-react';
import { endCampaign } from '@/lib/end-campaign';
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
import WithdrawButton from '../components/withdrawButton';
import { fetchActiveWithdrawalRequests, WithdrawalWithVotes } from '@/lib/withdrawals';
import FinalizedButton from '../components/FinalizedButton';
import { formatDistanceToNowStrict, isAfter } from 'date-fns';
import SubmitProofButton from '../components/SubmitProofButton';

type Campaign = {
    address: string;
    name: string;
    description: string;
    goal: bigint;
    balance: bigint;
    owner: string;
    state: number;
    compounding: bigint;
};

type Contribution = {
    campaign: Address;
    name: string;
    totalContribution: number;
    usedContribution: number;
    hasPendingVote: boolean;
    canRefund: boolean;
};

export type CampaignWithWithdrawals = Campaign & {
    activeWithdrawals: WithdrawalWithVotes[];
};

function shortenAddress(address: string) {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function Dashboard() {
    const { address, isConnected } = useAccount();
    const [campaigns, setCampaigns] = useState<CampaignWithWithdrawals[]>([]);
    const [loadingUserCampaigns, setLoadingUserCampaigns] = useState(true);
    const [loadingDonatedCampaigns, setLoadingDonatedCampaigns] = useState(true);
    const [donatedCampaigns, setDonatedCampaigns] = useState<Contribution[]>([]);
    const [activeWithdrawalCount, setActiveWithdrawalCount] = useState(0);
    const [activeRequestCount, setActiveRequestCount] = useState(0);

    const loadUserCampaigns = async () => {
        if (!address) return;
        setLoadingUserCampaigns(true);
        try {
            const campaigns = await fetchUserCampaigns(address);

            const data = await Promise.all(
                campaigns.map(async (c) => {
                    const activeWithdrawals = await fetchActiveWithdrawalRequests(
                        c.address.toLowerCase()
                    );
                    return {
                        ...c,
                        activeWithdrawals,
                    };
                })
            );

            setCampaigns(data);

            // Count how many campaigns have active withdrawals
            const activeCount = data.filter(
                (c) => c.activeWithdrawals.length > 0
            ).length;

            // you can now store it in a state for showing a badge/notification
            setActiveWithdrawalCount(activeCount);
        } catch (err) {
            console.error("Error loading user campaigns:", err);
            toast.error("Error loading user campaigns. Try again later.", {
                closeButton: true,
                position: "top-right",
            });
        } finally {
            setLoadingUserCampaigns(false);
        }
    };

    const loadDonatedCampaigns = async () => {
        if (!address) return;
        setLoadingDonatedCampaigns(true);
        try {
            const campaigns = await fetchDonatedCampaigns(address as Address);
            setDonatedCampaigns(campaigns);

            const activeCount = campaigns.filter(
                (c) => c.hasPendingVote === true
            ).length;

            // you can now store it in a state for showing a badge/notification
            setActiveRequestCount(activeCount);
        } catch (err) {
            console.error("Error loading contributions:", err);
            toast.error("Error loading contributions. Try again later.", {
                closeButton: true,
                position: "top-right",
            });
        } finally {
            setLoadingDonatedCampaigns(false);
        }
    }

    useEffect(() => {
        loadUserCampaigns();
        loadDonatedCampaigns();
    }, [address]);

    const handleEndCampaign = async (campaignAddress: Address) => {
        try {
            toast.loading("Ending campaign...");

            const txHash = await endCampaign(campaignAddress);

            toast.loading("Waiting for confirmation...");

            await publicClient.waitForTransactionReceipt({ hash: txHash });

            toast.dismiss();
            toast.success("Campaign ended successfully!", {
                closeButton: true,
                position: "top-right",
            });
            await loadUserCampaigns(); // refresh state
        } catch (err) {
            toast.dismiss();
            console.error(err);
            toast.error("Failed to end campaign.", {
                closeButton: true,
                position: "top-right",
            });
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
                            <TabsTrigger value="campaigns" className='cursor-pointer'>
                                My Campaigns
                                {activeWithdrawalCount > 0 && (
                                    <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded-full">
                                        {activeWithdrawalCount}
                                    </span>
                                )}</TabsTrigger>
                            <TabsTrigger value="donations" className='cursor-pointer'>
                                My Donations
                                {activeRequestCount > 0 && (
                                    <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded-full">
                                        {activeRequestCount}
                                    </span>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        {/* --- CAMPAIGNS TAB --- */}
                        <TabsContent value="campaigns">
                            {loadingUserCampaigns ? (
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
                                    {[...campaigns].reverse().map((c, i) => (
                                        <div
                                            key={i}
                                            className="p-5"
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="text-3xl max-lg:text-2xl max-md:text-xl font-bold">{c.name}</h2>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href={`/campaign/${c.address}`}
                                                            className="text-gray-400 hover:text-gray-600 bg-gray-100 p-1 rounded transition"
                                                        >
                                                            <ExternalLink className='w-[20px] h-[20px] max-md:w-[16px] max-md:h-[16px]' />
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>View Campaign</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>

                                            <Progress value={Number((c.compounding * BigInt(100)) / c.goal)} className='mt-5 mb-3' />

                                            <div className='flex justify-between items-center max-sm:flex-col-reverse max-sm:items-start max-sm:gap-2'>
                                                <div
                                                    className={`px-3 py-1 rounded-full text-[10px] font-medium w-fit
                                                    ${c.state === 0
                                                            ? 'bg-green-100 text-green-800'
                                                            : c.state === 1
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {c.state === 0 ? 'Active' : c.state === 1 ? 'Completed' : 'Failed'}
                                                </div>


                                                <p className="text-gray-500 font-semibold">
                                                    ${Number(c!.compounding)} / ${c.goal.toString()} Goal
                                                </p>
                                            </div>

                                            <p className="text-gray-500 text-sm mt-4">
                                                Campaign Balance:
                                            </p>
                                            <p className="text-black text-xl font-semibold">
                                                ${c.balance.toString()}
                                            </p>

                                            <div className="mt-4 flex justify-start gap-2">
                                                {c.state === 0 && (() => {
                                                    const active = c.activeWithdrawals[0];

                                                    if (active) {
                                                        if (!active.finalized && active.requires_proof) {
                                                            return (
                                                                <div className='w-full flex justify-between items-center max-sm:flex-col bg-white border border-gray-700 p-5 rounded'>
                                                                    <div>
                                                                        <h3 className="text-gray-700 semibold text-sm">
                                                                            You have an active withdrawal request for this campaign.
                                                                        </h3>
                                                                        <h2 className='font-bold text-3xl mt-1'>${active.amount}</h2>
                                                                        <p className="text-[12px] text-gray-500 mt-2">
                                                                            Backers have covered{" "}
                                                                            <span className="font-semibold">
                                                                                {active.yesPercentage >= 100
                                                                                    ? `100%`
                                                                                    : `${active.yesPercentage.toFixed(2)}%`}
                                                                            </span>{" "}
                                                                            of the requested amount approved.
                                                                        </p>
                                                                    </div>

                                                                    {(() => {
                                                                        const deadline = new Date(active.voting_deadline);
                                                                        const now = new Date();

                                                                        if (isAfter(now, deadline)) {
                                                                            return (
                                                                                <div className='max-md:mt-5 flex max-md:w-full items-center'>
                                                                                    <FinalizedButton
                                                                                        campaignAddress={c.address as Address}
                                                                                        withdrawId={BigInt(active.contract_withdraw_id)}
                                                                                        onSuccess={loadUserCampaigns}
                                                                                        amount={active.amount}
                                                                                        yesWeight={active.yesWeight}
                                                                                        dbId={active.id}
                                                                                    />
                                                                                </div>
                                                                            );
                                                                        } else {
                                                                            return (
                                                                                <div className='max-md:mt-5 flex max-md:w-full items-center'>
                                                                                    <p className="text-xs text-gray-500 mt-3">
                                                                                        You can finalize it in{" "}
                                                                                        <span className="font-semibold">
                                                                                            {formatDistanceToNowStrict(deadline, { addSuffix: false })}
                                                                                        </span>
                                                                                    </p>
                                                                                </div>
                                                                            );
                                                                        }
                                                                    })()}
                                                                </div>
                                                            );
                                                        }

                                                        if (active.finalized && active.requires_proof) {
                                                            return (
                                                                <div className='w-full border border-gray-700 rounded flex justify-between items-center gap-2 p-5'>
                                                                    <p className='font-semibold text-black text-sm'>
                                                                        Please submit proof of the previous withdrawal usages before requesting a new withdrawal.
                                                                    </p>
                                                                    <SubmitProofButton
                                                                        campaignAddress={c.address as Address}
                                                                        withdrawId={BigInt(c.activeWithdrawals[0].contract_withdraw_id)}
                                                                        dbId={c.activeWithdrawals[0].id}
                                                                        onSuccess={loadUserCampaigns}
                                                                    />
                                                                </div>
                                                            );
                                                        }
                                                    }

                                                    return <WithdrawButton campaignAddress={c.address as Address} onSuccess={loadUserCampaigns} />;
                                                })()}

                                                {c.state === 0 &&
                                                    (c.activeWithdrawals.length === 0 &&
                                                        (c.compounding === BigInt(0) || c.compounding >= c.goal)) &&
                                                    c.balance === BigInt(0) && (
                                                        <AlertDialog>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <AlertDialogTrigger asChild>
                                                                        <button
                                                                            className="cursor-pointer bg-red-100 border border-red-300 hover:bg-red-200 text-red-600 px-3 py-2 rounded hover:scale-105 transition"
                                                                        >
                                                                            <Ban size={16} />
                                                                        </button>
                                                                    </AlertDialogTrigger>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>End Campaign</p>
                                                                </TooltipContent>
                                                            </Tooltip>

                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>End Campaign?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        <strong className="text-black font-semibold">
                                                                            This will finalize the campaign permanently.
                                                                        </strong>
                                                                        <br />
                                                                        - If no withdrawals happened, it will be marked{" "}
                                                                        <strong>Failed</strong>.
                                                                        <br />
                                                                        - Otherwise, it will be marked{" "}
                                                                        <strong>Successful</strong>.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel className="cursor-pointer">
                                                                        Cancel
                                                                    </AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        className="cursor-pointer bg-lime-300 hover:bg-lime-400 text-black"
                                                                        onClick={() => handleEndCampaign(c.address as Address)}
                                                                    >
                                                                        End Campaign
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        {/* --- DONATIONS TAB --- */}
                        <TabsContent value="donations">
                            <div className="gap-5">
                                {loadingDonatedCampaigns ? (
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
                                        const images = [
                                            "/assets/campaign-img 1.jpg",
                                            "/assets/campaign-img 2.jpg",
                                            "/assets/campaign-img 3.png",
                                        ];

                                        const image = images[i % images.length];
                                        return (
                                            <div
                                                key={i}
                                                className="p-5 flex gap-5 max-md:flex-col max-md:gap-3"
                                            >
                                                <div className='w-[250px] h-full max-md:w-full max-md:h-[100px] rounded-lg bg-gray-100'>
                                                    <Image
                                                        src={image}
                                                        alt="Campaign thumbnail"
                                                        width={400}
                                                        height={350}
                                                        className="object-cover w-[250px] h-full max-md:w-full max-md:h-[100px] rounded-lg"
                                                    />
                                                </div>
                                                <div className='w-full h-full'>
                                                    {c.hasPendingVote && (
                                                        <div className="w-full flex max-[540px]:flex-col items-center max-[540px]:items-end max-[540px]:gap-3 justify-between border border-gray-700 rounded p-3 mb-3">
                                                            <p className="font-semibold text-black text-sm">
                                                                The owner is requesting withdrawal and needs your confirmation.
                                                            </p>
                                                            <Link
                                                                href={`/campaign/${c.campaign}`}
                                                                className="text-sm flex items-center gap-2 cursor-pointer border border-gray-700 font-semibold text-black hover:bg-gray-100 hover:scale-105 py-1 px-2 rounded transition"
                                                            >
                                                                Confirm
                                                            </Link>
                                                        </div>
                                                    )}

                                                    {c.canRefund && (
                                                        <div className="w-full flex max-[540px]:flex-col items-center max-[540px]:items-end max-[540px]:gap-3 justify-between border border-red-700 bg-red-50 rounded p-3 mb-3">
                                                            <p className="font-semibold text-red-500 text-sm">
                                                                The campaign has failed or you chose to walk out from this campaign, you could claim the remaining funds.
                                                            </p>
                                                        </div>
                                                    )}

                                                    {c.canRefund ? (
                                                        <>
                                                            <div>
                                                                <p className="font-[400] text-gray-700">The remaining amount you could claim is</p>
                                                                <h2 className="text-3xl font-bold mt-1 mb-2">
                                                                    ${c.totalContribution}
                                                                </h2>
                                                            </div>

                                                            <div className="mt-4 flex justify-start gap-2">
                                                                <RefundButton campaignAddress={c.campaign} onSuccess={loadDonatedCampaigns} />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div>
                                                            <div>
                                                                <p className="font-[400] text-gray-700">You have contributed a total of</p>
                                                                <h2 className="text-3xl font-bold mt-1 mb-2">
                                                                    ${c.totalContribution + c.usedContribution}
                                                                </h2>
                                                            </div>

                                                            <p className="text-gray-600 mb-3 text-sm">
                                                                To{" "}
                                                                <span className="font-bold text-black">
                                                                    <Link
                                                                        href={`/campaign/${c.campaign}`}
                                                                        target="_blank"
                                                                        className="cursor-pointer hover:underline"
                                                                    >
                                                                        {shortenAddress(c.campaign)}
                                                                    </Link>
                                                                </span>
                                                                {" "}&ldquo;{c.name}&rdquo; Campaign
                                                            </p>

                                                            <p className="text-gray-600 text-sm italic">The campaign already used ${c.usedContribution} of ${c.totalContribution + c.usedContribution}</p>
                                                        </div>
                                                    )}
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
