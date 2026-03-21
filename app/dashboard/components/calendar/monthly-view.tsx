'use client'

import React, { memo, useMemo } from "react"
import {
  format,
  isSameMonth,
  isToday,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  getISOWeek,
} from "date-fns"
import { cn, formatCurrency, BREAK_EVEN_THRESHOLD } from "@/lib/utils"
import { NotebookPen } from "lucide-react"
import { CalendarData } from "@/app/dashboard/types/calendar"
import { useCalendarViewStore } from "@/store/calendar-view"
import { useUserStore } from "@/store/user-store"
import { useCalendarNotes } from "@/app/dashboard/hooks/use-calendar-notes"
import { calculateDailyStats } from "./calendar-utils"

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

const formatCompact = (value: number) => {
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(2)}K`
  return `$${value.toFixed(0)}`
}

// ============================================================================
// Day Cell — deep green/red fill, prominent P&L, trade count + winrate
// ============================================================================
const DayCell = memo(function DayCell({
  date,
  dayData,
  hasNotes,
  isCurrentMonth,
  onClick,
}: {
  date: Date
  dayData: CalendarData[string] | undefined
  hasNotes: boolean
  isCurrentMonth: boolean
  onClick: () => void
}) {
  const { visibleStats } = useCalendarViewStore()
  const isTodayDate = isToday(date)

  const stats = useMemo(() => {
    if (!dayData?.trades || dayData.trades.length === 0) return null
    return calculateDailyStats(dayData.trades)
  }, [dayData])

  const hasTrades = !!stats

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center p-1 md:p-2 rounded-md border cursor-pointer transition-all duration-150 select-none group min-h-[48px] md:min-h-[84px]",

        // No trades — dark neutral
        !hasTrades && isCurrentMonth && "bg-card/50 border-border/30 hover:border-border/60",

        // Profit — deep green
        hasTrades && stats.isProfit && "bg-long/15 border-long/25 hover:bg-long/25 hover:border-long/40",

        // Loss — deep red
        hasTrades && stats.isLoss && "bg-short/15 border-short/25 hover:bg-short/25 hover:border-short/40",

        // Breakeven
        hasTrades && stats.isBreakEven && "bg-muted/30 border-border/30",

        // Not current month
        !isCurrentMonth && "opacity-15 pointer-events-none",

        // Today ring
        isTodayDate && isCurrentMonth && "ring-1.5 ring-primary/60 ring-offset-1 ring-offset-background",
      )}
      onClick={onClick}
    >
      {/* Day number — top right  */}
      <span
        className={cn(
          "absolute top-1 right-1.5 text-[10px] md:text-[11px] font-bold leading-none",
          isTodayDate
            ? "text-primary-foreground bg-primary rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-[9px] md:text-[10px]"
            : "text-muted-foreground/50",
        )}
      >
        {format(date, 'd')}
      </span>

      {/* Journal icon — top left */}
      {hasNotes && (
        <NotebookPen className="absolute top-1 left-1.5 h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground/50" />
      )}

      {/* P&L — centered, prominent */}
      {hasTrades && visibleStats.pnl && (
        <div
          className={cn(
            "font-black tracking-tighter text-[11px] md:text-[15px] leading-none mt-1",
            stats.isProfit ? "text-long" : stats.isLoss ? "text-short" : "text-muted-foreground",
          )}
        >
          {formatCompact(stats.pnl)}
        </div>
      )}

      {/* Secondary metrics — trade count + winrate */}
      {hasTrades && (
        <div className="hidden md:flex flex-col items-center gap-0 mt-0.5">
          {visibleStats.trades && (
            <span className="text-[9px] font-semibold text-muted-foreground/60">
              {stats.tradeCount} trade{stats.tradeCount !== 1 ? 's' : ''}
            </span>
          )}
          {visibleStats.winRate && (
            <span className="text-[9px] font-semibold text-muted-foreground/60">
              {stats.winRate.toFixed(1)}%
            </span>
          )}
          {visibleStats.rMultiple && (
            <span className="text-[9px] font-semibold text-muted-foreground/60">
              {stats.rMultiple.toFixed(2)}R
            </span>
          )}
        </div>
      )}
    </div>
  )
})

// ============================================================================
// Weekly Summary Card — right sidebar
// ============================================================================
function WeeklySummary({
  weekIndex,
  weekDays,
  calendarData,
  currentDate,
  onReviewWeek,
}: {
  weekIndex: number
  weekDays: Date[]
  calendarData: CalendarData
  currentDate: Date
  onReviewWeek?: (date: Date) => void
}) {
  const stats = useMemo(() => {
    let pnl = 0
    let tradedDays = 0

    weekDays.forEach((day) => {
      if (!isSameMonth(day, currentDate)) return
      const key = format(day, 'yyyy-MM-dd')
      const data = calendarData[key]
      if (data && data.tradeNumber > 0) {
        pnl += data.pnl
        tradedDays++
      }
    })

    return { pnl, tradedDays }
  }, [weekDays, calendarData, currentDate])

  const isPositive = stats.pnl >= 0

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border p-2 cursor-pointer transition-all hover:shadow-sm min-h-[70px]",
        stats.tradedDays === 0
          ? "bg-card/30 border-border/20"
          : isPositive
            ? "bg-long/5 border-long/15"
            : "bg-short/5 border-short/15",
      )}
      onClick={() => onReviewWeek?.(weekDays[0])}
    >
      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-0.5">
        Week {weekIndex + 1}
      </span>
      <span
        className={cn(
          "text-sm md:text-base font-black tracking-tighter",
          stats.tradedDays === 0
            ? "text-muted-foreground/30"
            : isPositive
              ? "text-long"
              : "text-short",
        )}
      >
        {stats.tradedDays === 0 ? "$0" : formatCompact(stats.pnl)}
      </span>
      <span
        className={cn(
          "text-[9px] font-bold mt-0.5 px-1.5 py-0.5 rounded-full",
          stats.tradedDays > 0
            ? "bg-primary/10 text-primary"
            : "bg-muted/30 text-muted-foreground/40",
        )}
      >
        {stats.tradedDays} day{stats.tradedDays !== 1 ? 's' : ''}
      </span>
    </div>
  )
}

// ============================================================================
// Monthly View — grid + weekly summaries sidebar
// ============================================================================
export default function MonthlyView({
  currentDate,
  calendarData,
  onSelectDate,
  onReviewWeek,
  hideWeekends = false,
}: {
  currentDate: Date
  calendarData: CalendarData
  onSelectDate: (date: Date) => void
  onReviewWeek?: (weekDate: Date) => void
  hideWeekends?: boolean
}) {
  const timezone = useUserStore((state) => state.timezone)
  const { notes } = useCalendarNotes()

  // Sunday-start weeks
  const weeks = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 })
    const days = eachDayOfInterval({ start, end })

    const weeksArray = []
    for (let i = 0; i < days.length; i += 7) {
      let weekDays = days.slice(i, i + 7)
      
      // Filter out weekends if requested
      if (hideWeekends) {
        weekDays = weekDays.filter(day => {
          const dayIndex = day.getDay()
          return dayIndex !== 0 && dayIndex !== 6
        })
      }
      
      if (weekDays.length > 0) {
        weeksArray.push(weekDays)
      }
    }
    return weeksArray
  }, [currentDate, hideWeekends])

  const displayWeekdays = hideWeekends 
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] 
    : WEEKDAYS

  return (
    <div className="flex h-full">
      {/* Main Calendar Grid */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Weekday Headers */}
        <div className={cn("grid gap-1 md:gap-1.5 px-2 md:px-3 pt-3 pb-1", hideWeekends ? "grid-cols-5" : "grid-cols-7")}>
          {displayWeekdays.map((day) => (
            <div
              key={day}
              className="text-center text-[9px] md:text-[10px] font-bold text-muted-foreground/50 tracking-widest uppercase"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day Grid */}
        <div className={cn("flex-1 grid gap-1 md:gap-1.5 p-2 md:p-3 pt-0 auto-rows-fr min-h-0 overflow-y-auto", hideWeekends ? "grid-cols-5" : "grid-cols-7")}>
          {weeks.map((week, weekIndex) => (
            <React.Fragment key={weekIndex}>
              {week.map((date) => {
                const dateKey = format(date, 'yyyy-MM-dd')
                const dayData = calendarData[dateKey]
                const isCurrentMonth = isSameMonth(date, currentDate)
                const hasNotes = !!notes[dateKey]

                return (
                  <DayCell
                    key={date.toISOString()}
                    date={date}
                    dayData={dayData}
                    hasNotes={hasNotes}
                    isCurrentMonth={isCurrentMonth}
                    onClick={() => onSelectDate(date)}
                  />
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Weekly Summaries Sidebar */}
      <div className="hidden lg:flex flex-col gap-1.5 w-[100px] xl:w-[110px] p-2 pl-0 border-l border-border/20">
        {/* Spacer to align with weekday header */}
        <div className="h-[26px] shrink-0" />

        {weeks.map((week, index) => (
          <WeeklySummary
            key={index}
            weekIndex={index}
            weekDays={week}
            calendarData={calendarData}
            currentDate={currentDate}
            onReviewWeek={onReviewWeek}
          />
        ))}
      </div>
    </div>
  )
}
