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

    const form = useForm<z.infer<typeof donationSchema>>({
        resolver: zodResolver(donationSchema),
        defaultValues: {
            tierIndex: null,
            amount: "",
        },
    });

    const load = useCallback(async () => {
        try {
            const data = await fetchCampaignByAddress(slug as string);
            if (!data) {
                notFound();
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
    }, [slug]);

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

            toast.loading("Sending donation...");

            const txHash = await fundCampaign(
                campaign!.address as Address,
                tierIndexToSend,
                amountToSend
            );

            toast.loading("Waiting for confirmation...");

            const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

            // exact block timestamp
            const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber });
            const blockTimestampSec = Number(block.timestamp);

            // push to Supabase via server route
            await fetch("/api/donation-log", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    campaignAddress: campaign!.address,
                    backer: account,
                    amountWei: String(amountToSend),    // in wei
                    tierIndex: tierIndexToSend,
                    txHash,
                    blockTimestampSec,
                }),
            });

            await load(); // reload fresh campaign data

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
            <div className="max-w-7xl px-4 max-xl:px-10 mx-auto mt-20">
                <BackButton />
                <h1 className="text-3xl font-bold mb-4">{campaign!.name}</h1>
                <div className="flex gap-5">
                    <div className="w-8/12">
                        <Image
                            src="/assets/help.jpg"
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
                            <div className="flex justify-between items-center my-2 text-gray-500">
                                <p className="text-sm">
                                    ${Number(campaign!.goal)} Goal
                                </p>
                                <p className="text-sm">
                                    Deadline:{" "}
                                    {new Date(Number(campaign!.deadline) * 1000).toLocaleString()}
                                </p>
                            </div>
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
                            <h1 className="mb-4 font-bold">Donation History</h1>
                            <DonationLogs campaignAddress={campaign!.address} />
                        </div>
                    </div>

                    {/* Support section */}
                    <div className="w-4/12 sticky top-20 h-fit rounded-xl shadow-md p-4">
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

                                {form.formState.errors?.root && (
                                    <p className="text-red-500 text-sm">
                                        {form.formState.errors.root.message}
                                    </p>
                                )}
                                <button type="submit" className="w-full py-3 bg-lime-300 hover:bg-lime-400 text-black rounded-lg text-md font-semibold cursor-pointer transition">
                                    Donate Now
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