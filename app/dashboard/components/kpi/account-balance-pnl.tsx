'use client'

import React from 'react'
import { WidgetCard } from '../widget-card'
import { useData } from '@/context/data-provider'
import { useAccounts } from '@/hooks/use-accounts'
import { useTradeStatistics } from '@/hooks/use-trade-statistics'
import { cn } from '@/lib/utils'
import { Info } from "@phosphor-icons/react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { calculateBalanceInfo } from '@/lib/utils/balance-calculator'

interface AccountBalancePnlProps {
  size?: string
}

const AccountBalancePnl = React.memo(function AccountBalancePnl({ size }: AccountBalancePnlProps) {
  const { accountNumbers, formattedTrades } = useData()
  const { accounts } = useAccounts()

  // Filter accounts based on selection
  const filteredAccounts = React.useMemo(() => {
    if (!accounts || !Array.isArray(accounts) || accounts.length === 0) return []

    // If no accounts selected (or explicit "all accounts" mode where accountNumbers is empty/null), return ALL accounts
    if (!accountNumbers || accountNumbers.length === 0) {
      return accounts
    }

    // Filter to selected accounts by matching account number (phaseId) ONLY
    return accounts.filter(acc => accountNumbers.includes(acc.number))
  }, [accounts, accountNumbers])

  // USE UNIFIED CALCULATOR - Single source of truth for all balance calculations
  // This replaces the old custom logic (lines 39-71) with centralized, tested functions
  const balanceInfo = React.useMemo(() => {
    return calculateBalanceInfo(filteredAccounts, formattedTrades)
  }, [filteredAccounts, formattedTrades])

  const totalBalance = balanceInfo.currentBalance
  const grossPnl = balanceInfo.totalPnL
  const totalCommissions = Math.abs(balanceInfo.totalCommissions)
  const netPnl = balanceInfo.netPnL

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatCompactCurrency = (amount: number) => {
    if (Math.abs(amount) >= 1000) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        minimumFractionDigits: 2,
      }).format(amount)
    }
    return formatCurrency(amount)
  }

  return (
    <WidgetCard isKpi>
      <div className="h-full flex flex-col justify-center gap-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] uppercase font-black tracking-widest text-muted-foreground/60">
            Account Balance & P&L
          </span>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-3 h-3 rounded-full bg-muted flex items-center justify-center cursor-help flex-shrink-0">
                  <Info weight="light" className="h-3 w-3 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={5} className="max-w-[200px]">
                <p className="text-xs">
                  {accountNumbers && accountNumbers.length > 0
                    ? `Balance for ${accountNumbers.length} selected account${accountNumbers.length > 1 ? 's' : ''} including trading fees.`
                    : 'Current total balance across all accounts including trading fees.'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="text-xl font-black font-mono text-foreground tracking-tighter">
          {formatCompactCurrency(totalBalance)}
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-3 text-[10px]">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground/50">P&L:</span>
              <span className={cn(
                "font-bold font-mono",
                grossPnl >= 0 ? "text-long" : "text-short"
              )}>
                {formatCompactCurrency(grossPnl)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground/50">Fees:</span>
              <span className="font-bold font-mono text-warning">
                -{formatCompactCurrency(totalCommissions)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            <span className="text-muted-foreground/50">Net:</span>
            <span className={cn(
              "font-bold font-mono",
              netPnl >= 0 ? "text-long" : "text-short"
            )}>
              {formatCompactCurrency(netPnl)}
            </span>
          </div>
        </div>
      </div>
    </WidgetCard>
  )
})

export default AccountBalancePnl
