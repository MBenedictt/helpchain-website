"use client";

import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Gavel } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Address } from "viem";
import { finalizeWithdrawRequest } from "@/lib/finalized";
import { publicClient } from "@/lib/contracts";


interface FinalizedButtonProps {
    campaignAddress: Address;
    withdrawId: bigint;
    onSuccess?: () => void;
}

export default function FinalizedButton({ campaignAddress, withdrawId, onSuccess }: FinalizedButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleFinalize = async () => {
        try {
            setLoading(true);
            toast.loading("Finalizing withdrawal...");

            const txHash = await finalizeWithdrawRequest(campaignAddress, withdrawId);

            toast.loading("Waiting for confirmation...");
            await publicClient.waitForTransactionReceipt({ hash: txHash });

            toast.dismiss();
            toast.success("Withdrawal finalized!");
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("Finalize error:", err);
            toast.dismiss();
            toast.error("Failed to finalize withdrawal.");
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
                            disabled={loading}
                            className="flex items-center gap-2 cursor-pointer border border-gray-300 font-semibold text-black bg-white hover:bg-gray-200 hover:scale-105 py-2 px-4 max-sm:px-3 rounded transition"
                        >
                            <Gavel size={20} />
                            <span className="text-sm max-sm:hidden">Finalize</span>
                        </button>
                    </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Finalize Withdrawal</p>
                </TooltipContent>
            </Tooltip>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Finalize Withdrawal?</AlertDialogTitle>
                    <AlertDialogDescription>
                        <strong className="text-black font-semibold">
                            This action is permanent.
                        </strong>
                        <br />
                        - Voting is already ended.
                        - Funds will be distributed according to votes.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="cursor-pointer bg-lime-300 hover:bg-lime-400 text-black"
                        onClick={handleFinalize}
                    >
                        {loading ? "Finalizing..." : "Finalize"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}