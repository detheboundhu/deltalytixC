import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="flex flex-1 flex-col h-full w-full space-y-4 p-4">
            {/* KPI Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
                {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-muted/10 border border-border/40 rounded-2xl p-4 h-[100px]">
                        <div className="h-2 w-16 bg-muted/40 rounded mb-3" />
                        <div className="h-6 w-24 bg-muted/40 rounded mb-2" />
                        <div className="h-2 w-12 bg-muted/30 rounded" />
                    </div>
                ))}
            </div>

            {/* Widget Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
                {/* Large Widget */}
                <div className="col-span-1 md:col-span-2 bg-muted/10 border border-border/40 rounded-2xl h-[300px] p-5">
                    <div className="h-2 w-20 bg-muted/40 rounded mb-4" />
                    <div className="h-full bg-muted/20 rounded-lg" />
                </div>

                {/* Small Widget */}
                <div className="bg-muted/10 border border-border/40 rounded-2xl h-[300px] p-5">
                    <div className="h-2 w-16 bg-muted/40 rounded mb-4" />
                    <div className="h-full bg-muted/20 rounded-lg" />
                </div>

                {/* Medium Widgets */}
                {[0, 1, 2].map((i) => (
                    <div key={i} className="bg-muted/10 border border-border/40 rounded-2xl h-[250px] p-5">
                        <div className="h-2 w-20 bg-muted/40 rounded mb-4" />
                        <div className="h-full bg-muted/20 rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
    )
}
