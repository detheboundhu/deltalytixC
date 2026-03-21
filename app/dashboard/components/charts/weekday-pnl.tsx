"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import {
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts"
import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { WidgetCard, ChartTooltip as SharedChartTooltip } from '../widget-card'
import { useData } from "@/context/data-provider"
import { cn, formatCurrency, formatNumber, BREAK_EVEN_THRESHOLD } from "@/lib/utils"
import { WidgetSize } from '@/app/dashboard/types/dashboard'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// ============================================================================
// TYPES
// ============================================================================

interface WeekdayPnLProps {
  size?: WidgetSize
}

interface WeekdayData {
  day: string
  dayName: string
  pnl: number
  trades: number
  wins: number
  losses: number
  winRate: number
}

const AnyBarChart = (RechartsPrimitive as any).BarChart as React.ComponentType<any>

// ============================================================================
// CONSTANTS - Tradezella Premium Styling
// ============================================================================

const COLORS = {
  profit: 'hsl(var(--chart-profit))',
  loss: 'hsl(var(--chart-loss))',
  grid: 'hsl(var(--border))',
  axis: 'hsl(var(--muted-foreground))'
} as const

const CHART_CONFIG = {
  gridOpacity: 0.25,
  barRadius: [4, 4, 0, 0] as [number, number, number, number],
  referenceLineOpacity: 0.4
} as const



// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatAxisValue(value: number): string {
  const absValue = Math.abs(value)
  if (absValue >= 1000000) {
    return `${value < 0 ? '-' : ''}$${formatNumber(absValue / 1000000, 1)}M`
  }
  if (absValue >= 1000) {
    return `${value < 0 ? '-' : ''}$${formatNumber(absValue / 1000, 1)}k`
  }
  return `${value < 0 ? '-' : ''}$${formatNumber(absValue, 0)}`
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const WeekdayPnL = React.memo(function WeekdayPnL({ size = 'small-long' }: WeekdayPnLProps) {
  // ---------------------------------------------------------------------------
  // DATA HOOKS (PRESERVED - DO NOT MODIFY)
  // ---------------------------------------------------------------------------
  const { formattedTrades } = useData()
  const [showAverage, setShowAverage] = React.useState(false)

  // ---------------------------------------------------------------------------
  // DATA PROCESSING (PRESERVED - DO NOT MODIFY)
  // ---------------------------------------------------------------------------
  const chartData = React.useMemo(() => {
    const { groupTradesByExecution } = require('@/lib/utils')
    const groupedTrades = groupTradesByExecution(formattedTrades)

    const weekdayMap: Record<number, { pnl: number; trades: number; wins: number; losses: number }> = {}

    groupedTrades.forEach((trade: any) => {
      const date = new Date(trade.entryDate)
      const dayOfWeek = date.getDay()

      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        if (!weekdayMap[dayOfWeek]) {
          weekdayMap[dayOfWeek] = { pnl: 0, trades: 0, wins: 0, losses: 0 }
        }

        const netPnL = trade.pnl - (trade.commission || 0)
        weekdayMap[dayOfWeek].pnl += netPnL
        weekdayMap[dayOfWeek].trades++

        if (netPnL > BREAK_EVEN_THRESHOLD) {
          weekdayMap[dayOfWeek].wins++
        } else if (netPnL < -BREAK_EVEN_THRESHOLD) {
          weekdayMap[dayOfWeek].losses++
        }
      }
    })

    const weekdays = [
      { day: '1', dayName: 'Monday' },
      { day: '2', dayName: 'Tuesday' },
      { day: '3', dayName: 'Wednesday' },
      { day: '4', dayName: 'Thursday' },
      { day: '5', dayName: 'Friday' },
    ]

    return weekdays.map(({ day, dayName }) => {
      const dayNum = parseInt(day)
      const data = weekdayMap[dayNum] || { pnl: 0, trades: 0, wins: 0, losses: 0 }
      const winRate = data.trades > 0 ? (data.wins / data.trades) * 100 : 0
      const displayPnl = showAverage && data.trades > 0 ? data.pnl / data.trades : data.pnl

      return {
        day,
        dayName,
        pnl: displayPnl,
        trades: data.trades,
        wins: data.wins,
        losses: data.losses,
        winRate,
      }
    })
  }, [formattedTrades, showAverage])

  // ---------------------------------------------------------------------------
  // SIZE-RESPONSIVE VALUES
  // ---------------------------------------------------------------------------
  const isCompact = size === 'small' || size === 'small-long'

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <WidgetCard title="Weekday P/L">
                  <ResponsiveContainer width="100%" height="100%">
            <AnyBarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
              barGap={4}
            >
              {/* Subtle Grid - Horizontal Only */}
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={COLORS.grid}
                strokeOpacity={CHART_CONFIG.gridOpacity}
                vertical={false}
              />

              {/* X Axis - Days */}
              <XAxis
                dataKey="dayName"
                tickFormatter={(value) => value.substring(0, 3)}
                stroke={COLORS.axis}
                fontSize={isCompact ? 10 : 11}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />

              {/* Y Axis - Currency */}
              <YAxis
                tickFormatter={formatAxisValue}
                stroke={COLORS.axis}
                fontSize={isCompact ? 10 : 11}
                tickLine={false}
                axisLine={false}
                width={50}
              />

              {/* Zero Reference Line */}
              <ReferenceLine
                y={0}
                stroke={COLORS.axis}
                strokeDasharray="3 3"
                strokeOpacity={CHART_CONFIG.referenceLineOpacity}
              />

              {/* Tooltip */}
              <RechartsTooltip
                content={<SharedChartTooltip />}
                cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
              />

              {/* Bars with Rounded Tops */}
              <Bar
                dataKey="pnl"
                radius={CHART_CONFIG.barRadius}
                maxBarSize={60}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.pnl > BREAK_EVEN_THRESHOLD ? COLORS.profit : entry.pnl < -BREAK_EVEN_THRESHOLD ? COLORS.loss : 'hsl(var(--muted-foreground)/0.4)'}
                  />
                ))}
              </Bar>
            </AnyBarChart>
          </ResponsiveContainer>
    </WidgetCard>
  )
})

export default WeekdayPnL