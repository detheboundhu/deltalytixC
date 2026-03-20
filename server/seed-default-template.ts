'use server'

import { prisma } from '@/lib/prisma'
import { getUserId } from './auth-utils'

const DEFAULT_LAYOUT = [
  // Row 0: KPI Widgets (5 slots)
  { i: 'kpi-1', type: 'accountBalancePnl', size: 'kpi', x: 0, y: 0, w: 1, h: 1 },
  { i: 'kpi-2', type: 'tradeWinRate', size: 'kpi', x: 1, y: 0, w: 1, h: 1 },
  { i: 'kpi-3', type: 'dayWinRate', size: 'kpi', x: 2, y: 0, w: 1, h: 1 },
  { i: 'kpi-4', type: 'profitFactor', size: 'kpi', x: 3, y: 0, w: 1, h: 1 },
  { i: 'kpi-5', type: 'avgWinLoss', size: 'kpi', x: 4, y: 0, w: 1, h: 1 },
  // Row 1: Equity Curve + Outcome Distribution
  { i: 'equity-curve', type: 'equityCurve', size: 'large', x: 0, y: 1, w: 8, h: 4 },
  { i: 'outcome-dist', type: 'outcomeDistribution', size: 'medium', x: 8, y: 1, w: 4, h: 4 },
  // Row 2: Recent Trades + Mini Calendar
  { i: 'recent-trades', type: 'recentTrades', size: 'small', x: 0, y: 5, w: 4, h: 4 },
  { i: 'mini-calendar', type: 'calendarMini', size: 'large', x: 4, y: 5, w: 8, h: 4 },
  // Row 3: Charts
  { i: 'net-daily-pnl', type: 'netDailyPnL', size: 'small-long', x: 0, y: 9, w: 4, h: 4 },
  { i: 'daily-cumulative-pnl', type: 'dailyCumulativePnL', size: 'small-long', x: 4, y: 9, w: 4, h: 4 },
  { i: 'account-balance', type: 'accountBalanceChart', size: 'small-long', x: 8, y: 9, w: 4, h: 4 },
  // Row 4: Day of Week + Weekday PnL
  { i: 'day-of-week', type: 'dayOfWeekPerformance', size: 'medium', x: 0, y: 13, w: 6, h: 4 },
  { i: 'weekday-pnl', type: 'weekdayPnL', size: 'small-long', x: 6, y: 13, w: 6, h: 4 },
  // Row 5: More Charts
  { i: 'trade-duration', type: 'tradeDurationPerformance', size: 'small-long', x: 0, y: 17, w: 4, h: 4 },
  { i: 'pnl-by-strategy', type: 'pnlByStrategy', size: 'small-long', x: 4, y: 17, w: 4, h: 4 },
  { i: 'pnl-by-instrument', type: 'pnlByInstrument', size: 'small-long', x: 8, y: 17, w: 4, h: 4 },
  // Row 6: Performance/Analysis
  { i: 'performance-score', type: 'performanceScore', size: 'small-long', x: 0, y: 21, w: 4, h: 4 },
  { i: 'win-rate-by-strategy', type: 'winRateByStrategy', size: 'small-long', x: 4, y: 21, w: 4, h: 4 },
  { i: 'session-analysis', type: 'sessionAnalysis', size: 'medium', x: 8, y: 21, w: 4, h: 4 },
  // Row 7: Goals + Streak
  { i: 'goals-risk', type: 'goalsRiskCommandCenter', size: 'large', x: 0, y: 25, w: 6, h: 4 },
  { i: 'current-streak', type: 'currentStreak', size: 'kpi', x: 6, y: 25, w: 6, h: 4 },
  // Row 8: Full Calendar
  { i: 'calendar-advanced', type: 'calendarAdvanced', size: 'extra-large', x: 0, y: 29, w: 12, h: 7 },
]

/**
 * Ensure the current user has a default template
 * Called on first dashboard load
 */
export async function ensureDefaultTemplate() {
  try {
    const userId = await getUserId()

    // Ensure user exists before creating template
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })

    if (!userExists) {
      return // User doesn't exist yet, skip template creation
    }

    // Check if user has any templates
    const existingTemplates = await prisma.dashboardTemplate.findMany({
      where: { userId },
    })

    if (existingTemplates.length === 0) {
      // Create default template
      await prisma.dashboardTemplate.create({
        data: {
          id: crypto.randomUUID(),
          updatedAt: new Date(),
          userId,
          name: 'Default',
          isDefault: true,
          isActive: true,
          layout: DEFAULT_LAYOUT,
        },
      })
    } else {
      // Ensure there's an active template
      const hasActive = existingTemplates.some(t => t.isActive)
      if (!hasActive) {
        const defaultTemplate = existingTemplates.find(t => t.isDefault) || existingTemplates[0]
        await prisma.dashboardTemplate.update({
          where: { id: defaultTemplate.id },
          data: { isActive: true },
        })
      }
    }
  } catch (error) {
    // Template creation failed, continue without it
  }
}
