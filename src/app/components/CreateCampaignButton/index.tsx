'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCampaign } from '@/lib/create-campaign';

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

const formSchema = z.object({
    name: z.string().min(1, 'Campaign name is required'),
    goal: z
        .string()
        .min(1, 'Goal is required')
        .regex(/^\d+$/, 'Must be a positive whole number'),
    duration: z
        .string()
        .min(1, 'Duration is required')
        .regex(/^\d+$/, 'Must be a positive whole number'),
    description: z.string().min(1, 'Description is required'),
})

export default function CreateCampaignButton() {
    const [creating, setCreating] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            goal: '',
            duration: '',
            description: ''
        }
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setCreating(true);
        try {
            const tx = await createCampaign({
                name: values.name,
                description: values.description,
                goal: BigInt(values.goal),
                duration: BigInt(values.duration),
            });

            console.log('Tx submitted:', tx);

            form.reset();
            setDialogOpen(false);
        } catch (error) {
            console.error('Failed to create campaign:', error);
            toast.error("Failed to create campaign, try again later.", {
                closeButton: true,
                position: "top-right",
            });
        } finally {
            setCreating(false);
        }
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <button className="cursor-pointer px-5 py-3 rounded-lg text-sm font-medium bg-lime-300 text-slate-800 hover:bg-lime-400 transition hover:scale-103">
                    Create Campaign
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create a New Campaign</DialogTitle>
                    <DialogDescription>
                        Fill out the details below to launch a new fundraising campaign.
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
                        <div className='grid grid-cols-2 max-md:grid-cols-1 gap-4'>
                            <FormField
                                control={form.control}
                                name="goal"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='font-[400] text-gray-600'>Goal (in wei, 1 wei = $1)</FormLabel>
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
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='font-[400] text-gray-600'>Campaign Length (days)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="ex: 30"
                                                className="w-full p-2 mt-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-300"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className='text-[12px]' />
                                    </FormItem>
                                )}
                            />
                        </div>

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