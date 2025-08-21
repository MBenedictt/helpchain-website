import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../ui/alert-dialog"
import { refund } from "@/lib/refund"
import { Address } from "viem"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { publicClient } from "@/lib/contracts"
import { toast } from 'sonner';

export default function RefundButton({ campaignAddress }: { campaignAddress: Address }) {
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
                            className="cursor-pointer bg-red-500 hover:bg-red-700 text-white text-sm font-bold p-2 rounded"
                            disabled={true}
                        >
                            {loading ? "Processing..." : "Refund"}
                        </button>
                    </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Refund (Coming Soon)</p>
                </TooltipContent>
            </Tooltip>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Request Refund?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to request a refund for this campaign? This action
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