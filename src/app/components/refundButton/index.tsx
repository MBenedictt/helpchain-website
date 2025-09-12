import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../ui/alert-dialog"
import { refund } from "@/lib/refund"
import { Address } from "viem"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { publicClient } from "@/lib/contracts"
import { toast } from 'sonner';
import { BanknoteX } from "lucide-react"

export default function RefundButton({ campaignAddress, onSuccess }: { campaignAddress: Address, onSuccess: () => void }) {
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
                            className="flex items-center gap-3 cursor-pointer bg-white border border-gray-700 font-semibold text-black hover:scale-105 py-2 px-4 max-sm:px-3 rounded transition"
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