"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { ButtonFilter } from "../components/ButtonFilter";
import CampaignCard from "../components/CampaignCard";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "../components/ui/pagination";
import { getPaginatedCampaigns } from "@/lib/campaigns";
import { toast } from "sonner";
import SkeletonCard from "../components/SkeletonCard";
import Footer from "../components/Footer";

type Campaign = {
    address: string;
    name: string;
    description: string;
    goal: bigint;
    deadline: bigint;
    balance: bigint;
    owner: string;
};

const PER_PAGE = 6;
const categories = [
    "All", "📚 Education", "❤️ Social", "🩺 Health", "🌪️ Disaster", "🌱 Environment"
];

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    async function loadCampaigns(page: number) {
        setLoading(true);
        try {
            const { campaigns, total } = await getPaginatedCampaigns(page, PER_PAGE);
            setCampaigns(campaigns);
            setTotalPages(Math.ceil(total / PER_PAGE));
        } catch (err) {
            console.error("Failed to fetch campaigns", err);
            toast.error("Failed to fetch campaigns, try again later.", {
                closeButton: true,
                position: "top-right",
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCampaigns(currentPage);
    }, [currentPage]);

    return (
        <div className="font-inter">
            <Navbar />

            <div className="w-full px-30 max-[1280px]:px-20 max-[991px]:px-10 max-sm:px-5 mt-[120px]">
                <div className="flex flex-col justify-center items-center gap-4 max-md:gap-2 mb-10 max-md:mb-7">
                    <h1 className="text-5xl font-bold max-md:text-4xl max-sm:text-2xl">Discover Campaigns</h1>
                    <p className="font-semibold text-xl max-md:text-lg max-sm:text-base">
                        or <Link href="/" className="text-lime-500 hover:underline">create your own</Link>
                    </p>
                    <div
                        className="flex items-center w-[700px] max-[991px]:w-[500px] max-md:w-10/12 max-sm:w-full px-4 py-2 bg-white rounded-xl mt-2 max-md:mt-5"
                        style={{
                            boxShadow: "rgba(60, 64, 67, 0.32) 0px 1px 2px, rgba(60, 64, 67, 0.15) 0px 2px 6px, rgba(0, 0, 0, 0.1) 0px 1px 8px",
                        }}
                    >
                        <Search className="w-6 h-6 text-gray-400 mr-4" />
                        <input
                            type="text"
                            placeholder="Search for a campaign"
                            className="w-full text-gray-700 placeholder-gray-400 bg-transparent border-none focus:outline-none py-2 max-md:text-sm max-md:py-1"
                        />
                    </div>
                </div>

                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between flex-wrap md:flex-nowrap mb-10 max-md:mb-5 gap-4">
                        <div className="flex flex-wrap max-sm:justify-center items-center gap-2">
                            {categories.map((category) => (
                                <span
                                    key={category}
                                    className="rounded-full border border-gray-300 px-4 py-2 text-gray-500 text-sm cursor-pointer hover:bg-gray-100 hover:text-gray-900 transition"
                                >
                                    {category}
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center justify-end w-full md:w-auto max-md:mt-3">
                            <ButtonFilter />
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid md:grid-cols-3 gap-6">
                            {[...Array(3)].map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    ) : campaigns.length === 0 ? (
                        <div className="text-center text-gray-500 w-full h-[300px] flex items-center justify-center">
                            No campaigns available yet.
                        </div>
                    ) : (
                        <>
                            <div className="grid md:grid-cols-3 gap-6 mb-10">
                                {campaigns.map((campaign) => (
                                    <CampaignCard key={campaign.address} {...campaign} />
                                ))}
                            </div>

                            {/* Pagination */}
                            <Pagination className="mt-10">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setCurrentPage((prev) => Math.max(prev - 1, 1));
                                            }}
                                        />
                                    </PaginationItem>

                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <PaginationItem key={i}>
                                            <PaginationLink
                                                href="#"
                                                isActive={currentPage === i + 1}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setCurrentPage(i + 1);
                                                }}
                                            >
                                                {i + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}

                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                                            }}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}