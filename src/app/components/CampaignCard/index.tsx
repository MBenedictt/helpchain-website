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
    owner: string;
    compounding: bigint;
    index?: number;
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
    compounding,
    index = 0, // default to 0
}: CampaignCardProps) {
    const progress = Math.min(
        100,
        Number((compounding * BigInt(100)) / goal)
    );

    // 🔹 Image list
    const images = [
        "/assets/campaign-img 1.jpg",
        "/assets/campaign-img 2.jpg",
        "/assets/campaign-img 3.png",
    ];

    // 🔹 Loop through images (1 → 3 → repeat)
    const image = images[index % images.length];

    return (
        <Link href={`/campaign/${address}`}>
            <Card className="h-[420px] max-md:h-fit overflow-hidden hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer px-4 pt-4">
                <div className="relative h-fit">
                    <Image
                        src={image}
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
                                ${Number(compounding)}
                            </span>
                            <span className="text-sm text-gray-500">
                                ${Number(goal)} Goal
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
