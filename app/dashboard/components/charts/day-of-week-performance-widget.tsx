'use client'

import React, { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useData } from '@/context/data-provider'
import { WidgetCard, ChartTooltip, CHART_COLORS } from '../widget-card'
import { BREAK_EVEN_THRESHOLD } from '@/lib/utils'
import { format, getDay } from 'date-fns'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function DayOfWeekPerformanceWidget() {
  const { formattedTrades } = useData()

  const chartData = useMemo(() => {
    if (!formattedTrades || formattedTrades.length === 0) return []

    const dayMap: Record<number, { totalPnl: number; wins: number; losses: number; total: number }> = {}

    // Initialize all days
    for (let i = 0; i < 7; i++) {
      dayMap[i] = { totalPnl: 0, wins: 0, losses: 0, total: 0 }
    }

    formattedTrades.forEach((trade) => {
      if (!trade.entryDate) return
      const dayOfWeek = getDay(new Date(trade.entryDate))
      const netPnl = (trade.pnl || 0) + (trade.commission || 0)
      dayMap[dayOfWeek].totalPnl += netPnl
      dayMap[dayOfWeek].total++
      if (netPnl > BREAK_EVEN_THRESHOLD) dayMap[dayOfWeek].wins++
      else if (netPnl < -BREAK_EVEN_THRESHOLD) dayMap[dayOfWeek].losses++
    })

    // Return Mon-Fri only (skip Sat/Sun if no trades)
    return [1, 2, 3, 4, 5, 0, 6]
      .map((day) => ({
        day: DAY_NAMES[day],
        pnl: parseFloat(dayMap[day].totalPnl.toFixed(2)),
        wins: dayMap[day].wins,
        losses: dayMap[day].losses,
        total: dayMap[day].total,
      }))
      .filter((d) => d.total > 0)
  }, [formattedTrades])

  if (chartData.length === 0) {
    return (
      <WidgetCard title="Performance by Day of Week">
        <div className="flex items-center justify-center h-full text-muted-foreground/50 text-sm">
          No trade data available
        </div>
      </WidgetCard>
    )
  }

  return (
    <WidgetCard title="Performance by Day of Week">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.15)" vertical={false} />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 700 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`}
            width={50}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const data = payload[0].payload
              return (
                <div className="bg-card border border-border p-3 rounded-lg shadow-md">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground/70 mb-2">{label}</p>
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="text-xs font-medium">Net P&L:</span>
                    <span className={`text-xs font-mono font-bold ${data.pnl >= 0 ? 'text-long' : 'text-short'}`}>
                      ${data.pnl.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="text-xs font-medium text-muted-foreground">Trades:</span>
                    <span className="text-xs font-mono font-bold">{data.total}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-medium text-muted-foreground">W/L:</span>
                    <span className="text-xs font-mono font-bold">{data.wins}/{data.losses}</span>
                  </div>
                </div>
              )
            }}
          />
          <Bar dataKey="pnl" radius={[4, 4, 0, 0]} name="Net P&L">
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.pnl >= 0 ? CHART_COLORS.bullish : CHART_COLORS.bearish}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </WidgetCard>
  )
}
