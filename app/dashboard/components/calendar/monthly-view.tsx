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
  hideWeekends,
  isMiniCalendar,
  onClick,
}: {
  date: Date
  dayData: CalendarData[string] | undefined
  hasNotes: boolean
  isCurrentMonth: boolean
  hideWeekends?: boolean
  isMiniCalendar?: boolean
  onClick?: () => void
}) {
  const { visibleStats } = useCalendarViewStore()
  const isTodayDate = isToday(date)

  const hasTrades = !!dayData && dayData.tradeNumber > 0
  const isProfit = dayData?.isProfit ?? (dayData?.pnl ? dayData.pnl > BREAK_EVEN_THRESHOLD : false)
  const isLoss = dayData?.isLoss ?? (dayData?.pnl ? dayData.pnl < -BREAK_EVEN_THRESHOLD : false)
  const isBreakEven = dayData?.isBreakEven ?? (!isProfit && !isLoss && hasTrades)

  const winRateValue = useMemo(() => {
    if (!dayData?.trades || dayData.trades.length === 0) return 0
    const winners = dayData.trades.filter(t => (Number(t.pnl) + Number(t.commission || 0)) > BREAK_EVEN_THRESHOLD).length
    return (winners / dayData.trades.length) * 100
  }, [dayData])

  return (
    <div
      onClick={!isMiniCalendar && onClick ? onClick : undefined}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-md border transition-all duration-150 select-none group aspect-square",
        !isMiniCalendar && "cursor-pointer",

        // No trades — dark neutral
        !hasTrades && isCurrentMonth && "bg-card/40 border-border/20 hover:border-border/40",

        // Profit — deep green
        hasTrades && isProfit && "bg-long/20 border-long/30 hover:bg-long/30 hover:border-long/50",

        // Loss — deep red
        hasTrades && isLoss && "bg-short/20 border-short/30 hover:bg-short/30 hover:border-short/50",

        // Breakeven
        hasTrades && isBreakEven && "bg-muted/30 border-border/30",

        // Not current month
        !isCurrentMonth && "opacity-10 pointer-events-none",

        // Today ring
        isTodayDate && isCurrentMonth && "ring-1.5 ring-primary ring-offset-1 ring-offset-background",
      )}
    >
      {/* Note Icon — top left */}
      {hasNotes && (
        <div className="absolute top-1 left-1 opacity-60">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/80">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </div>
      )}

      {/* Day number — top right  */}
      <span
        className={cn(
          "absolute top-1 right-1 font-black leading-none",
          isTodayDate
            ? "text-primary-foreground bg-primary rounded-full w-4.5 h-4.5 flex items-center justify-center text-[9px]"
            : "text-muted-foreground/30 text-[10px]",
        )}
      >
        {format(date, 'd')}
      </span>

      {/* Main Content Container */}
      <div className="flex flex-col items-center justify-center w-full px-1">
        {/* P&L */}
        {hasTrades && visibleStats.pnl && (
          <div
            className={cn(
              "font-black tracking-tighter text-foreground text-center",
              isMiniCalendar ? "text-[10px]" : "text-[14px] md:text-[18px]",
              // Add a slight shadow for better contrast on colored backgrounds
              "drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
            )}
          >
            {dayData.pnl > 0 ? "+" : ""}{formatCompact(dayData.pnl)}
          </div>
        )}

        {/* Trade Count */}
        {hasTrades && visibleStats.trades && (
          <span className={cn(
            "font-bold text-muted-foreground/80 leading-none",
            isMiniCalendar ? "text-[7px]" : "text-[9px] md:text-[10px] mt-0.5"
          )}>
            {dayData.tradeNumber} trade{dayData.tradeNumber !== 1 ? 's' : ''}
          </span>
        )}

        {/* Secondary Stats Row (R & WinRate) */}
        {hasTrades && !isMiniCalendar && (
          <div className="flex items-center gap-1 mt-1 opacity-90">
            {visibleStats.rMultiple && dayData.dailyRMultiple !== undefined && (
              <span className={cn(
                "text-[8px] md:text-[9px] font-black",
                isProfit ? "text-long" : isLoss ? "text-short" : "text-muted-foreground"
              )}>
                {dayData.dailyRMultiple.toFixed(2)}R
              </span>
            )}
            {visibleStats.winRate && (
              <span className="text-[8px] md:text-[9px] font-black text-muted-foreground/60">
                {winRateValue.toFixed(0)}%
              </span>
            )}
          </div>
        )}
      </div>
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
        "flex flex-col items-center justify-center rounded-xl border p-2 cursor-pointer transition-all hover:bg-muted/10 group min-h-[85px]",
        stats.tradedDays === 0
          ? "bg-card/20 border-border/10"
          : isPositive
            ? "bg-long/10 border-long/20"
            : "bg-short/10 border-short/20",
      )}
      onClick={() => onReviewWeek?.(weekDays[0])}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 mb-1">
        WEEK {weekIndex + 1}
      </span>
      <span
        className={cn(
          "text-base md:text-lg font-black tracking-tighter drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]",
          stats.tradedDays === 0
            ? "text-muted-foreground/20"
            : isPositive
              ? "text-long"
              : "text-short",
        )}
      >
        {stats.tradedDays === 0 ? "$0" : formatCompact(stats.pnl)}
      </span>
      <span
        className={cn(
          "text-[10px] font-bold mt-1 px-2 py-0.5 rounded-md",
          stats.tradedDays > 0
            ? "bg-primary/10 text-primary border border-primary/20"
            : "bg-muted/10 text-muted-foreground/20",
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
  isMiniCalendar = false,
}: {
  currentDate: Date
  calendarData: CalendarData
  onSelectDate?: (date: Date) => void
  onReviewWeek?: (weekDate: Date) => void
  hideWeekends?: boolean
  isMiniCalendar?: boolean
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
                    hideWeekends={hideWeekends}
                    isMiniCalendar={isMiniCalendar}
                    onClick={() => onSelectDate?.(date)}
                  />
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Weekly Summaries Sidebar */}
      {!isMiniCalendar && (
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
      )}
    </div>
  )
}
