import { DonationLog } from "@/lib/get-logs";
import { DollarSign } from "lucide-react";
import Link from "next/link";

function shortenAddress(address: string) {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function DonationLogs({ donations }: { donations: DonationLog[] }) {
    if (donations.length === 0) {
        return (
            <div className="my-4 text-gray-500">
                No transaction history yet.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {donations.map((d, i) => (
                <div key={i} className="flex items-center">
                    <div className="flex justify-center items-center rounded-full w-[40px] h-[40px] bg-gray-100 mr-3">
                        <DollarSign className="w-5 h-5 text-gray-600" strokeWidth={2} />
                    </div>
                    <div>
                        <div className="text-gray-500 text-[12px]">{d.timestamp}</div>
                        <div className="font-semibold text-sm">
                            {shortenAddress(d.backer)} donated ${d.amount}
                        </div>
                        <Link
                            className="text-gray-400 text-sm hover:text-gray-600 underline"
                            href={`https://sepolia.etherscan.io/tx/${d.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View Tx
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}