'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCampaign } from '@/lib/create-campaign';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Checkbox } from '../ui/checkbox';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

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
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { publicClient } from '@/lib/contracts';
import { useAccount } from 'wagmi';

const formSchema = z
    .object({
        name: z.string().min(1, 'Campaign name is required'),
        goal: z
            .string()
            .min(1, 'Goal is required')
            .regex(/^\d+$/, 'Must be a positive whole number'),
        description: z.string().min(1, 'Description is required'),
        hasDeadline: z.boolean(),
        deadline: z.date().optional(),
    })
    .refine(
        (data) => {
            if (data.hasDeadline) {
                return !!data.deadline;
            }
            return true;
        },
        {
            message: 'Please select a deadline date',
            path: ['deadline'],
        }
    );

type CreateCampaignButtonProps = {
    onCampaignCreated?: () => void;
};

export default function CreateCampaignButton({ onCampaignCreated }: CreateCampaignButtonProps) {
    const [creating, setCreating] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const { address: connectedAddress } = useAccount();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            goal: '',
            description: '',
            hasDeadline: false,
            deadline: undefined,
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setCreating(true);
        try {
            toast.loading("Submitting transaction...");

            const deadlineInSeconds = values.hasDeadline && values.deadline
                ? BigInt(Math.floor(values.deadline.getTime() / 1000))
                : BigInt(0);

            const txHash = await createCampaign({
                name: values.name,
                description: values.description,
                goal: BigInt(values.goal),
                deadline: deadlineInSeconds, // ⬅️ ini
            });

            toast.loading("Waiting for confirmation...");
            await publicClient.waitForTransactionReceipt({ hash: txHash });

            toast.dismiss();
            toast.success("Campaign added successfully!", {
                closeButton: true,
                position: "top-right",
            });

            form.reset();
            setDialogOpen(false);

            if (onCampaignCreated) {
                onCampaignCreated();
            }

        } catch (error) {
            toast.dismiss();
            console.error("Failed to create campaign:", error);
            toast.error("Failed to create campaign, try again later.", {
                closeButton: true,
                position: "top-right",
            });
        } finally {
            setCreating(false);
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
            <DialogTrigger asChild>
                <button
                    className={`cursor-pointer px-5 py-3 rounded-lg text-sm font-medium ${!connectedAddress ? "bg-gray-300 text-gray-700 cursor-not-allowed" : "bg-lime-300 text-slate-800 hover:bg-lime-400 transition hover:scale-103"}`}
                    disabled={!connectedAddress}
                >
                    {!connectedAddress
                        ? "Please Connect Wallet"
                        : "Create Campaign"}
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create a New Campaign</DialogTitle>
                    <DialogDescription>
                        Fill out the details below to launch a new fundraising campaign.
                    </DialogDescription>
                    <DialogDescription>
                        In this campaign, <span className='font-semibold text-black'>1 wei equals $1</span>.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 max-md:space-y-2">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='font-[400] text-gray-600'>Campaign Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter campaign name"
                                            className="w-full p-2 mt-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-300"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className='text-[12px]' />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="goal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='font-[400] text-gray-600'>Goal</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="ex: 5000"
                                            className="w-full p-2 mt-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-300"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className='text-[12px]' />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='font-[400] text-gray-600'>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter campaign description..."
                                            className="w-full p-2 mt-1 border border-gray-300 rounded-md text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-lime-300"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className='text-[12px]' />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="hasDeadline"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-2">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className='cursor-pointer'
                                        />
                                    </FormControl>
                                    <FormLabel className="text-sm text-gray-700">
                                        This campaign has a deadline
                                    </FormLabel>
                                </FormItem>
                            )}
                        />

                        {form.watch('hasDeadline') && (
                            <FormField
                                control={form.control}
                                name="deadline"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="font-[400] text-gray-600">
                                            Campaign End Date
                                        </FormLabel>

                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className="justify-start text-left font-normal cursor-pointer"
                                                    >
                                                        {field.value
                                                            ? format(field.value, 'PPP')
                                                            : 'Pick a date'}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>

                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date() // tidak bisa pilih tanggal lampau
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>

                                        <FormMessage className="text-[12px]" />
                                    </FormItem>
                                )}
                            />
                        )}

                        <Button
                            type="submit"
                            disabled={creating}
                            className="mt-1 cursor-pointer w-full bg-lime-300 text-slate-800 hover:bg-lime-400"
                        >
                            {creating ? 'Creating campaign...' : 'Create'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}