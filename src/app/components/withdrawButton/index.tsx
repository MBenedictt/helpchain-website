"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Address } from "viem"
import { withdraw } from "@/lib/withdraw"
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
import { Textarea } from "../ui/textarea"
import { BanknoteArrowDown } from "lucide-react"

// Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Zod schema
const withdrawSchema = z.object({
    value: z
        .string()
        .nonempty("Withdraw amount is required")
        .regex(/^\d+$/, "Must be a valid number"),
    reason: z.string().nonempty("Reason is required"),
})

type WithdrawForm = z.infer<typeof withdrawSchema>

export default function WithdrawButton({ campaignAddress }: { campaignAddress: Address }) {
    const [loading, setLoading] = useState(false)

    const form = useForm<WithdrawForm>({
        resolver: zodResolver(withdrawSchema),
        defaultValues: { value: "", reason: "" },
    })

    const handleWithdraw = async (values: WithdrawForm) => {
        setLoading(true)
        try {
            toast.loading("Sending withdraw transaction...")

            const txHash = await withdraw(campaignAddress)

            toast.loading("Waiting for confirmation...")

            await publicClient.waitForTransactionReceipt({ hash: txHash })

            // Save record in Supabase
            const { error } = await supabase.from("withdrawals").insert([
                {
                    campaign_address: campaignAddress,
                    value: values.value,
                    reason: values.reason,
                    date: new Date().toISOString(),
                    tx_hash: txHash,
                },
            ])

            if (error) throw error

            toast.dismiss()
            toast.success("Withdraw successful!", {
                closeButton: true,
                position: "top-right",
            })

            form.reset()
        } catch (error) {
            toast.dismiss()
            console.error("Withdraw failed:", error)
            toast.error("Failed to process withdraw. Try again later.", {
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
                            className="cursor-pointer bg-green-500 hover:bg-green-700 text-white text-sm font-bold p-2 rounded"
                            disabled={loading}
                        >
                            <BanknoteArrowDown size={16} />
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
                            Please enter the withdraw amount and reason. This action will be recorded on-chain
                            and in our database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Amount</label>
                        <Input
                            type="number"
                            placeholder="Enter withdraw amount"
                            {...form.register("value")}
                        />
                        {form.formState.errors.value && (
                            <p className="text-red-500 text-sm">{form.formState.errors.value.message}</p>
                        )}
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Reason</label>
                        <Textarea
                            placeholder="Enter reason for withdraw"
                            {...form.register("reason")}
                        />
                        {form.formState.errors.reason && (
                            <p className="text-red-500 text-sm">{form.formState.errors.reason.message}</p>
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