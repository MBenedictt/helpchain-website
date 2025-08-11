"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="flex items-center gap-2 py-2 text-sm hover:underline transition text-gray-600 cursor-pointer"
        >
            <ArrowLeft size={20} />
            <span>Go Back</span>
        </button>
    );
}