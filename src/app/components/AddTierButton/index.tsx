'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
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

export default function AddTiersButton({ campaignAddress }: AddTiersButtonProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            amount: ''
        }
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setSubmitting(true);
        try {
            const tx = await addTier(
                campaignAddress,
                values.name,
                BigInt(values.amount)
            );
            console.log('Tier added! Tx hash:', tx);
            form.reset();
            setDialogOpen(false);
        } catch (error) {
            console.error('Error adding tier:', error);
        } finally {
            setSubmitting(false);
        }
    };

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