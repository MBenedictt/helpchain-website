import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../ui/alert-dialog"
import { refund } from "@/lib/refund"
import { Address } from "viem"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { publicClient } from "@/lib/contracts"
import { toast } from 'sonner';
import { BanknoteX } from "lucide-react"

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
                            className="flex items-center gap-2 cursor-pointer bg-red-100 border border-red-300 hover:bg-red-200 text-red-600 hover:scale-105 py-2 px-4 max-sm:px-3 rounded transition"
                            disabled={true}
                        >
                            <BanknoteX size={20} /> <span className='text-sm max-sm:hidden'>{loading ? "Processing..." : "Refund"}</span>
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