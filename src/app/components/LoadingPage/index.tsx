import React from "react";

export default function LoadingPage({ isLoading }: { isLoading: boolean }) {
    return (
        <div
            className={`fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999] transition-all duration-500 ${isLoading ? "translate-y-0 opacity-100" : "-translate-y-[100%] opacity-0"
                }`}
        >
            {/* Spinner */}
            <div className="w-12 h-12 border-4 border-lime-100 border-t-lime-500 rounded-full animate-spin"></div>

            {/* Text */}
            <p className="mt-4 text-gray-600 text-sm font-medium">
                Loading, please wait...
            </p>
        </div>
    );
}