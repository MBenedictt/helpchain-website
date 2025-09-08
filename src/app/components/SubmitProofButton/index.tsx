"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Address } from "viem";
import { submitProofTx } from "@/lib/submit-proof";
import { publicClient } from "@/lib/contracts";
import { toast } from "sonner";

import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
} from "../ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "../ui/form";
import { Upload } from "lucide-react";
import { supabaseClient } from "@/lib/supabase/supabaseClient";

const proofSchema = z.object({
    proofFile: z
        .any()
        .refine((file) => file?.length === 1, "Proof file is required")
        .refine(
            (file) =>
                ["application/pdf", "image/jpeg", "image/png"].includes(file?.[0]?.type),
            "File must be a PDF, JPG, or PNG"
        ),
});

type ProofForm = z.infer<typeof proofSchema>;

export default function SubmitProofButton({
    campaignAddress,
    withdrawId,
    dbId,
    onSuccess,
}: {
    campaignAddress: Address;
    withdrawId: bigint; // contract withdraw id
    dbId: number; // supabase withdrawals row id
    onSuccess?: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const form = useForm<ProofForm>({
        resolver: zodResolver(proofSchema),
        defaultValues: { proofFile: [] },
    });

    const handleSubmitProof = async (values: ProofForm) => {
        setLoading(true);
        try {
            toast.loading("Submitting proof...");

            // 1. Contract call
            const txHash = await submitProofTx(campaignAddress, withdrawId);
            toast.loading("Waiting for confirmation...");
            await publicClient.waitForTransactionReceipt({ hash: txHash });

            // 2. Upload file
            const file = values.proofFile[0];
            const fileExt = file.name.split(".").pop();
            const filePath = `proofs/${campaignAddress}-${withdrawId}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabaseClient.storage
                .from("withdrawal-files")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabaseClient.storage
                .from("withdrawal-files")
                .getPublicUrl(filePath);

            const proofUrl = urlData.publicUrl;

            // 3. Update DB row
            const { error: dbError } = await supabaseClient
                .from("withdrawals")
                .update({
                    success: true,
                    requires_proof: false,
                    proof_url: proofUrl,
                })
                .eq("id", dbId);

            if (dbError) throw dbError;

            toast.dismiss();
            toast.success("Proof submitted successfully!");
            form.reset();
            setOpen(false);
            if (onSuccess) onSuccess();
        } catch (err) {
            toast.dismiss();
            console.error("Submit proof failed:", err);
            toast.error("Failed to submit proof.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                        <button
                            className="flex items-center gap-2 cursor-pointer border border-gray-700 font-semibold text-black hover:bg-gray-100 hover:scale-105 py-2 px-4 rounded transition"
                            disabled={loading}
                            onClick={() => setOpen(true)}
                        >
                            <Upload size={18} />
                            <span className="text-sm">Submit Proof</span>
                        </button>
                    </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Submit Withdrawal Proof</p>
                </TooltipContent>
            </Tooltip>

            <AlertDialogContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmitProof)} className="space-y-4">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Submit Proof</AlertDialogTitle>
                            <AlertDialogDescription>
                                Upload the proof document for the previous withdrawal.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <FormField
                            control={form.control}
                            name="proofFile"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Proof File</FormLabel>
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
                                {loading ? "Submitting..." : "Submit"}
                            </Button>
                        </AlertDialogFooter>
                    </form>
                </Form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
