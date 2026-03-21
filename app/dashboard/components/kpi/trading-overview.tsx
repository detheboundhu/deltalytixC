'use client'

import * as React from 'react'
import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { WidgetCard } from '../widget-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useData } from '@/context/data-provider'
import {
  Target,
  TrendingUp,
  TrendingDown,
  Flame,
  Snowflake,
  Settings as SettingsIcon,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { startOfMonth, endOfMonth, parseISO, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { WidgetSize } from '@/app/dashboard/types/dashboard'

interface TradingOverviewProps {
  size?: WidgetSize
}

const DEFAULT_GOALS = {
  monthlyTrades: 20,
  winRate: 55,
  weeklyPnl: 250,
}

/** Slim progress bar — replaces the bordered circular rings */
function ProgressBar({ progress, color, label, detail }: {
  progress: number
  color: string
  label: string
  detail: string
}) {
  const clamped = Math.min(100, Math.max(0, progress))

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span className="text-[10px] font-mono text-muted-foreground">{detail}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${clamped}%`,
            backgroundColor: clamped >= 100 ? 'hsl(var(--chart-profit))' : color,
          }}
        />
      </div>
    </div>
  )
}

/** Streak calc — combined from old current-streak.tsx */
function calculateStreaks(trades: any[]) {
  if (!trades?.length) {
    return { currentStreak: 0, isWinning: true, longestWinStreak: 0, longestLoseStreak: 0 }
  }

  const sorted = [...trades].sort((a, b) => {
    const dateA = a.entryDate ? new Date(a.entryDate).getTime() : 0
    const dateB = b.entryDate ? new Date(b.entryDate).getTime() : 0
    return dateB - dateA
  })

  let currentStreak = 0
  const firstResult = (sorted[0].pnl || 0) > 0
  const isWinning = firstResult

  for (const trade of sorted) {
    if (((trade.pnl || 0) > 0) === firstResult) currentStreak++
    else break
  }

  const chronological = [...trades].sort((a, b) => {
    const dateA = a.entryDate ? new Date(a.entryDate).getTime() : 0
    const dateB = b.entryDate ? new Date(b.entryDate).getTime() : 0
    return dateA - dateB
  })

  let longestWinStreak = 0, longestLoseStreak = 0, tempStreak = 0
  let lastWasWin: boolean | null = null

  for (const trade of chronological) {
    const isWin = (trade.pnl || 0) > 0
    if (lastWasWin === null) { tempStreak = 1; lastWasWin = isWin }
    else if (isWin === lastWasWin) { tempStreak++ }
    else {
      if (lastWasWin) longestWinStreak = Math.max(longestWinStreak, tempStreak)
      else longestLoseStreak = Math.max(longestLoseStreak, tempStreak)
      tempStreak = 1; lastWasWin = isWin
    }
  }
  if (lastWasWin) longestWinStreak = Math.max(longestWinStreak, tempStreak)
  else if (lastWasWin === false) longestLoseStreak = Math.max(longestLoseStreak, tempStreak)

  return { currentStreak, isWinning, longestWinStreak, longestLoseStreak }
}

export default function TradingOverview({ size = 'large' }: TradingOverviewProps) {
  const { formattedTrades } = useData()
  const queryClient = useQueryClient()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [tempTargets, setTempTargets] = useState(DEFAULT_GOALS)
  const [isSaving, setIsSaving] = useState(false)

  const { data: goalTargets = DEFAULT_GOALS } = useQuery({
    queryKey: ['user-goals'],
    queryFn: async () => {
      const res = await fetch('/api/user/goals')
      if (!res.ok) return DEFAULT_GOALS
      const data = await res.json()
      return data.goals || DEFAULT_GOALS
    },
    staleTime: 5 * 60 * 1000,
  })

  useMemo(() => { setTempTargets(goalTargets) }, [goalTargets])

  const saveGoals = async () => {
    try {
      setIsSaving(true)
      const res = await fetch('/api/user/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempTargets),
      })
      if (res.ok) {
        const data = await res.json()
        queryClient.setQueryData(['user-goals'], data.goals)
        setIsSettingsOpen(false)
      }
    } catch (e) {
      console.error('Failed to save goals', e)
    } finally {
      setIsSaving(false)
    }
  }

  // Stats
  const currentStats = useMemo(() => {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

    const monthTrades = (formattedTrades || []).filter(t => {
      if (!t.entryDate) return false
      return isWithinInterval(parseISO(t.entryDate), { start: monthStart, end: monthEnd })
    })

    const weekTrades = (formattedTrades || []).filter(t => {
      if (!t.entryDate) return false
      return isWithinInterval(parseISO(t.entryDate), { start: weekStart, end: weekEnd })
    })

    const monthWins = monthTrades.filter(t => (t.pnl || 0) > 0).length
    const weekPnL = weekTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)

    return { monthTrades: monthTrades.length, monthWinRate: monthTrades.length > 0 ? (monthWins / monthTrades.length) * 100 : 0, weekPnL }
  }, [formattedTrades])

  // Risk
  const riskStats = useMemo(() => {
    if (!formattedTrades?.length) return { maxDrawdown: 0, largestLoss: 0, avgLoss: 0, lossStreak: 0 }

    let peak = 0, maxDrawdown = 0, runningTotal = 0
    const sorted = [...formattedTrades].sort((a, b) => {
      return (a.entryDate ? new Date(a.entryDate).getTime() : 0) - (b.entryDate ? new Date(b.entryDate).getTime() : 0)
    })

    sorted.forEach(trade => {
      runningTotal += trade.pnl || 0
      if (runningTotal > peak) peak = runningTotal
      const dd = peak - runningTotal
      if (dd > maxDrawdown) maxDrawdown = dd
    })

    const losses = formattedTrades.filter(t => (t.pnl || 0) < 0)
    const largestLoss = Math.abs(Math.min(...losses.map(t => t.pnl || 0), 0))
    const avgLoss = losses.length > 0 ? losses.reduce((sum, t) => sum + Math.abs(t.pnl || 0), 0) / losses.length : 0

    let lossStreak = 0
    for (let i = sorted.length - 1; i >= 0; i--) {
      if ((sorted[i].pnl || 0) < 0) lossStreak++
      else break
    }

    return { maxDrawdown, largestLoss, avgLoss, lossStreak }
  }, [formattedTrades])

  // Streak
  const streakData = useMemo(() => calculateStreaks(formattedTrades || []), [formattedTrades])

  const hasData = formattedTrades && formattedTrades.length > 0

  const goals = [
    {
      label: 'Monthly Trades',
      target: goalTargets.monthlyTrades,
      current: currentStats.monthTrades,
      color: 'hsl(var(--chart-3))',
      detail: `${currentStats.monthTrades} / ${goalTargets.monthlyTrades}`,
    },
    {
      label: 'Win Rate',
      target: goalTargets.winRate,
      current: currentStats.monthWinRate,
      color: 'hsl(var(--chart-1))',
      detail: `${currentStats.monthWinRate.toFixed(0)}% / ${goalTargets.winRate}%`,
    },
    {
      label: 'Weekly P&L',
      target: goalTargets.weeklyPnl,
      current: Math.max(0, currentStats.weekPnL),
      color: 'hsl(var(--chart-4))',
      detail: `$${currentStats.weekPnL.toFixed(0)} / $${goalTargets.weeklyPnl}`,
    },
  ]

  const settingsButton = (
    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <SettingsIcon className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Your Goals</DialogTitle>
          <DialogDescription>Customize your trading targets</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="monthlyTrades">Monthly Trades Target</Label>
            <Input id="monthlyTrades" type="number" value={tempTargets.monthlyTrades} onChange={(e) => setTempTargets(prev => ({ ...prev, monthlyTrades: parseInt(e.target.value) || 0 }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="winRate">Win Rate Target (%)</Label>
            <Input id="winRate" type="number" value={tempTargets.winRate} onChange={(e) => setTempTargets(prev => ({ ...prev, winRate: parseInt(e.target.value) || 0 }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weeklyPnl">Weekly P&L Target ($)</Label>
            <Input id="weeklyPnl" type="number" value={tempTargets.weeklyPnl} onChange={(e) => setTempTargets(prev => ({ ...prev, weeklyPnl: parseInt(e.target.value) || 0 }))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
          <Button onClick={saveGoals} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Goals'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <WidgetCard title="Trading Overview" headerRight={settingsButton}>
      {hasData ? (
        <div className="h-full flex flex-col gap-5">
          {/* Top: Streak + Risk — flowing inline metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Current Streak */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                {streakData.isWinning ? (
                  <Flame className="h-3.5 w-3.5 text-chart-4" />
                ) : (
                  <Snowflake className="h-3.5 w-3.5 text-chart-1" />
                )}
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Streak</span>
              </div>
              <p className={cn(
                "text-2xl font-bold tracking-tight font-mono",
                streakData.isWinning ? "text-long" : "text-short"
              )}>
                {streakData.currentStreak}
              </p>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-2.5 w-2.5 text-long" />
                  Best: {streakData.longestWinStreak}
                </span>
                <span className="flex items-center gap-1">
                  <TrendingDown className="h-2.5 w-2.5 text-short" />
                  Worst: {streakData.longestLoseStreak}
                </span>
              </div>
            </div>

            {/* Max Drawdown */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Max Drawdown</span>
              <p className={cn(
                "text-2xl font-bold tracking-tight font-mono",
                riskStats.maxDrawdown > 1000 ? "text-short" : riskStats.maxDrawdown > 500 ? "text-warning" : "text-foreground"
              )}>
                ${riskStats.maxDrawdown.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
            </div>

            {/* Largest Loss */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Largest Loss</span>
              <p className={cn(
                "text-2xl font-bold tracking-tight font-mono",
                riskStats.largestLoss > 500 ? "text-short" : "text-foreground"
              )}>
                ${riskStats.largestLoss.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
            </div>

            {/* Avg Loss */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Avg Loss</span>
              <p className="text-2xl font-bold tracking-tight font-mono text-foreground">
                ${riskStats.avgLoss.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          {/* Loss streak warning */}
          {riskStats.lossStreak >= 3 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/10 border border-warning/20">
              <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
              <p className="text-xs text-warning">
                Consider a break — {riskStats.lossStreak} consecutive losses
              </p>
            </div>
          )}

          {/* Bottom: Goals Progress — slim bars */}
          <div className="space-y-3 mt-auto">
            <div className="flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Goals Progress</span>
            </div>
            {goals.map((goal) => (
              <ProgressBar
                key={goal.label}
                progress={goal.target > 0 ? (goal.current / goal.target) * 100 : 0}
                color={goal.color}
                label={goal.label}
                detail={goal.detail}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <Target className="h-12 w-12 text-muted-foreground/20 mx-auto" />
            <p className="text-sm text-muted-foreground">No trading data available</p>
            <p className="text-xs text-muted-foreground/60">Import trades to see your overview</p>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
