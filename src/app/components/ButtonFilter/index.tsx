'use client'

import { Button } from "@/app/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/app/components/ui/popover"
import {
    RadioGroup,
    RadioGroupItem,
} from "@/app/components/ui/radio-group"
import { SlidersHorizontal } from "lucide-react"
import { useState } from "react"

const goalOptions = [
    "All",
    "> $100K",
    "$100K - $50K",
    "$50K - $10K",
    "$10K - $1K",
    "$0 - $1K",
]

export function ButtonFilter() {
    const [selected, setSelected] = useState("All")

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="rounded-full border border-gray-300 px-4 py-2 text-gray-500 text-sm cursor-pointer hover:bg-gray-100 transition gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filter
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
                <h4 className="mb-2 text-sm font-semibold text-black">Goal</h4>
                <RadioGroup value={selected} onValueChange={setSelected}>
                    {goalOptions.map((label) => (
                        <div key={label} className="flex items-center space-x-2">
                            <RadioGroupItem value={label} id={label} className="cursor-pointer" />
                            <label
                                htmlFor={label}
                                className="cursor-pointer text-sm font-regular text-gray-500 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {label}
                            </label>
                        </div>
                    ))}
                </RadioGroup>
            </PopoverContent>
        </Popover>
    )
}