'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X } from 'lucide-react';
import { Address } from 'viem';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '../ui/dialog';

import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage
} from '../ui/form';

import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { addTier } from '@/lib/add-tier';
import { removeTier } from '@/lib/remove-tier';
import { Badge } from '../ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { fetchCampaignByAddress } from '@/lib/campaigns';
import { publicClient } from '@/lib/contracts';
import { toast } from 'sonner';

// Schema for validation
const formSchema = z.object({
    name: z.string().min(1, 'Tier name is required'),
    amount: z
        .string()
        .min(1, 'Tier cost is required')
        .regex(/^\d+$/, 'Must be a positive number')
});

interface AddTiersButtonProps {
    campaignAddress: Address;
}

interface Tier {
    name: string;
    amount: bigint;
    backers: bigint;
}

export default function AddTiersButton({ campaignAddress }: AddTiersButtonProps) {
    const [tiers, setTiers] = useState<Tier[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedTier, setSelectedTier] = useState<{ index: number; name: string } | null>(null);
    const [removing, setRemoving] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            amount: ''
        }
    });

    const refreshTiers = async () => {
        const campaign = await fetchCampaignByAddress(campaignAddress);
        if (campaign) setTiers(campaign.tiers);
    };

    const handleRemoveTier = async () => {
        if (!selectedTier) return;
        try {
            setRemoving(true);
            toast.loading("Sending transaction...");

            const txHash = await removeTier(campaignAddress, selectedTier.index);

            toast.loading("Waiting for confirmation...");

            await publicClient.waitForTransactionReceipt({ hash: txHash });

            await refreshTiers();

            toast.dismiss();
            toast.success("Tier removed successfully!", {
                closeButton: true,
                position: "top-right",
            });

            setSelectedTier(null);
        } catch (err) {
            toast.dismiss();
            console.error("Failed to remove tier:", err);
            toast.error("Failed to remove tier, try again later.", {
                closeButton: true,
                position: "top-right",
            });
        } finally {
            setRemoving(false);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setSubmitting(true);
        try {
            toast.loading("Sending transaction...");

            const txHash = await addTier(
                campaignAddress,
                values.name,
                BigInt(values.amount)
            );

            toast.loading("Waiting for confirmation...");

            await publicClient.waitForTransactionReceipt({ hash: txHash });

            await refreshTiers();

            toast.dismiss();
            toast.success("Tier added successfully!", {
                closeButton: true,
                position: "top-right",
            });

            form.reset();
            setDialogOpen(false);
        } catch (error) {
            toast.dismiss();
            console.error("Error adding tier:", error);
            toast.error("Failed to add tier, try again later.", {
                closeButton: true,
                position: "top-right",
            });
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        refreshTiers();
    }, [campaignAddress]);

    return (
        <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) {
                    form.reset();
                }
            }}
        >
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <button
                            className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold p-2 rounded"
                        >
                            <Plus size={16} />
                        </button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Add Tiers</p>
                </TooltipContent>
            </Tooltip>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create a Funding Tier</DialogTitle>
                    <DialogDescription>
                        Funding tiers let you create quick-donate buttons for supporters. Each tier has a name and a fixed cost, so donors can choose their preferred amount with a single click.
                    </DialogDescription>
                    <DialogDescription>
                        In this campaign, <span className='font-semibold text-black'>1 wei equals $1</span>.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        {/* Tier Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='font-[400] text-gray-600'>Tier Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="Basic"
                                            className="w-full p-2 mt-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-300"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Tier Cost */}
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='font-[400] text-gray-600'>Tier Amount</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="ex: 10"
                                            className="w-full p-2 mt-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-300"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <p className="font-[400] text-gray-600 text-sm mb-2">Existing Tiers</p>
                        <div className="flex flex-wrap items-center gap-2">
                            {tiers.length === 0 ? (
                                <p className="text-gray-400 text-sm italic">No tiers available</p>
                            ) : (
                                tiers.map((tier, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center gap-1 py-1">
                                        {tier.name} - ${Number(tier.amount)}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <button
                                                    className="ml-1 p-0.5 rounded hover:bg-gray-200 cursor-pointer"
                                                    onClick={() => setSelectedTier({ index, name: tier.name })}
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Remove Tier</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete the tier{" "}
                                                        <b>{selectedTier?.name}</b>? This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel onClick={() => setSelectedTier(null)} className='cursor-pointer'>
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={handleRemoveTier}
                                                        disabled={removing}
                                                        className="cursor-pointer bg-lime-300 hover:bg-lime-400 text-black flex items-center justify-center"
                                                    >
                                                        {removing ? "Deleting..." : "Delete"}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </Badge>
                                ))
                            )}
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="mt-1 cursor-pointer w-full bg-lime-300 text-slate-800 hover:bg-lime-400"
                        >
                            {submitting ? 'Adding...' : 'Add Tier'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}