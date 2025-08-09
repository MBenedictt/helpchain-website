import Image from "next/image";
import { Card, CardContent } from "../ui/card";
import { Progress } from "../ui/progress";
import Link from "next/link";

interface CampaignCardProps {
    address: string;
    name: string;
    description: string;
    goal: bigint;
    balance: bigint;
    deadline: bigint;
    owner: string;
}

function shortenAddress(address: string) {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function CampaignCard({
    address,
    name,
    owner,
    goal,
    balance,
    deadline,
}: CampaignCardProps) {
    const progress = Number((balance * BigInt(100)) / goal);

    const remainingDays = Math.max(
        0,
        Math.floor((Number(deadline) * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
    );

    return (
        <Link href={`/campaign/${address}`}>
            <Card className="h-[420px] max-md:h-fit overflow-hidden hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer px-4 pt-4">
                <div className="relative h-fit">
                    <Image
                        src="/assets/help.jpg"
                        alt="Campaign thumbnail"
                        width={300}
                        height={250}
                        className="object-cover w-full h-[250px] max-md:h-[200px] rounded-lg"
                    />
                </div>
                <CardContent className="py-4 px-0 h-full flex flex-col justify-between">
                    <div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                window.open(
                                    `https://sepolia.etherscan.io/address/${owner}`,
                                    "_blank"
                                );
                            }}
                            className="cursor-pointer bg-gray-100 px-2 py-1 rounded border border-gray-300 text-xs text-gray-500 hover:underline mb-1 block w-fit text-left"
                        >
                            {shortenAddress(owner)}
                        </button>

                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{name}</h3>
                    </div>
                    <div>
                        <Progress value={progress} />
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-md font-bold text-gray-900">
                                ${Number(balance)}
                            </span>
                            <span className="text-sm text-gray-500">
                                {remainingDays} days left
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}