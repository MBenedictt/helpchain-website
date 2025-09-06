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
} from "../ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Gavel } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Address } from "viem";
import { finalizeWithdrawRequest } from "@/lib/finalized";
import { publicClient } from "@/lib/contracts";
import { supabaseClient } from "@/lib/supabase/supabaseClient";

interface FinalizedButtonProps {
    campaignAddress: Address;
    withdrawId: bigint;
    onSuccess?: () => void;
    amount: number;
    yesWeight: number;
    dbId: number; // Supabase row ID for the withdrawal
}

export default function FinalizedButton({
    campaignAddress,
    withdrawId,
    onSuccess,
    amount,
    yesWeight,
    dbId,
}: FinalizedButtonProps) {
    const [loading, setLoading] = useState(false);

    const coveredAmount = yesWeight >= amount ? amount : yesWeight;

    const handleFinalize = async () => {
        try {
            setLoading(true);
            toast.loading("Finalizing withdrawal...");

            const txHash = await finalizeWithdrawRequest(campaignAddress, withdrawId);

            toast.loading("Waiting for confirmation...");
            await publicClient.waitForTransactionReceipt({ hash: txHash });

            // update Supabase
            const { error } = await supabaseClient
                .from("withdrawals")
                .update({
                    finalized: true,
                    finalized_at: new Date().toISOString(),
                    tx_hash: txHash,
                })
                .eq("id", dbId);

            if (error) {
                console.error("Error updating Supabase:", error.message);
            }

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
                            className="flex items-center gap-2 cursor-pointer border border-gray-300 font-semibold text-black bg-white hover:bg-gray-200 hover:scale-105 py-2 px-4 max-sm:px-3 rounded"
                        >
                            <Gavel size={20} />
                            <span className="text-sm">Finalize</span>
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
                        {yesWeight >= amount ? (
                            <>
                                <strong className="text-gray-700 font-semibold">
                                    This action is permanent. Backers have covered the full request.
                                </strong>
                                <br />
                                <strong className="text-black font-semibold text-3xl">
                                    ${amount}
                                </strong>
                                <br />
                                will be transferred to your wallet address.
                            </>
                        ) : (
                            <>
                                <strong className="text-gray-700 font-semibold">
                                    Backers didn’t fully cover the withdrawal request.
                                </strong>
                                <br />
                                Only the covered amount of{" "}
                                <strong className="text-black font-semibold text-3xl">
                                    ${coveredAmount}
                                </strong>{" "}
                                will be transferred to your wallet.
                            </>
                        )}
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