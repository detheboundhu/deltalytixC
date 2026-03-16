/**
 * Prop Firm Account Statistics Calculator
 *
 * Computes per-account and aggregate analytics for all funded/challenge accounts.
 * All math runs server-side — no raw trade arrays sent to client.
 */

import { prisma } from '@/lib/prisma'
import { groupTradesByExecution } from '@/lib/utils'

// ============================================================
// TYPES
// ============================================================

export interface PropFirmAccountDTO {
  id: string
  masterAccountId: string
  propFirmName: string
  accountName: string
  accountSize: number
  evaluationType: string
  phaseNumber: number
  phaseStatus: string  // active | passed | failed | archived | pending | pending_approval
  masterStatus: string // active | funded | failed
  startDate: string
  endDate: string | null
  durationDays: number

  // Trade stats
  totalTrades: number
  tradingDaysActive: number
  winRate: string
  profitFactor: string
  expectancy: string

  // P&L
  totalNetPnL: number
  peakProfit: number
  maxDrawdown: number   // peak-to-trough in $
  maxDrawdownPct: string

  // Limits from phase config
  profitTargetPercent: number
  maxDrawdownPercent: number
  dailyDrawdownPercent: number

  // Breach info
  breachCount: number

  // Payouts
  totalPayouts: number
}

export interface PropFirmSummaryDTO {
  totalAccounts: number
  activeAccounts: number
  fundedAccounts: number
  failedAccounts: number
  passedPhases: number

  totalNetPnL: number
  totalPayoutsReceived: number
  totalBreaches: number

  bestAccount: string | null
  worstAccount: string | null

  accounts: PropFirmAccountDTO[]
}

// ============================================================
// CORE COMPUTATION
// ============================================================

export async function calculatePropFirmStatistics(
  userId: string
): Promise<PropFirmSummaryDTO> {
  // Fetch all master accounts with phases, trades, breaches, and payouts
  const masterAccounts = await prisma.masterAccount.findMany({
    where: { userId },
    include: {
      PhaseAccount: {
        include: {
          Trade: {
            select: {
              id: true,
              entryId: true,
              entryDate: true,
              closeDate: true,
              pnl: true,
              commission: true,
              quantity: true,
              entryPrice: true,
              stopLoss: true,
              instrument: true,
              symbol: true,
              side: true,
              timeInPosition: true,
              groupId: true,
            },
          },
          BreachRecord: {
            select: { id: true, breachType: true, breachAmount: true, breachTime: true },
          },
          Payout: {
            select: { amount: true, status: true },
          },
        },
        orderBy: { phaseNumber: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  const accounts: PropFirmAccountDTO[] = []
  let totalNetPnL = 0
  let totalPayoutsReceived = 0
  let totalBreaches = 0
  let bestPnL = -Infinity
  let worstPnL = Infinity
  let bestAccountName: string | null = null
  let worstAccountName: string | null = null

  let totalCount = 0
  let activeCount = 0
  let fundedCount = 0
  let failedCount = 0
  let passedPhaseCount = 0

  for (const master of masterAccounts) {
    totalCount++ // count by master account

    if (master.status === 'active') activeCount++
    else if (master.status === 'funded') fundedCount++
    else if (master.status === 'failed') failedCount++

    for (const phase of master.PhaseAccount) {
      if (phase.status === 'passed') passedPhaseCount++

      // Group partial trades for accurate per-trade metrics
      const rawTrades = phase.Trade as any[]
      const trades = groupTradesByExecution(rawTrades)

      // Single-pass metrics
      let cumulativePnL = 0
      let peakEquity = 0
      let maxDD = 0
      let wins = 0
      let losses = 0
      let totalGrossProfit = 0
      let totalGrossLoss = 0
      const tradeDates = new Set<string>()

      for (const t of trades) {
        const net = (t.pnl || 0) + (t.commission || 0)
        cumulativePnL += net

        if (t.entryDate) tradeDates.add(t.entryDate.slice(0, 10))

        if (net > 0) { wins++; totalGrossProfit += net }
        else if (net < 0) { losses++; totalGrossLoss += Math.abs(net) }

        if (cumulativePnL > peakEquity) peakEquity = cumulativePnL
        const dd = peakEquity - cumulativePnL
        if (dd > maxDD) maxDD = dd
      }

      const tradable = wins + losses
      const winRate = tradable > 0 ? ((wins / tradable) * 100).toFixed(1) : '0.0'
      const profitFactor = totalGrossLoss > 0
        ? (totalGrossProfit / totalGrossLoss).toFixed(2)
        : totalGrossProfit > 0 ? '99.00' : '0.00'
      const expectancy = trades.length > 0 ? (cumulativePnL / trades.length).toFixed(2) : '0.00'

      const maxDDPct = master.accountSize > 0
        ? ((maxDD / master.accountSize) * 100).toFixed(2)
        : '0.00'

      // Duration
      const start = new Date(phase.startDate)
      const end = phase.endDate ? new Date(phase.endDate) : new Date()
      const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))

      // Payouts (only 'paid' ones count as received)
      const paidPayouts = phase.Payout
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0)

      const breachCount = phase.BreachRecord.length

      const accountDisplayName = `${master.propFirmName} – ${master.accountName} P${phase.phaseNumber}`

      accounts.push({
        id: phase.id,
        masterAccountId: master.id,
        propFirmName: master.propFirmName,
        accountName: master.accountName,
        accountSize: master.accountSize,
        evaluationType: master.evaluationType,
        phaseNumber: phase.phaseNumber,
        phaseStatus: phase.status,
        masterStatus: master.status,
        startDate: phase.startDate.toISOString(),
        endDate: phase.endDate?.toISOString() ?? null,
        durationDays,
        totalTrades: trades.length,
        tradingDaysActive: tradeDates.size,
        winRate,
        profitFactor,
        expectancy,
        totalNetPnL: cumulativePnL,
        peakProfit: peakEquity,
        maxDrawdown: maxDD,
        maxDrawdownPct: maxDDPct,
        profitTargetPercent: phase.profitTargetPercent,
        maxDrawdownPercent: phase.maxDrawdownPercent,
        dailyDrawdownPercent: phase.dailyDrawdownPercent,
        breachCount,
        totalPayouts: paidPayouts,
      })

      totalNetPnL += cumulativePnL
      totalPayoutsReceived += paidPayouts
      totalBreaches += breachCount

      if (cumulativePnL > bestPnL) { bestPnL = cumulativePnL; bestAccountName = accountDisplayName }
      if (cumulativePnL < worstPnL) { worstPnL = cumulativePnL; worstAccountName = accountDisplayName }
    }
  }

  return {
    totalAccounts: totalCount,
    activeAccounts: activeCount,
    fundedAccounts: fundedCount,
    failedAccounts: failedCount,
    passedPhases: passedPhaseCount,
    totalNetPnL,
    totalPayoutsReceived,
    totalBreaches,
    bestAccount: bestAccountName,
    worstAccount: worstAccountName,
    accounts,
  }
}
