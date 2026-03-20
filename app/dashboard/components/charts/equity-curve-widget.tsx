'use client'

import React, { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useData } from '@/context/data-provider'
import { WidgetCard, ChartTooltip, CHART_COLORS } from '../widget-card'
import { format } from 'date-fns'

export default function EquityCurveWidget() {
  const { formattedTrades } = useData()

  const chartData = useMemo(() => {
    if (!formattedTrades || formattedTrades.length === 0) return []

    const sorted = [...formattedTrades].sort(
      (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
    )

    let cumulative = 0
    return sorted.map((trade) => {
      const netPnl = (trade.pnl || 0) + (trade.commission || 0)
      cumulative += netPnl
      return {
        date: format(new Date(trade.entryDate), 'MMM dd'),
        equity: parseFloat(cumulative.toFixed(2)),
      }
    })
  }, [formattedTrades])

  if (chartData.length === 0) {
    return (
      <WidgetCard title="Equity Curve">
        <div className="flex items-center justify-center h-full text-muted-foreground/50 text-sm">
          No trade data available
        </div>
      </WidgetCard>
    )
  }

  const isPositive = chartData[chartData.length - 1]?.equity >= 0

  return (
    <WidgetCard title="Cumulative Equity Curve">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isPositive ? CHART_COLORS.bullish : CHART_COLORS.bearish} stopOpacity={0.3} />
              <stop offset="95%" stopColor={isPositive ? CHART_COLORS.bullish : CHART_COLORS.bearish} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.15)" vertical={false} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
            interval="preserveStartEnd"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`}
            width={50}
          />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="equity"
            stroke={isPositive ? CHART_COLORS.bullish : CHART_COLORS.bearish}
            strokeWidth={2}
            fill="url(#equityGradient)"
            name="Equity"
          />
        </AreaChart>
      </ResponsiveContainer>
    </WidgetCard>
  )
}
