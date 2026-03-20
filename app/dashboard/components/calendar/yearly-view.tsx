
'use client'

import React, { useMemo } from "react"
import { format, eachMonthOfInterval, startOfYear, endOfYear, getMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, startOfMonth, endOfMonth, getDay, isToday } from "date-fns"
import { cn, formatCurrency, BREAK_EVEN_THRESHOLD } from "@/lib/utils"
import { CalendarData } from "@/app/dashboard/types/calendar"
import { useUserStore } from "@/store/user-store"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { WEEKDAYS_SHORT } from "@/app/dashboard/constants/calendar-styles"

// Mini Month Component
function MiniMonth({
    monthDate,
    calendarData,
    year
}: {
    monthDate: Date
    calendarData: CalendarData
    year: number
}) {
    // Calculate Month Stats
    const stats = useMemo(() => {
        let pnl = 0
        let trades = 0
        Object.entries(calendarData).forEach(([key, data]) => {
            const [kYear, kMonth] = key.split('-').map(Number)
            if (kYear === year && (kMonth - 1) === getMonth(monthDate)) {
                pnl += data.pnl
                trades += data.tradeNumber
            }
        })
        return { pnl, trades }
    }, [calendarData, monthDate, year])

    // Calculate days for the grid (ISO: Monday start)
    const gridDays = useMemo(() => {
        const monthStart = startOfMonth(monthDate)
        const monthEnd = endOfMonth(monthDate)
        const start = startOfWeek(monthStart, { weekStartsOn: 1 })
        const end = endOfWeek(monthEnd, { weekStartsOn: 1 })
        return eachDayOfInterval({ start, end })
    }, [monthDate])

    return (
        <div className="flex flex-col gap-3 p-4 rounded-xl border border-border/40 bg-card/20 hover:bg-card/40 transition-all duration-300 group shadow-sm hover:shadow-md">
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-black tracking-tight uppercase text-muted-foreground/80 group-hover:text-foreground transition-colors">
                    {format(monthDate, 'MMMM')}
                </span>

                {stats.trades > 0 && (
                    <div className={cn(
                        "text-[10px] font-black px-2 py-0.5 rounded-md border shadow-sm",
                        stats.pnl > BREAK_EVEN_THRESHOLD ? "bg-long/10 border-long/20 text-long" :
                        stats.pnl < -BREAK_EVEN_THRESHOLD ? "bg-short/10 border-short/20 text-short" :
                        "bg-muted/30 border-border/20 text-muted-foreground"
                    )}>
                        {formatCurrency(stats.pnl, 0)}
                    </div>
                )}
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1">
                {WEEKDAYS_SHORT.map((day, i) => (
                    <div key={i} className="text-[9px] font-bold text-center text-muted-foreground/40 uppercase">
                        {day}
                    </div>
                ))}
            </div>

            {/* Mini Grid */}
            <TooltipProvider>
                <div className="grid grid-cols-7 gap-1">
                    {gridDays.map((day) => {
                        const isCurrentMonth = isSameMonth(day, monthDate)
                        const isTodayDate = isToday(day)
                        const key = format(day, 'yyyy-MM-dd')
                        const data = calendarData[key]
                        const hasTrades = data && data.tradeNumber > 0

                        return (
                            <Tooltip key={key}>
                                <TooltipTrigger asChild>
                                    <div
                                        className={cn(
                                            "aspect-square w-full rounded-[3px] transition-all duration-200 border",
                                            !isCurrentMonth && "opacity-0 pointer-events-none",
                                            isCurrentMonth && !hasTrades && "bg-muted/10 border-transparent hover:bg-muted/20",
                                            hasTrades && data.pnl > BREAK_EVEN_THRESHOLD && "bg-long/20 border-long/30 hover:bg-long/40 hover:border-long/50",
                                            hasTrades && data.pnl < -BREAK_EVEN_THRESHOLD && "bg-short/20 border-short/30 hover:bg-short/40 hover:border-short/50",
                                            hasTrades && ! (data.pnl > BREAK_EVEN_THRESHOLD) && ! (data.pnl < -BREAK_EVEN_THRESHOLD) && "bg-muted/40 border-border/30",
                                            isTodayDate && isCurrentMonth && "ring-1 ring-primary/50 ring-offset-1 ring-offset-background"
                                        )}
                                    />
                                </TooltipTrigger>
                                {isCurrentMonth && (
                                    <TooltipContent side="top" className="text-[10px] py-1.5 px-2.5 bg-popover/95 backdrop-blur-sm border-border/40 shadow-xl">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="font-bold text-muted-foreground">{format(day, 'MMM d, yyyy')}</span>
                                                {hasTrades && (
                                                    <span className="bg-muted/50 px-1 rounded text-[9px] font-bold">
                                                        {data.tradeNumber} trades
                                                    </span>
                                                )}
                                            </div>
                                            <div className={cn(
                                                "font-black text-xs tracking-tight",
                                                !hasTrades ? "text-muted-foreground/50" :
                                                data.pnl > BREAK_EVEN_THRESHOLD ? "text-long" :
                                                data.pnl < -BREAK_EVEN_THRESHOLD ? "text-short" :
                                                "text-muted-foreground"
                                            )}>
                                                {data ? formatCurrency(data.pnl) : '$0.00'}
                                            </div>
                                        </div>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        )
                    })}
                </div>
            </TooltipProvider>
        </div>
    )
}

export default function YearlyView({
    year,
    calendarData
}: {
    year: number
    calendarData: CalendarData
}) {
    const months = useMemo(() => eachMonthOfInterval({
        start: startOfYear(new Date(year, 0, 1)),
        end: endOfYear(new Date(year, 0, 1))
    }), [year])

    return (
        <div className="h-full overflow-y-auto p-4 md:p-6 bg-card/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 max-w-[1600px] mx-auto">
                {months.map(month => (
                    <MiniMonth
                        key={month.toISOString()}
                        monthDate={month}
                        calendarData={calendarData}
                        year={year}
                    />
                ))}
            </div>
        </div>
    )
}
