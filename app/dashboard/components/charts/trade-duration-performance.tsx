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

interface TradeDurationPerformanceProps {
  size?: WidgetSize
}

interface DurationData {
  bucket: string
  pnl: number
  trades: number
  wins: number
  losses: number
  winRate: number
  avgPnl: number
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

const BUCKET_ORDER = [
  "< 1min",
  "1-5min",
  "5-15min",
  "15-30min",
  "30min-1hr",
  "1-2hr",
  "2-4hr",
  "4hr+"
] as const



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

function calculateDurationMinutes(entryTime: string, exitTime: string): number {
  const entry = new Date(entryTime).getTime()
  const exit = new Date(exitTime).getTime()
  return (exit - entry) / (1000 * 60)
}

function getDurationBucket(minutes: number): string {
  if (minutes < 1) return "< 1min"
  if (minutes < 5) return "1-5min"
  if (minutes < 15) return "5-15min"
  if (minutes < 30) return "15-30min"
  if (minutes < 60) return "30min-1hr"
  if (minutes < 120) return "1-2hr"
  if (minutes < 240) return "2-4hr"
  return "4hr+"
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TradeDurationPerformance({ size = 'small-long' }: TradeDurationPerformanceProps) {
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

    const durationMap: Record<string, { pnl: number; trades: number; wins: number; losses: number }> = {}

    BUCKET_ORDER.forEach(bucket => {
      durationMap[bucket] = { pnl: 0, trades: 0, wins: 0, losses: 0 }
    })

    groupedTrades.forEach((trade: any) => {
      if (trade.entryDate && trade.closeDate) {
        const durationMinutes = calculateDurationMinutes(trade.entryDate, trade.closeDate)
        const bucket = getDurationBucket(durationMinutes)

        const netPnL = trade.pnl - (trade.commission || 0)
        durationMap[bucket].pnl += netPnL
        durationMap[bucket].trades++

        if (netPnL > BREAK_EVEN_THRESHOLD) {
          durationMap[bucket].wins++
        } else if (netPnL < -BREAK_EVEN_THRESHOLD) {
          durationMap[bucket].losses++
        }
      }
    })

    return BUCKET_ORDER.map(bucket => {
      const data = durationMap[bucket]
      const winRate = data.trades > 0 ? (data.wins / data.trades) * 100 : 0
      const avgPnl = data.trades > 0 ? data.pnl / data.trades : 0
      const displayPnl = showAverage ? avgPnl : data.pnl

      return {
        bucket,
        pnl: displayPnl,
        trades: data.trades,
        wins: data.wins,
        losses: data.losses,
        winRate,
        avgPnl,
      }
    }).filter(item => item.trades > 0)
  }, [formattedTrades, showAverage])

  // ---------------------------------------------------------------------------
  // SIZE-RESPONSIVE VALUES
  // ---------------------------------------------------------------------------
  const isCompact = size === 'small' || size === 'small-long'

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <WidgetCard title="Duration Performance">
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

              {/* X Axis - Duration Buckets */}
              <XAxis
                dataKey="bucket"
                stroke={COLORS.axis}
                fontSize={isCompact ? 9 : 10}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                angle={-20}
                textAnchor="end"
                height={40}
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
                maxBarSize={50}
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
}
