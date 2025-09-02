/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Address } from "viem"
import { createWithdrawRequest } from "@/lib/withdraw"
import { crowdfundingAbi, publicClient } from "@/lib/contracts"
import { createClient } from "@supabase/supabase-js"
import { toast } from "sonner"

import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
} from "../ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "../ui/form"
import { BanknoteArrowDown } from "lucide-react"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const withdrawSchema = z.object({
    amount: z
        .string()
        .nonempty("Withdraw amount is required")
        .regex(/^\d+$/, "Must be a valid number"),
    votingDuration: z.string().nonempty("Voting duration is required"),
    proposal: z
        .any()
        .refine((file) => file?.length == 1, "Proposal file is required")
        .refine(
            (file) =>
                ["application/pdf", "image/jpeg", "image/png"].includes(file?.[0]?.type),
            "File must be a PDF, JPG, or PNG"
        ),
})

type WithdrawForm = z.infer<typeof withdrawSchema>

export default function WithdrawButton({ campaignAddress }: { campaignAddress: Address }) {
    const [loading, setLoading] = useState(false)

    const form = useForm<WithdrawForm>({
        resolver: zodResolver(withdrawSchema),
        defaultValues: { amount: "", votingDuration: "", proposal: [] },
    })

    const handleWithdraw = async (values: WithdrawForm) => {
        setLoading(true);
        try {
            toast.loading("Sending withdraw request...");

            const amountBigInt = BigInt(values.amount);
            const votingDurationBigInt = BigInt(values.votingDuration);

            // 1. Call contract
            const txHash = await createWithdrawRequest(
                campaignAddress,
                amountBigInt,
                votingDurationBigInt
            );

            toast.loading("Waiting for confirmation...");
            await publicClient.waitForTransactionReceipt({ hash: txHash });

            // 2. Get latest withdraw request ID from contract
            const withdrawCount: any = await publicClient.readContract({
                address: campaignAddress as Address,
                abi: crowdfundingAbi,
                functionName: "withdrawRequestCount",
            });

            const newWithdrawId = Number(withdrawCount);

            // 3. Upload proposal file to Supabase storage
            const file = values.proposal[0];
            const fileExt = file.name.split(".").pop();
            const filePath = `proposals/${campaignAddress}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("withdrawal-files")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from("withdrawal-files")
                .getPublicUrl(filePath);

            const proposalUrl = urlData.publicUrl;

            // 4. Save into DB via API route
            const res = await fetch("/api/withdraw-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    campaignAddress,
                    contractWithdrawId: newWithdrawId,
                    amountWei: String(values.amount),
                    txHash,
                    votingDurationSec: Number(values.votingDuration),
                    proposalUrl,
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.ok) {
                throw new Error(data.error || "Failed to save withdraw request");
            }

            toast.dismiss();
            toast.success("Withdraw request created!");
            form.reset();
        } catch (error) {
            toast.dismiss();
            console.error("Withdraw failed:", error);
            toast.error("Failed to create withdraw request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog>
            <Tooltip>
                <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                        <button
                            className="flex items-center gap-2 cursor-pointer border border-gray-300 font-semibold text-black hover:bg-gray-100 hover:scale-105 py-2 px-4 max-sm:px-3 rounded transition"
                            disabled={loading}
                        >
                            <BanknoteArrowDown size={20} />
                            <span className="text-sm max-sm:hidden">Withdraw</span>
                        </button>
                    </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Withdraw Funds</p>
                </TooltipContent>
            </Tooltip>

            <AlertDialogContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleWithdraw)} className="space-y-4">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Withdraw Funds</AlertDialogTitle>
                            <AlertDialogDescription>
                                Please enter the withdraw amount and voting duration.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Enter withdraw amount" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="votingDuration"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Voting Duration (days)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Enter duration in days" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="proposal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Proposal File</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => field.onChange(e.target.files)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <AlertDialogFooter>
                            <AlertDialogCancel type="button" className="cursor-pointer">
                                Cancel
                            </AlertDialogCancel>
                            <Button
                                type="submit"
                                className="cursor-pointer bg-lime-300 hover:bg-lime-400 text-black"
                                disabled={loading}
                            >
                                {loading ? "Confirming..." : "Yes, Withdraw"}
                            </Button>
                        </AlertDialogFooter>
                    </form>
                </Form>
            </AlertDialogContent>
        </AlertDialog>
    )
}
