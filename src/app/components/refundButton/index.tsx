import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../ui/alert-dialog"
import { refund } from "@/lib/refund"
import { Address } from "viem"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { publicClient } from "@/lib/contracts"
import { toast } from 'sonner';
import { BanknoteX } from "lucide-react"

export default function RefundButton({ campaignAddress, onSuccess, totalContribution }: { campaignAddress: Address, onSuccess: () => void, totalContribution?: number }) {
    const [loading, setLoading] = useState(false)

    const handleRefund = async () => {
        setLoading(true)
        try {
            toast.loading("Sending refund transaction...")

            const txHash = await refund(campaignAddress)

            toast.loading("Waiting for confirmation...")

            await publicClient.waitForTransactionReceipt({ hash: txHash })

            toast.dismiss()
            toast.success("Refund confirmed successfully!", {
                closeButton: true,
                position: "top-right",
            })

            if (onSuccess) onSuccess();
        } catch (error) {
            toast.dismiss()
            console.error("Refund failed:", error)
            toast.error("Failed to process refund. Try again later.", {
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
                            className="flex items-center gap-3 cursor-pointer bg-red-100 border border-red-300 hover:bg-red-200 text-red-600 px-3 py-2 rounded hover:scale-105 transition"
                            disabled={loading}
                        >
                            <BanknoteX size={20} /> <span className='text-sm'>{loading ? "Processing..." : "Refund"}</span>
                        </button>
                    </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Claim your remaining funds</p>
                </TooltipContent>
            </Tooltip>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Claim Refund?</AlertDialogTitle>
                    <AlertDialogDescription>
                        The remaining amount you could claim is <span className="font-bold text-black">${totalContribution}</span>. <br /> <br />
                        Are you sure you want to claim a refund for this campaign? This action
                        cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="cursor-pointer bg-lime-300 hover:bg-lime-400 text-black"
                        onClick={handleRefund}
                        disabled={loading}
                    >
                        {loading ? "Confirming..." : "Yes, Refund"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}