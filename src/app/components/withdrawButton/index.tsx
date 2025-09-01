"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Address } from "viem"
import { createWithdrawRequest } from "@/lib/withdraw"
import { publicClient } from "@/lib/contracts"
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
    AlertDialogAction,
} from "../ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { Input } from "../ui/input"
import { BanknoteArrowDown } from "lucide-react"

// Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Zod schema
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
        setLoading(true)
        try {
            toast.loading("Sending withdraw request...")

            // convert to bigint
            const amountBigInt = BigInt(values.amount)
            const votingDurationBigInt =
                BigInt(values.votingDuration) * BigInt(24) * BigInt(60) * BigInt(60) // days -> seconds

            // Call contract
            const txHash = await createWithdrawRequest(
                campaignAddress,
                amountBigInt,
                votingDurationBigInt
            )

            toast.loading("Waiting for confirmation...")
            await publicClient.waitForTransactionReceipt({ hash: txHash })

            // === Upload proposal file to Supabase ===
            const file = values.proposal[0]
            const fileExt = file.name.split(".").pop()
            const filePath = `proposals/${campaignAddress}-${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from("withdrawal-files") // ✅ your bucket name
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: urlData } = supabase.storage
                .from("withdrawal-files")
                .getPublicUrl(filePath)

            const proposalUrl = urlData.publicUrl

            // === Insert into DB ===
            const { error } = await supabase.from("withdrawals").insert([
                {
                    id: Date.now(), // temporary unique ID
                    campaign_address: campaignAddress,
                    amount: Number(values.amount), // ✅ numeric
                    voting_deadline: new Date(
                        Date.now() + Number(values.votingDuration) * 86400000
                    ).toISOString(),
                    tx_hash: txHash,
                    proposal_url: proposalUrl,
                    requires_proof: true,
                },
            ])

            if (error) throw error

            toast.dismiss()
            toast.success("Withdraw request created!", {
                closeButton: true,
                position: "top-right",
            })

            form.reset()
        } catch (error) {
            toast.dismiss()
            console.error("Withdraw failed:", error)
            toast.error("Failed to create withdraw request. Try again later.", {
                closeButton: true,
                position: "top-right",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog>
            <Tooltip>
                <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                        <button
                            className="flex items-center gap-2 cursor-pointer border border-gray-300 font-semibold text-black hover:bg-gray-100 hover:scale-105 py-2 px-4 max-sm:px-3 rounded transition"
                            disabled={loading}
                        >
                            <BanknoteArrowDown size={20} />{" "}
                            <span className="text-sm max-sm:hidden">Withdraw</span>
                        </button>
                    </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Withdraw Funds</p>
                </TooltipContent>
            </Tooltip>

            <AlertDialogContent>
                <form onSubmit={form.handleSubmit(handleWithdraw)} className="space-y-4">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Withdraw Funds</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please enter the withdraw amount and voting duration. This action will be recorded on-chain
                            and in our database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Amount</label>
                        <Input
                            type="number"
                            placeholder="Enter withdraw amount"
                            {...form.register("amount")}
                        />
                        {form.formState.errors.amount && (
                            <p className="text-red-500 text-sm">
                                {String(form.formState.errors.amount.message)}
                            </p>
                        )}
                    </div>

                    {/* Voting Duration */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Voting Duration</label>
                        <Input
                            type="number"
                            placeholder="Enter voting duration in days"
                            {...form.register("votingDuration")}
                        />
                        {form.formState.errors.votingDuration && (
                            <p className="text-red-500 text-sm">
                                {String(form.formState.errors.votingDuration.message)}
                            </p>
                        )}
                    </div>

                    {/* Proposal File */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Proposal File</label>
                        <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            {...form.register("proposal")}
                        />
                        {form.formState.errors.proposal?.message && (
                            <p className="text-red-500 text-sm">
                                {String(form.formState.errors.proposal.message)}
                            </p>
                        )}
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel type="button" className="cursor-pointer">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            type="submit"
                            className="cursor-pointer bg-lime-300 hover:bg-lime-400 text-black"
                            disabled={loading}
                        >
                            {loading ? "Confirming..." : "Yes, Withdraw"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}
