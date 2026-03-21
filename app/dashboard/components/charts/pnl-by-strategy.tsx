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
import { cn, formatNumber, BREAK_EVEN_THRESHOLD } from "@/lib/utils"
import { WidgetSize } from '@/app/dashboard/types/dashboard'

// ============================================================================
// TYPES
// ============================================================================

interface PnLByStrategyProps {
  size?: WidgetSize
}

interface StrategyData {
  strategy: string
  pnl: number
  trades: number
  wins: number
  losses: number
  winRate: number
  avgPnl: number
  profitFactor: number
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

export default function PnLByStrategy({ size = 'small-long' }: PnLByStrategyProps) {
  // ---------------------------------------------------------------------------
  // DATA HOOKS (PRESERVED - DO NOT MODIFY)
  // ---------------------------------------------------------------------------
  const { formattedTrades } = useData()

  // ---------------------------------------------------------------------------
  // DATA PROCESSING (PRESERVED - DO NOT MODIFY)
  // ---------------------------------------------------------------------------
  const chartData = React.useMemo(() => {
    const { groupTradesByExecution } = require('@/lib/utils')
    const groupedTrades = groupTradesByExecution(formattedTrades)

    const strategyMap: Record<string, { pnl: number; trades: number; wins: number; losses: number; grossWin: number; grossLoss: number }> = {}

    groupedTrades.forEach((trade: any) => {
      const strategy = trade.tradingModel || 'No Strategy'

      if (!strategyMap[strategy]) {
        strategyMap[strategy] = { pnl: 0, trades: 0, wins: 0, losses: 0, grossWin: 0, grossLoss: 0 }
      }

      const netPnl = (trade.pnl || 0) - (trade.commission || 0)
      strategyMap[strategy].pnl += netPnl
      strategyMap[strategy].trades += 1

      if (netPnl > BREAK_EVEN_THRESHOLD) {
        strategyMap[strategy].wins += 1
        strategyMap[strategy].grossWin += netPnl
      } else if (netPnl < -BREAK_EVEN_THRESHOLD) {
        strategyMap[strategy].losses += 1
        strategyMap[strategy].grossLoss += Math.abs(netPnl)
      }
    })

    const data: StrategyData[] = Object.entries(strategyMap).map(([strategy, stats]) => {
      const tradableCount = stats.wins + stats.losses
      const winRate = tradableCount > 0 ? (stats.wins / tradableCount) * 100 : 0
      const avgPnl = stats.trades > 0 ? stats.pnl / stats.trades : 0
      const profitFactor = stats.grossLoss > 0 ? stats.grossWin / stats.grossLoss : stats.grossWin > 0 ? 999 : 0

      return {
        strategy,
        pnl: stats.pnl,
        trades: stats.trades,
        wins: stats.wins,
        losses: stats.losses,
        winRate,
        avgPnl,
        profitFactor,
      }
    })

    return data.sort((a, b) => b.pnl - a.pnl)
  }, [formattedTrades])

  // ---------------------------------------------------------------------------
  // SIZE-RESPONSIVE VALUES
  // ---------------------------------------------------------------------------
  const isCompact = size === 'small' || size === 'small-long'

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <WidgetCard title="P/L by Strategy">
      <ResponsiveContainer width="100%" height="100%">
            <AnyBarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
              barGap={4}
            >
              {/* Subtle Grid - Vertical Only (since horizontal chart) */}
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={COLORS.grid}
                strokeOpacity={CHART_CONFIG.gridOpacity}
                horizontal={false}
              />

              {/* X Axis - Currency Values */}
              <XAxis
                type="number"
                tickFormatter={formatAxisValue}
                stroke={COLORS.axis}
                fontSize={isCompact ? 10 : 11}
                tickLine={false}
                axisLine={false}
              />

              {/* Y Axis - Strategy Names */}
              <YAxis
                type="category"
                dataKey="strategy"
                stroke={COLORS.axis}
                fontSize={isCompact ? 9 : 10}
                tickLine={false}
                axisLine={false}
                width={80}
                tickFormatter={(value) => value.length > 12 ? value.substring(0, 10) + '...' : value}
              />

              {/* Zero Reference Line */}
              <ReferenceLine
                x={0}
                stroke={COLORS.axis}
                strokeDasharray="3 3"
                strokeOpacity={CHART_CONFIG.referenceLineOpacity}
              />

              {/* Tooltip */}
              <RechartsTooltip
                content={<SharedChartTooltip />}
                cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
              />

              {/* Bars with Rounded Ends */}
              <Bar
                dataKey="pnl"
                radius={[0, 4, 4, 0]}
                maxBarSize={40}
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
