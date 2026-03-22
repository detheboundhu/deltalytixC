'use client'

import React, { useState, useMemo, useCallback } from "react"
import { format, addMonths, subMonths, isSameMonth } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { WidgetCard } from '../widget-card'
import { Button } from "@/components/ui/button"
import { CalendarData } from "@/app/dashboard/types/calendar"
import { useData } from "@/context/data-provider"
import MonthlyView from "./monthly-view"
import { BREAK_EVEN_THRESHOLD } from "@/lib/utils"

const formatCompact = (value: number) => {
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}k`
  return `$${value.toFixed(0)}`
}

interface MiniCalendarProps {
  calendarData: CalendarData;
}

function MiniCalendar({ calendarData }: MiniCalendarProps) {
  const { isLoading } = useData()
  const [currentDate, setCurrentDate] = useState(new Date())

  // Modals state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showWeeklyModal, setShowWeeklyModal] = useState(false)
  const [selectedWeekDate, setSelectedWeekDate] = useState<Date | null>(null)

  // Navigation
  const handlePrev = useCallback(() => setCurrentDate(prev => subMonths(prev, 1)), [])
  const handleNext = useCallback(() => setCurrentDate(prev => addMonths(prev, 1)), [])

  // Stats
  const displayTotal = useMemo(() => {
    let total = 0
    const currentMonthPrefix = format(currentDate, 'yyyy-MM')
    Object.entries(calendarData).forEach(([key, data]) => {
      if (key.startsWith(currentMonthPrefix)) {
        total += data.pnl
      }
    })
    return total
  }, [calendarData, currentDate])

  const isPositive = displayTotal >= 0

  const tradedDaysCount = useMemo(() => {
    let count = 0;
    const currentMonthPrefix = format(currentDate, 'yyyy-MM')
    Object.entries(calendarData).forEach(([key, data]) => {
      if (key.startsWith(currentMonthPrefix) && data.tradeNumber > 0) count++
    })
    return count;
  }, [calendarData, currentDate])

  return (
    <div className="w-full h-full">
      <WidgetCard noPadding className="overflow-hidden flex flex-col h-full">
        {/* Unified Header: Navigation + Stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2 px-4 py-3 border-b border-border/20 bg-muted/5 flex-shrink-0">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Navigation Group */}
            <div className="flex items-center gap-0.5 bg-muted/30 rounded-lg p-0.5 border border-border/30 font-bold shrink-0">
              <Button variant="ghost" size="icon" onClick={handlePrev} className="h-6 w-6 hover:bg-background" aria-label="Previous month">
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <div className="px-2 min-w-[90px] text-center">
                <span className="text-[11px] font-black capitalize tracking-tight">
                  {format(currentDate, 'MMM yyyy')}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleNext} className="h-6 w-6 hover:bg-background" aria-label="Next month">
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Button
              onClick={() => setCurrentDate(new Date())}
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-[10px] font-black bg-muted/20 hover:bg-muted border-border/40 transition-colors hidden sm:inline-flex"
            >
              This month
            </Button>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            <span className="text-[10px] font-bold text-muted-foreground mr-1">
              Monthly stats:
            </span>

            {/* Stats Badges */}
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
              <div className={
                "px-1.5 py-0.5 rounded border shadow-sm flex items-center " +
                (isPositive ? "bg-long/10 border-long/20 text-long" : "bg-short/10 border-short/20 text-short")
              }>
                {formatCompact(displayTotal)}
              </div>
              <div className="px-1.5 py-0.5 rounded bg-chart-4/10 border border-chart-4/20 text-chart-4 border-solid shadow-sm">
                {tradedDaysCount} d
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid - uses MonthlyView with hideWeekends */}
        <div className="flex-1 min-h-0 overflow-y-auto relative">
          <MonthlyView
            hideWeekends
            currentDate={currentDate}
            calendarData={calendarData}
            isMiniCalendar={true}
          />
        </div>
      </WidgetCard>
    </div>
  )
}

export default React.memo(MiniCalendar, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.calendarData) === JSON.stringify(nextProps.calendarData)
})
