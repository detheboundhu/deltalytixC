import { NextRequest, NextResponse } from 'next/server'
import { GET as getTrades } from '@/app/api/v1/trades/route'
import {
  calculateDayOfWeekPerformance,
  calculateOutcomeDistribution,
  calculateEquityCurve,
  calculateNetDailyPnl,
  calculateDailyCumulativePnl,
  calculateAccountBalanceChart
} from '@/lib/dashboard-math'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/server/auth'

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type')
  
  if (!type) {
    return NextResponse.json({ error: 'Missing widget type' }, { status: 400 })
  }

  // Optimize upstream trades query to skip stats and calendar math
  request.nextUrl.searchParams.set('includeStats', 'false')
  request.nextUrl.searchParams.set('includeCalendar', 'false')

  // Fetch filtered trades using the existing robust trades API
  const tradesResponse = await getTrades(request)
  if (tradesResponse.status !== 200) {
    return tradesResponse
  }

  const data = await tradesResponse.json()
  const trades = data.trades || []

  // Route to the appropriate math function
  let result
  switch (type) {
    case 'dayOfWeekPerformance':
      result = calculateDayOfWeekPerformance(trades)
      break
    case 'outcomeDistribution':
      result = calculateOutcomeDistribution(trades)
      break
    case 'equityCurve':
      result = calculateEquityCurve(trades)
      break
    case 'netDailyPnl':
      result = calculateNetDailyPnl(trades)
      break
    case 'dailyCumulativePnl':
      result = calculateDailyCumulativePnl(trades)
      break
    case 'accountBalanceChart':
      // Fetch user's active accounts to calculate absolute balance
      const authUserId = await getUserId()
      let activeAccounts = []
      if (authUserId) {
        const userLookup = await prisma.user.findUnique({
          where: { auth_user_id: authUserId },
          select: { id: true }
        })
        if (userLookup) {
          activeAccounts = await prisma.account.findMany({
            where: { userId: userLookup.id, isArchived: false },
            select: { startingBalance: true }
          }) as any[]
        }
      }
      result = calculateAccountBalanceChart(trades, activeAccounts)
      break
    default:
      return NextResponse.json({ error: 'Unknown widget type' }, { status: 400 })
  }

  return NextResponse.json(result)
}
