import { WithdrawalLog } from "@/lib/withdraw-logs";
import Link from "next/link";

function getStatusChip(w: WithdrawalLog) {
    if (w.success === false) {
        return (
            <div className="px-3 py-1 rounded-full text-[12px] font-medium w-fit bg-red-100 text-red-800">
                Failed
            </div>
        );
    }
    if (w.success === true) {
        return (
            <div className="px-3 py-1 rounded-full text-[12px] font-medium w-fit bg-green-100 text-green-800">
                Success
            </div>
        );
    }
    if (!w.finalized && w.success === null) {
        return (
            <div className="px-3 py-1 rounded-full text-[12px] font-medium w-fit bg-blue-100 text-blue-800">
                In Progress
            </div>
        );
    }
    if (w.finalized && w.success === null) {
        return (
            <div className="px-3 py-1 rounded-full text-[12px] font-medium w-fit bg-blue-100 text-blue-800">
                Waiting for Proof
            </div>
        );
    }
    return (
        <div className="px-3 py-1 rounded-full text-[12px] font-medium w-fit bg-gray-100 text-gray-800">
            Unknown
        </div>
    );
}

export default function WithdrawHistory({ withdrawals }: { withdrawals: WithdrawalLog[] }) {
    if (withdrawals.length === 0) {
        return <div className="my-4 text-gray-500">No withdrawals yet.</div>;
    }

    return (
        <div className="my-6 max-h-[250px] overflow-y-scroll pl-4">
            {withdrawals.map((w, i) => (
                <div key={i} className="flex w-full gap-6">
                    {/* timeline line + dot */}
                    <div className=" border-r-2 relative">
                        <span className="absolute top-[-14px] left-[-7.5px] text-neutral-400 text-[28px]">•</span>
                    </div>

                    {/* content */}
                    <div className="flex flex-col w-full pb-5">
                        <p className="text-gray-500 text-[12px]">{new Date(w.timestamp).toLocaleString()}</p>
                        <div className="w-full flex items-center gap-5">
                            <p className="text-black text-base font-semibold">
                                Withdrawal of ${w.amount}
                            </p>

                            {/* status */}
                            {getStatusChip(w)}
                        </div>

                        {/* proposal url */}
                        <p className="text-sm text-neutral-600 mt-1">
                            Proposal:{" "}
                            {w.proposalUrl ? (
                                <Link
                                    href={w.proposalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-700 hover:text-lime-500 underline"
                                >
                                    View Proposal
                                </Link>
                            ) : (
                                "Not uploaded yet"
                            )}
                        </p>

                        {/* proof url */}
                        <p className="text-sm text-neutral-600 mt-1">
                            Proof:{" "}
                            {w.proofUrl ? (
                                <Link
                                    href={w.proofUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-700 hover:text-lime-500 underline"
                                >
                                    View Proof
                                </Link>
                            ) : (
                                "Not uploaded yet"
                            )}
                        </p>

                        {/* tx hash */}
                        <p className="text-sm text-neutral-600 mt-1">
                            {w.txHash ? (
                                <Link
                                    href={`https://sepolia.etherscan.io/tx/${w.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 text-sm hover:text-gray-600 underline"
                                >
                                    View Tx
                                </Link>
                            ) : (
                                "Not available"
                            )}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}