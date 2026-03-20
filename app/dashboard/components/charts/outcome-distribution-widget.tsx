'use client'

import React, { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useData } from '@/context/data-provider'
import { WidgetCard, CHART_COLORS } from '../widget-card'
import { BREAK_EVEN_THRESHOLD } from '@/lib/utils'

export default function OutcomeDistributionWidget() {
  const { formattedTrades } = useData()

  const { data, totalTrades } = useMemo(() => {
    if (!formattedTrades || formattedTrades.length === 0) return { data: [], totalTrades: 0 }

    let wins = 0, losses = 0, breakeven = 0

    formattedTrades.forEach((trade) => {
      const netPnl = (trade.pnl || 0) + (trade.commission || 0)
      if (netPnl > BREAK_EVEN_THRESHOLD) wins++
      else if (netPnl < -BREAK_EVEN_THRESHOLD) losses++
      else breakeven++
    })

    return {
      data: [
        { name: 'Wins', value: wins, color: CHART_COLORS.bullish },
        { name: 'Losses', value: losses, color: CHART_COLORS.bearish },
        { name: 'Breakeven', value: breakeven, color: CHART_COLORS.muted },
      ].filter(d => d.value > 0),
      totalTrades: wins + losses + breakeven,
    }
  }, [formattedTrades])

  if (data.length === 0) {
    return (
      <WidgetCard title="Outcome Distribution">
        <div className="flex items-center justify-center h-full text-muted-foreground/50 text-sm">
          No trade data available
        </div>
      </WidgetCard>
    )
  }

  return (
    <WidgetCard title="Outcome Distribution">
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="relative w-full max-w-[200px] aspect-square">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="85%"
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const item = payload[0]
                  return (
                    <div className="bg-card border border-border p-2.5 rounded-lg shadow-md">
                      <div className="text-[10px] font-bold text-muted-foreground/70 mb-1">{item.name}</div>
                      <div className="text-sm font-mono font-black">{item.value} trades</div>
                      <div className="text-[10px] text-muted-foreground/50">
                        {((Number(item.value) / totalTrades) * 100).toFixed(1)}%
                      </div>
                    </div>
                  )
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-black font-mono tracking-tighter">{totalTrades}</span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/50">Trades</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-[10px] font-bold text-muted-foreground">
                {entry.name} ({entry.value})
              </span>
            </div>
          ))}
        </div>
      </div>
    </WidgetCard>
  )
}
