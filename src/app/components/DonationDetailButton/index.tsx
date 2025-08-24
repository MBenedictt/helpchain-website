"use client";

import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Address } from "viem";
import { fetchDonationDetail } from "@/lib/get-logs";

export function DonationDetailButton({
  campaignAddress,
  backer,
}: {
  campaignAddress: Address;
  backer: Address;
}) {
  const [open, setOpen] = useState(false);
  const [donations, setDonations] = useState<
    { amount: string; date: string; txHash: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchDonationDetail(campaignAddress, backer)
        .then((res) => setDonations(res))
        .catch((err) => console.error("Error fetching donation history:", err))
        .finally(() => setLoading(false));
    }
  }, [open, campaignAddress, backer]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 cursor-pointer border border-gray-300 font-semibold text-black hover:bg-gray-100 hover:scale-105 py-2 px-4 max-sm:px-3 rounded transition">
              <Eye size={20} />
              <span className="text-sm max-sm:hidden">See Details</span>
            </button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>See Donation Details</p>
        </TooltipContent>
      </Tooltip>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Your Donation History</DialogTitle>
        </DialogHeader>

        {loading && <p className="text-sm text-gray-500">Loading...</p>}

        {!loading && donations.length === 0 && (
          <p className="text-sm text-gray-500">No donations found.</p>
        )}

        {!loading && donations.length > 0 && (
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {donations.map((d, i) => (
              <div
                key={i}
                className="border rounded-lg p-3 flex flex-col gap-1 bg-gray-50"
              >
                <p className="text-sm">
                  <span className="font-medium">Amount:</span>{" "}
                  ${Number(d.amount)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Date:</span> {d.date}
                </p>
                <p className="text-sm truncate">
                  <span className="font-medium">Tx:</span>{" "}
                  <a
                    href={`https://sepolia.etherscan.io/tx/${d.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {d.txHash}
                  </a>
                </p>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}