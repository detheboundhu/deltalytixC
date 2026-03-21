import { Trade } from '@prisma/client'
import { format, getDay } from 'date-fns'
import { CHART_COLORS } from '@/app/dashboard/components/widget-card'
import { BREAK_EVEN_THRESHOLD } from '@/lib/utils'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Generate an aggregated map of daily PnL and trade counts
function getDailyAggregations(trades: Partial<Trade>[]) {
  const dailyMap: Record<string, { pnl: number; wins: number; losses: number; shortNumber: number; longNumber: number }> = {}

  trades.forEach(trade => {
    if (!trade.entryDate) return
    const dateStr = trade.entryDate.toString().split('T')[0]
    
    if (!dailyMap[dateStr]) {
      dailyMap[dateStr] = { pnl: 0, wins: 0, losses: 0, shortNumber: 0, longNumber: 0 }
    }

    const netPnl = Number(trade.pnl || 0) + Number(trade.commission || 0)
    dailyMap[dateStr].pnl += netPnl

    if (netPnl > BREAK_EVEN_THRESHOLD) dailyMap[dateStr].wins++
    else if (netPnl < -BREAK_EVEN_THRESHOLD) dailyMap[dateStr].losses++

    if (trade.side === 'SHORT') dailyMap[dateStr].shortNumber++
    if (trade.side === 'LONG') dailyMap[dateStr].longNumber++
  })

  return dailyMap
}

export function calculateDayOfWeekPerformance(trades: Partial<Trade>[]) {
  const dayMap: Record<number, { totalPnl: number; winPnl: number; lossPnl: number; wins: number; losses: number; total: number }> = {}

  for (let i = 0; i < 7; i++) {
    dayMap[i] = { totalPnl: 0, winPnl: 0, lossPnl: 0, wins: 0, losses: 0, total: 0 }
  }

  trades.forEach((trade) => {
    if (!trade.entryDate) return
    const dayOfWeek = getDay(new Date(trade.entryDate))
    const netPnl = Number(trade.pnl || 0) + Number(trade.commission || 0)
    
    dayMap[dayOfWeek].totalPnl += netPnl
    dayMap[dayOfWeek].total++
    if (netPnl > BREAK_EVEN_THRESHOLD) {
      dayMap[dayOfWeek].wins++
      dayMap[dayOfWeek].winPnl += netPnl
    } else if (netPnl < -BREAK_EVEN_THRESHOLD) {
      dayMap[dayOfWeek].losses++
      dayMap[dayOfWeek].lossPnl += Math.abs(netPnl)
    }
  })

  return [1, 2, 3, 4, 5, 0, 6]
    .map((day) => ({
      day: DAY_NAMES[day],
      pnl: parseFloat(dayMap[day].totalPnl.toFixed(2)),
      Win: parseFloat(dayMap[day].winPnl.toFixed(2)),
      Loss: parseFloat(dayMap[day].lossPnl.toFixed(2)),
      wins: dayMap[day].wins,
      losses: dayMap[day].losses,
      total: dayMap[day].total,
    }))
    .filter((d) => d.total > 0)
}

export function calculateOutcomeDistribution(trades: Partial<Trade>[]) {
  let wins = 0, losses = 0, breakeven = 0

  trades.forEach((trade) => {
    const netPnl = Number(trade.pnl || 0) + Number(trade.commission || 0)
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
}

export function calculateEquityCurve(trades: Partial<Trade>[]) {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.entryDate!).getTime() - new Date(b.entryDate!).getTime()
  )

  let cumulative = 0
  return sorted.map((trade) => {
    const netPnl = Number(trade.pnl || 0) + Number(trade.commission || 0)
    cumulative += netPnl
    return {
      date: format(new Date(trade.entryDate!), 'MMM dd'),
      equity: parseFloat(cumulative.toFixed(2)),
    }
  })
}

export function calculateNetDailyPnl(trades: Partial<Trade>[]) {
  const dailyMap = getDailyAggregations(trades)

  return Object.entries(dailyMap)
    .map(([date, values]) => ({
      date,
      pnl: parseFloat(values.pnl.toFixed(2)),
      shortNumber: values.shortNumber,
      longNumber: values.longNumber,
      wins: values.wins,
      losses: values.losses,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function calculateDailyCumulativePnl(trades: Partial<Trade>[]) {
  const dailyMap = getDailyAggregations(trades)
  let cumulative = 0

  return Object.entries(dailyMap)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([date, values]) => {
      cumulative += values.pnl
      return {
        date,
        dailyPnL: parseFloat(values.pnl.toFixed(2)),
        cumulativePnL: parseFloat(cumulative.toFixed(2)),
        trades: values.shortNumber + values.longNumber,
      }
    })
}

export function calculateAccountBalanceChart(trades: Partial<Trade>[], activeAccountsData?: any[]) {
  const dailyMap = getDailyAggregations(trades)
  
  let currentBalance = 0
  if (activeAccountsData && activeAccountsData.length > 0) {
    currentBalance = activeAccountsData.reduce((total, acc) => total + (acc.startingBalance || 0), 0)
  }

  const totalPnl = Object.values(dailyMap).reduce((sum, day) => sum + day.pnl, 0)
  const startingBalance = currentBalance - totalPnl

  let rollingBalance = startingBalance
  return Object.entries(dailyMap)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([date, values]) => {
      const prevBalance = rollingBalance
      rollingBalance += values.pnl
      return {
        date,
        balance: parseFloat(rollingBalance.toFixed(2)),
        change: parseFloat(values.pnl.toFixed(2)),
        changePercent: prevBalance !== 0 ? (values.pnl / prevBalance) * 100 : 0,
        trades: values.shortNumber + values.longNumber,
        wins: values.wins,
        losses: values.losses,
        hasActivity: true
      }
    })
}
