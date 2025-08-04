import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export default function SkeletonCard() {
    return (
        <Card className="overflow-hidden px-4 pt-4">
            <div className="relative h-[250px] max-md:h-[200px] mb-4">
                <Skeleton className="w-full h-full rounded-lg" />
            </div>
            <CardContent className="py-4 px-0">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-5 w-3/4 mb-4" />
                <Skeleton className="h-2.5 w-full mb-2" />
                <div className="flex justify-between items-center mt-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
            </CardContent>
        </Card>
    );
}