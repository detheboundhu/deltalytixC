'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface WidgetCardProps {
  children: React.ReactNode
  /** Widget title shown in the header */
  title?: string
  /** Tooltip description shown on hover next to title */
  tooltip?: string
  /** Optional right-side header content (icons, badges, etc.) */
  headerRight?: React.ReactNode
  /** Whether this is a KPI card (compact, no border-radius padding) */
  isKpi?: boolean
  /** Additional className */
  className?: string
  /** Override padding */
  noPadding?: boolean
}

/** Widget tooltip descriptions — centralized for consistency */
export const WIDGET_TOOLTIPS: Record<string, string> = {
  'Account Balance & P&L': 'Total account balance and cumulative profit/loss across selected accounts.',
  'Trade Win Rate': 'Percentage of winning trades out of total trades taken.',
  'Day Win Rate': 'Percentage of profitable trading days out of total trading days.',
  'Profit Factor': 'Ratio of gross profit to gross loss. Above 1.0 means profitable overall.',
  'Avg Win/Loss': 'Average profit on winning trades vs average loss on losing trades.',
  'Current Streak': 'Current consecutive winning or losing trade streak.',
  'Trading Overview': 'Goals progress, risk metrics, and streak data in one view.',
  'Weekly Tracker': "This week's P&L, trade count, win rate, and daily performance heat bar.",
  'Net Daily P&L': 'Daily profit/loss bars showing each day\'s trading result.',
  'Cumulative P&L': 'Running total P&L over time showing overall growth trajectory.',
  'Account Balance Chart': 'Account balance progression over time.',
  'Weekday P&L': 'P&L breakdown by day of week to identify best/worst trading days.',
  'Day of Week Performance': 'Performance metrics broken down by each weekday.',
  'Trade Duration': 'Performance analysis based on how long trades are held.',
  'P&L by Strategy': 'Profit/loss breakdown by your trading strategies.',
  'P&L by Instrument': 'Profit/loss breakdown by traded instruments/symbols.',
  'Win Rate by Strategy': 'Win rate comparison across different strategies.',
  'Performance Score': 'Composite score evaluating multiple aspects of trading performance.',
  'Session Analysis': 'Performance breakdown by market session (Asia, London, New York).',
  'Equity Curve': 'Cumulative equity progression over time.',
  'Outcome Distribution': 'Pie chart showing win/loss/breakeven trade distribution.',
  'Recent Trades': 'Most recent trades with key details.',
  'Calendar': 'Monthly calendar view with daily P&L color coding.',
}

/**
 * Shared widget wrapper — applies the reports page design language
 * to all dashboard widgets for visual consistency.
 */
export function WidgetCard({
  children,
  title,
  tooltip,
  headerRight,
  isKpi = false,
  className,
  noPadding = false,
}: WidgetCardProps) {
  // Auto-resolve tooltip from title if not explicitly passed
  const resolvedTooltip = tooltip || (title ? WIDGET_TOOLTIPS[title] : undefined)

  if (isKpi) {
    return (
      <div
        className={cn(
          'w-full h-full overflow-hidden',
          'bg-muted/10 border border-border/40 rounded-2xl',
          'p-4',
          className
        )}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'w-full h-full overflow-hidden flex flex-col',
        'bg-muted/10 border border-border/40 rounded-2xl',
        !noPadding && 'p-5',
        className
      )}
    >
      {title && (
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
              {title}
            </h3>
            {resolvedTooltip && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground/40 hover:text-muted-foreground cursor-help transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[220px] text-xs">
                    {resolvedTooltip}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {headerRight}
        </div>
      )}
      <div className="flex-1 min-h-0 w-full">
        {children}
      </div>
    </div>
  )
}

/**
 * Shared chart tooltip — matches the reports page tooltip design
 */
export function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-card border border-border p-3 rounded-lg shadow-md">
      <p className="text-[10px] uppercase font-bold text-muted-foreground/70 mb-2">
        {label}
      </p>
      {payload.map((entry: any, index: number) => (
        <div
          key={index}
          className="flex items-center justify-between gap-4 mb-1 border-b border-border/20 pb-1 last:border-0 last:pb-0 last:mb-0"
        >
          <span
            className="text-xs font-medium text-foreground capitalize"
            style={{ color: entry.color }}
          >
            {entry.name}:
          </span>
          <span className="text-xs font-mono font-bold">
            {typeof entry.value === 'number' && entry.value % 1 !== 0
              ? `$${entry.value.toFixed(2)}`
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * Standard chart color constants matching reports page.
 * CSS var strings for stylesheet usage.
 */
export const CHART_COLORS = {
  bullish: 'hsl(var(--chart-bullish))',
  bearish: 'hsl(var(--chart-bearish))',
  muted: 'hsl(220, 15%, 55%)',
} as const

/**
 * Resolved color values for Recharts SVG contexts where CSS variables
 * don't reliably work in fill/stroke attributes.
 * These match the CSS vars in globals.css.
 */
export const RECHARTS_COLORS = {
  light: {
    bullish: '#83b885',   // --chart-bullish: 123 27% 62%
    bearish: '#c4572a',   // --chart-bearish: 25 70% 45%
    muted: '#7b8494',     // neutral muted
  },
  dark: {
    bullish: '#83b885',   // same in dark
    bearish: '#c4572a',   // same in dark
    muted: '#7b8494',
  },
} as const
