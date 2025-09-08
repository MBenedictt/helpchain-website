"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { fetchCampaignByAddress } from "@/lib/campaigns";
import { toast } from "sonner";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import Link from "next/link";
import { Progress } from "@/app/components/ui/progress";
import BackButton from "@/app/components/BackButton";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/app/components/ui/form";
import { fundCampaign } from "@/lib/fund";
import { Address } from "viem";
import { publicClient, walletClient } from "@/lib/contracts";
import DonationLogs from "@/app/components/DonationLogs";
import Footer from "@/app/components/Footer";
import LoadingPage from "@/app/components/LoadingPage";
import { DonationLog, fetchDonationLogs } from "@/lib/get-logs";
import { Check, FileText, Loader, X } from "lucide-react";
import { fetchActiveWithdrawalRequests, WithdrawalWithVotes } from "@/lib/withdrawals";
import { useAccount } from "wagmi";
import { checkIsBacker } from "@/lib/check-backer";
import { getUserVote } from "@/lib/get-vote";
import { voteWithdrawRequest } from "@/lib/vote";
import { differenceInDays } from "date-fns";
import { fetchWithdrawalLogs, WithdrawalLog } from "@/lib/withdraw-logs";
import WithdrawHistory from "@/app/components/WithdrawalLogs";

function formatVotingDeadline(createdAt: string, deadline: string) {
    const created = new Date(createdAt);
    const end = new Date(deadline);

    const days = differenceInDays(end, created);

    return `Voting ends in ${days} day${days > 1 ? "s" : ""}`;
}

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
    }[];
};

function shortenAddress(address: string) {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
}

const donationSchema = z
    .object({
        tierIndex: z.number().nullable(),
        amount: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        const noTierSelected = data.tierIndex === null;
        const noAmountEntered = !data.amount || Number(data.amount) <= 0;

        if (noTierSelected && noAmountEntered) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Select a tier or enter an amount",
                path: ["amount"], // attach error to the USD input
            });
        }
    });

export default function CampaignPage() {
    const { slug } = useParams();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);
    const [sendingFund, setSendingFund] = useState(false);
    const [donations, setDonations] = useState<DonationLog[]>([]);
    const [withdrawals, setWithdrawals] = useState<WithdrawalLog[]>([]);
    const [withdrawalsReq, setWithdrawalsReq] = useState<WithdrawalWithVotes[]>([]);
    const { address: connectedAddress } = useAccount();
    const [isBackerUser, setIsBackerUser] = useState(false);
    const [loadingVote, setLoadingVote] = useState(false);

    const form = useForm<z.infer<typeof donationSchema>>({
        resolver: zodResolver(donationSchema),
        defaultValues: {
            tierIndex: null,
            amount: "",
        },
    });

    const loadCampaign = useCallback(async (campaignAddress: string) => {
        try {
            const data = await fetchCampaignByAddress(campaignAddress);
            if (!data) {
                notFound();
                return;
            }
            setCampaign(data);
        } catch (err) {
            console.error("Error loading campaign:", err);
            toast.error("Failed to fetch campaign data.", {
                closeButton: true,
                position: "top-right",
            });
        }
    }, []);

    // donations loader
    const loadDonations = useCallback(async (campaignAddress: string) => {
        try {
            const logs = await fetchDonationLogs(campaignAddress as `0x${string}`);
            setDonations(logs);
        } catch (err) {
            console.error("Error loading donations:", err);
            toast.error("Failed to fetch donations, try again later.", {
                closeButton: true,
                position: "top-right",
            });
        }
    }, []);

    // withdrawals history loader
    const loadWithdrawals = useCallback(async (campaignAddress: string) => {
        try {
            const logs = await fetchWithdrawalLogs(campaignAddress as `0x${string}`);
            setWithdrawals(logs);
        } catch (err) {
            console.error("Error loading withdrawals:", err);
            toast.error("Failed to fetch withdrawals, try again later.", {
                closeButton: true,
                position: "top-right",
            });
        }
    }, []);

    // main loader: campaign + withdrawals
    const load = useCallback(async () => {
        try {
            const data = await fetchCampaignByAddress(slug as string);
            if (!data) {
                notFound();
                return;
            }
            setCampaign(data);

            // load withdrawals
            const activeWithdrawals = await fetchActiveWithdrawalRequests(
                (data.address as `0x${string}`).toLowerCase()
            );

            let withdrawalsWithVotes = activeWithdrawals;
            if (connectedAddress) {
                const backer = await checkIsBacker(
                    data.address as Address,
                    connectedAddress as Address
                );
                setIsBackerUser(backer);

                if (backer) {
                    withdrawalsWithVotes = await Promise.all(
                        activeWithdrawals.map(async (w) => {
                            const vote = await getUserVote(
                                data.address as Address,
                                BigInt(w.contract_withdraw_id),
                                connectedAddress as Address
                            );
                            return { ...w, userVote: vote };
                        })
                    );
                }
            }

            setWithdrawalsReq(withdrawalsWithVotes);

            await loadDonations(data.address as `0x${string}`);

            await loadWithdrawals(data.address as `0x${string}`);
        } catch (err) {
            console.error("Error loading campaign or withdrawals:", err);
            toast.error("Failed to fetch campaign data, try again later.", {
                closeButton: true,
                position: "top-right",
            });
        } finally {
            setLoading(false);
        }
    }, [slug, connectedAddress, loadDonations, loadWithdrawals]);

    useEffect(() => {
        load();
    }, [load]);

    const onSubmit = async (values: z.infer<typeof donationSchema>) => {
        let tierIndexToSend: number;
        let amountToSend: number;

        if (values.tierIndex !== null) {
            tierIndexToSend = values.tierIndex;
            amountToSend = Number(campaign!.tiers[values.tierIndex].amount);
        } else {
            tierIndexToSend = campaign!.tiers.length; // custom amount
            amountToSend = Number(values.amount!);
        }

        try {
            if (!walletClient) {
                throw new Error("Please connect your wallet.");
            }

            const [account] = await walletClient.getAddresses();

            setSendingFund(true);
            toast.loading("Sending donation...");

            const txHash = await fundCampaign(
                campaign!.address as Address,
                tierIndexToSend,
                amountToSend
            );

            toast.loading("Waiting for confirmation...");

            const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

            const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber });
            const blockTimestampSec = Number(block.timestamp);

            await fetch("/api/donation-log", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    campaignAddress: campaign!.address,
                    backer: account,
                    amountWei: String(amountToSend),
                    tierIndex: tierIndexToSend,
                    txHash,
                    blockTimestampSec,
                }),
            });

            await loadCampaign(campaign!.address);
            await loadDonations(campaign!.address as `0x${string}`);

            toast.dismiss();
            toast.success("Donation sent!", {
                closeButton: true,
                position: "top-right"
            });

            form.reset({
                tierIndex: null,
                amount: "",
            });
        } catch (err) {
            toast.dismiss();
            console.error("Failed to donate:", err);
            toast.error("Failed to donate, try again later.", {
                closeButton: true,
                position: "top-right",
            });
        } finally {
            setSendingFund(false);
        }
    };

    const handleVote = async (withdrawId: number, approve: boolean) => {
        if (!campaign || !connectedAddress) return;

        try {
            setLoadingVote(true);

            // 1. Send vote transaction
            toast.loading("Sending vote...");

            const txHash = await voteWithdrawRequest(
                campaign.address as Address,
                BigInt(withdrawId),
                approve,
                connectedAddress as Address
            );

            // 2. Waiting for confirmation
            toast.loading("Waiting for confirmation...");

            await publicClient.waitForTransactionReceipt({ hash: txHash });

            // 3. Refresh data
            await load();

            toast.dismiss();
            toast.success("Vote submitted!", {
                closeButton: true,
                position: "top-right",
            });
        } catch (err) {
            toast.dismiss();
            console.error("Vote error:", err);
            toast.error("Failed to submit vote.", {
                closeButton: true,
                position: "top-right",
            });
        } finally {
            setLoadingVote(false);
        }
    };

    if (loading) {
        return (
            <LoadingPage isLoading={loading} />
        );
    }

    return (
        <div className="font-inter">
            <Navbar />
            <div className="max-w-7xl px-4 max-xl:px-10 mx-auto max-md:px-5 mt-20">
                <BackButton />
                <h1 className="text-3xl font-bold mb-4">{campaign!.name}</h1>
                <div className="flex gap-5">
                    <div className="w-8/12 max-[991px]:w-full">
                        <Image
                            src="/assets/campaign-img.jpg"
                            alt="Campaign thumbnail"
                            width={1920}
                            height={1080}
                            className="object-cover w-full h-[400px] rounded-lg mb-5"
                        />
                        <div className="border-b border-gray-300 mb-4 pb-2">
                            <h2 className="text-sm">Fund Raised</h2>
                            <p className="mb-2 text-2xl font-bold">
                                ${Number(campaign!.balance)}
                            </p>
                            <Progress
                                value={Number(
                                    (campaign!.balance * BigInt(100)) / campaign!.goal
                                )}
                            />
                            <div className="flex max-md:flex-col justify-between items-center max-md:items-start my-2 text-gray-500">
                                <p className="text-sm">
                                    ${Number(campaign!.goal)} Goal
                                </p>
                            </div>
                            {withdrawalsReq.length > 0 && connectedAddress?.toLowerCase() !== campaign!.owner.toLowerCase() &&
                                isBackerUser && (
                                    withdrawalsReq.map((w) => (
                                        <div
                                            key={w.id}
                                            className="w-full p-5 rounded border border-gray-300 bg-lime-50 mt-4 flex justify-between items-center shadow-md shadow-lime-500"
                                        >
                                            <div>
                                                <h2 className="text-sm font-semibold text-gray-500">
                                                    {shortenAddress(campaign!.owner)} is requesting to withdraw
                                                </h2>
                                                <h1 className="text-3xl font-bold my-2">${w.amount}</h1>

                                                {w.proposal_url && (
                                                    <Link href={w.proposal_url} target="_blank">
                                                        <div className="flex items-center bg-gray-50 hover:bg-gray-200 text-gray-500 border border-gray-300 font-semibold py-1 px-2 rounded text-sm w-fit">
                                                            <FileText size={12} />
                                                            <span className="ml-1 text-[12px]">View Proposal</span>
                                                        </div>
                                                    </Link>
                                                )}

                                                <p className="text-[12px] text-gray-500 mt-2">
                                                    Backers have covered{" "}
                                                    <span className="font-semibold">
                                                        {w.yesPercentage >= 1
                                                            ? `100%`
                                                            : `${w.yesPercentage.toFixed(2)}%`}
                                                    </span>{" "}
                                                    of the requested amount approved.
                                                </p>
                                            </div>

                                            {w.userVote === 0 && (
                                                <div className="flex flex-col gap-2 items-center">
                                                    <div className="flex flex-col gap-2 justify-between items-center">
                                                        <p className="text-sm text-gray-500">Vote</p>

                                                        {loadingVote ? (
                                                            <div className="flex gap-2 items-center my-2">
                                                                <Loader size={16} className="animate-spin text-gray-500" />
                                                            </div>
                                                        ) : (
                                                            <div className="flex gap-2 items-center">
                                                                <button
                                                                    className="cursor-pointer bg-gray-50 border border-gray-300 hover:bg-green-50 text-gray-500 py-1 px-2 rounded text-sm"
                                                                    onClick={() => handleVote(w.contract_withdraw_id, true)}
                                                                >
                                                                    <Check size={24} className="text-green-500" />
                                                                </button>
                                                                <button
                                                                    className="cursor-pointer bg-gray-50 border border-gray-300 hover:bg-red-50 text-gray-500 py-1 px-2 rounded text-sm"
                                                                    onClick={() => handleVote(w.contract_withdraw_id, false)}
                                                                >
                                                                    <X size={24} className="text-red-500" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <p className="text-sm text-gray-500">
                                                        {formatVotingDeadline(w.created_at, w.voting_deadline)}
                                                    </p>
                                                </div>
                                            )}

                                            {w.userVote === 1 && (
                                                <div className="flex flex-col gap-2 items-center">
                                                    <p className="text-sm text-green-600 font-semibold w-3/4 text-center">
                                                        You Approved This Request
                                                    </p>
                                                </div>
                                            )}

                                            {w.userVote === 2 && (
                                                <div className="flex flex-col gap-2 items-center">
                                                    <p className="text-sm text-red-600 font-semibold w-3/4 text-center">
                                                        You Rejected This Request
                                                    </p>
                                                </div>
                                            )}

                                        </div>
                                    ))
                                )}
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="space-y-4 hidden max-[991px]:block"
                                >
                                    <p className="text-gray-600 text-sm mt-2">Quick Selection</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {campaign!.tiers.length === 0 ? (
                                            <p className="col-span-3 text-center text-gray-500 text-sm italic mb-2">
                                                No tiers available for this campaign.
                                            </p>
                                        ) : (
                                            campaign!.tiers.map((tier, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => {
                                                        const current = form.watch("tierIndex");
                                                        if (current === index) {
                                                            form.setValue("tierIndex", null);
                                                        } else {
                                                            form.setValue("tierIndex", index);
                                                            form.setValue("amount", "");
                                                        }
                                                    }}
                                                    className={`cursor-pointer rounded-lg border p-2 text-center transition ${form.watch("tierIndex") === index
                                                        ? "border-lime-600 bg-lime-100"
                                                        : "border-gray-300 hover:bg-gray-100"
                                                        }`}
                                                >
                                                    <p className="text-[12px] text-gray-500">{tier.name}</p>
                                                    <h1 className="text-xl font-bold">
                                                        ${Number(tier.amount)}
                                                    </h1>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <div
                                                        className={`w-full flex items-center border rounded-lg px-4 py-3 ${form.watch("tierIndex") === null
                                                            ? "border-lime-500"
                                                            : "border-gray-300"
                                                            }`}
                                                    >
                                                        <div className="flex flex-col items-center mr-2">
                                                            <span className="text-2xl font-bold">$</span>
                                                            <span className="text-xs font-semibold text-gray-600">USD</span>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            placeholder="0"
                                                            {...field}
                                                            value={field.value || ""}
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                                form.setValue("tierIndex", null);
                                                            }}
                                                            className="w-full border-none shadow-none text-right text-2xl font-bold outline-none"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <p className="text-[12px] text-gray-500">*For the sake of testing, $1 equals 1 wei. 1 wei is 10⁻¹⁸ ETH</p>

                                    {form.formState.errors?.root && (
                                        <p className="text-red-500 text-sm">
                                            {form.formState.errors.root.message}
                                        </p>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={sendingFund}
                                        className={`w-full py-3 rounded-lg text-md font-semibold cursor-pointer transition 
                                    ${sendingFund ? "bg-gray-300 text-gray-700 cursor-not-allowed" : "bg-lime-300 hover:bg-lime-400 text-black"}`}
                                    >
                                        {sendingFund ? "Sending fund..." : "Donate Now"}
                                    </button>
                                </form>
                            </Form>
                        </div>
                        <div className="border-b border-gray-300 mb-4 pb-4">
                            <p className="mb-1 font-bold">Campaign Address: </p>
                            <Link
                                href={`https://sepolia.etherscan.io/address/${campaign!.address}`}
                                target="_blank"
                                className="text-gray-500 hover:text-gray-600 hover:underline"
                            >
                                {shortenAddress(campaign!.address)}
                            </Link>
                            <p className="mb-1 mt-2 font-bold">Organized by: </p>
                            <Link
                                href={`https://sepolia.etherscan.io/address/${campaign!.owner}`}
                                target="_blank"
                                className="text-gray-500 hover:text-gray-600 hover:underline"
                            >
                                {shortenAddress(campaign!.owner)}
                            </Link>
                        </div>
                        <h1 className="mb-2 font-bold">Description</h1>
                        <p className="text-gray-500 mb-2">{campaign!.description}</p>
                        <div className="mt-4 pt-4 border-t border-gray-300">
                            <h1 className="mb-4 font-bold">Withdrawal Milestones</h1>
                            <WithdrawHistory withdrawals={withdrawals} />
                            <div className="flex items-center mt-4">
                                <Link
                                    href={`https://sepolia.etherscan.io/address/${campaign!.address}`}
                                    target="_blank"
                                    className="text-gray-700 hover:text-lime-500 underline"
                                >
                                    View More on Etherscan
                                </Link>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-300">
                            <h1 className="mb-4 font-bold">Donation History</h1>
                            <DonationLogs donations={donations} />
                            <div className="flex items-center mt-4">
                                <Link
                                    href={`https://sepolia.etherscan.io/address/${campaign!.address}`}
                                    target="_blank"
                                    className="text-gray-700 hover:text-lime-500 underline"
                                >
                                    View More on Etherscan
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Support section */}
                    <div className="w-4/12 sticky top-20 h-fit rounded-xl shadow-md p-4 max-[991px]:hidden">
                        <h1 className="font-bold text-xl">Support this Campaign</h1>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <p className="text-gray-600 text-sm mt-2">Quick Selection</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {campaign!.tiers.length === 0 ? (
                                        <p className="col-span-3 text-center text-gray-500 text-sm italic mb-2">
                                            No tiers available for this campaign.
                                        </p>
                                    ) : (
                                        campaign!.tiers.map((tier, index) => (
                                            <div
                                                key={index}
                                                onClick={() => {
                                                    const current = form.watch("tierIndex");
                                                    if (current === index) {
                                                        form.setValue("tierIndex", null);
                                                    } else {
                                                        form.setValue("tierIndex", index);
                                                        form.setValue("amount", "");
                                                    }
                                                }}
                                                className={`cursor-pointer rounded-lg border p-2 text-center transition ${form.watch("tierIndex") === index
                                                    ? "border-lime-600 bg-lime-100"
                                                    : "border-gray-300 hover:bg-gray-100"
                                                    }`}
                                            >
                                                <p className="text-[12px] text-gray-500">{tier.name}</p>
                                                <h1 className="text-xl font-bold">
                                                    ${Number(tier.amount)}
                                                </h1>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <div
                                                    className={`w-full flex items-center border rounded-lg px-4 py-3 ${form.watch("tierIndex") === null
                                                        ? "border-lime-500"
                                                        : "border-gray-300"
                                                        }`}
                                                >
                                                    <div className="flex flex-col items-center mr-2">
                                                        <span className="text-2xl font-bold">$</span>
                                                        <span className="text-xs font-semibold text-gray-600">USD</span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        placeholder="0"
                                                        {...field}
                                                        value={field.value || ""}
                                                        onChange={(e) => {
                                                            field.onChange(e);
                                                            form.setValue("tierIndex", null);
                                                        }}
                                                        className="w-full border-none shadow-none text-right text-2xl font-bold outline-none"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <p className="text-[12px] text-gray-500">*For the sake of testing, $1 equals 1 wei. 1 wei is 10⁻¹⁸ ETH</p>

                                {form.formState.errors?.root && (
                                    <p className="text-red-500 text-sm">
                                        {form.formState.errors.root.message}
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    disabled={sendingFund}
                                    className={`w-full py-3 rounded-lg text-md font-semibold cursor-pointer transition 
                                    ${sendingFund ? "bg-gray-300 text-gray-700 cursor-not-allowed" : "bg-lime-300 hover:bg-lime-400 text-black"}`}
                                >
                                    {sendingFund ? "Sending fund..." : "Donate Now"}
                                </button>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}