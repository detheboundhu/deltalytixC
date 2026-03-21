'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useWidgetData } from '@/hooks/use-widget-data'
import { WidgetCard, ChartTooltip, RECHARTS_COLORS } from '../widget-card'
import { useTheme } from '@/context/theme-provider'

export default function DayOfWeekPerformanceWidget() {
  const { data: chartData, isLoading } = useWidgetData('dayOfWeekPerformance')
  const { theme } = useTheme()
  const colors = theme === 'dark' ? RECHARTS_COLORS.dark : RECHARTS_COLORS.light

  if (isLoading) {
    return (
      <WidgetCard title="Performance by Day of Week">
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse w-full h-[150px] bg-muted/20 rounded-xl" />
        </div>
      </WidgetCard>
    )
  }

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
            {chartData.map((entry: any, index: number) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.pnl >= 0 ? colors.bullish : colors.bearish}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </WidgetCard>
  )
}
