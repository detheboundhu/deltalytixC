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
// Day Cell — exact match to reference images
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
        "relative flex flex-col items-center justify-center rounded-[6px] border transition-all duration-150 select-none group min-h-[50px] md:min-h-[70px]",
        !isMiniCalendar && "min-h-[85px] md:min-h-[100px] cursor-pointer",

        // No trades — dark neutral
        !hasTrades && isCurrentMonth && "bg-[#16181d] border-[#22252b] hover:border-[#333842]",

        // Profit — dark green
        hasTrades && isProfit && "bg-[#092a1a] border-[#14472a] hover:bg-[#0c3823] hover:border-[#1b5c37]",

        // Loss — dark red
        hasTrades && isLoss && "bg-[#3b1212] border-[#591c1c] hover:bg-[#4a1717] hover:border-[#732424]",

        // Breakeven
        hasTrades && isBreakEven && "bg-[#1f2229] border-[#2c313a]",

        // Not current month
        !isCurrentMonth && "opacity-20 pointer-events-none",

        // Today ring
        isTodayDate && isCurrentMonth && "ring-1 ring-primary ring-offset-0",
      )}
    >
      {/* Note Icon — top left */}
      {hasNotes && (
        <div className="absolute top-1.5 left-1.5 opacity-70">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </div>
      )}

      {/* Day number — top right  */}
      <span
        className={cn(
          "absolute top-1 right-1.5 font-semibold leading-none",
          isTodayDate
            ? "text-primary-foreground bg-primary rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px]"
            : "text-muted-foreground/60 text-[11px]",
        )}
      >
        {format(date, 'd')}
      </span>

      {/* Main Content Container */}
      <div className="flex flex-col items-center justify-center w-full px-1 mt-3">
        {/* P&L */}
        {hasTrades && visibleStats.pnl && (
          <div
            className={cn(
              "font-bold tracking-tight text-center",
              isMiniCalendar ? "text-[11px]" : "text-[14px] md:text-[16px]",
              isProfit ? "text-[#3ce07e]" : isLoss ? "text-[#ff4c4c]" : "text-white"
            )}
          >
            {dayData.pnl > 0 && !isMiniCalendar ? "" : ""}{isMiniCalendar ? (dayData.pnl > 0 ? "+" : "") : ""}{isMiniCalendar ? formatCompact(dayData.pnl) : (dayData.pnl < 0 ? `-$${Math.abs(dayData.pnl).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : `$${dayData.pnl.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`)}
          </div>
        )}

        {/* Trade Count */}
        {hasTrades && visibleStats.trades && (
          <span className={cn(
            "font-medium leading-none text-white/80",
            isMiniCalendar ? "text-[8px] mt-0.5" : "text-[10px] md:text-[11px] mt-0.5"
          )}>
            {dayData.tradeNumber} trade{dayData.tradeNumber !== 1 ? 's' : ''}
          </span>
        )}

        {/* Secondary Stats Row (R & WinRate) */}
        {hasTrades && !isMiniCalendar && (
          <div className="flex items-center justify-center gap-0.5 mt-1.5 w-full">
            {visibleStats.rMultiple && dayData.dailyRMultiple !== undefined && (
              <span className={cn(
                "text-[9px] font-medium opacity-80",
                isProfit ? "text-[#3ce07e]" : isLoss ? "text-[#ff4c4c]" : "text-white"
              )}>
                {dayData.dailyRMultiple > 0 ? '' : ''}{dayData.dailyRMultiple.toFixed(2)}R{visibleStats.winRate ? ',' : ''}
              </span>
            )}
            {visibleStats.winRate && (
              <span className={cn(
                "text-[9px] font-medium opacity-80 ml-0.5",
                isProfit ? "text-[#3ce07e]" : isLoss ? "text-[#ff4c4c]" : "text-white"
              )}>
                {winRateValue.toFixed(1)}%
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
})

// ============================================================================
// Weekly Summary Card — right sidebar (looks like TradeZella's weekly summary)
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
        "flex flex-col items-start justify-center rounded-[8px] border p-2.5 cursor-pointer transition-all hover:brightness-110 group min-h-[70px] xl:min-h-[85px]",
        stats.tradedDays === 0
          ? "bg-[#16181d] border-[#22252b]"
          : "bg-[#16181d] border-[#22252b]"
      )}
      onClick={() => onReviewWeek?.(weekDays[0])}
    >
      <span className="text-[11px] font-medium text-muted-foreground/80 mb-0.5">
        Week {weekIndex + 1}
      </span>
      <span
        className={cn(
          "text-sm md:text-base font-bold tracking-tight",
          stats.tradedDays === 0
            ? "text-white"
            : isPositive
              ? "text-[#3ce07e]"
              : "text-[#ff4c4c]",
        )}
      >
        {stats.tradedDays === 0 ? "$0" : (stats.pnl < 0 ? `-$${Math.abs(stats.pnl).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : `$${stats.pnl.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`)}
      </span>
      <div className={cn(
        "text-[9px] font-bold mt-1.5 px-1.5 py-0.5 rounded",
        "bg-primary/20 text-primary border border-primary/30"
      )}>
        {stats.tradedDays} day{stats.tradedDays !== 1 ? 's' : ''}
      </div>
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
    <div className="flex h-full w-full overflow-x-auto overflow-y-hidden">
      <div className={cn("flex flex-1 min-w-[700px] md:min-w-0 h-full", isMiniCalendar && "min-w-[400px]")}>
        {/* Main Calendar Grid */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Weekday Headers */}
          <div className={cn("grid gap-1 md:gap-1.5 px-2 md:px-3 pt-3 pb-1", hideWeekends ? "grid-cols-5" : "grid-cols-7")}>
            {displayWeekdays.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] md:text-[11px] font-semibold text-muted-foreground/80 capitalize"
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
          <div className="hidden lg:flex flex-col gap-1.5 w-[110px] xl:w-[125px] p-2 pl-0.5 border-l border-border/10 ml-1">
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
    </div>
  )
}
