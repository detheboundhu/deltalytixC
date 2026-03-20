'use client'

import React from 'react'
import { WidgetCard } from '../widget-card'
import { CircularProgress } from '@/components/ui/circular-progress'
import { useTradeStatistics } from '@/hooks/use-trade-statistics'
import { Info } from '@phosphor-icons/react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface TradeWinRateProps {
  size?: string
}

const TradeWinRate = React.memo(function TradeWinRate({ size }: TradeWinRateProps) {
  const { winRate, nbWin, nbTrades } = useTradeStatistics()

  // Memoize color calculation
  const color = React.useMemo(() => {
    return winRate >= 50
      ? 'hsl(var(--chart-profit))'
      : 'hsl(var(--chart-loss))'
  }, [winRate])


  return (
    <WidgetCard isKpi>
      <div className="h-full flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[8px] uppercase font-black tracking-widest text-muted-foreground/60">
              Trade Win %
            </span>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-3 h-3 rounded-full bg-muted flex items-center justify-center cursor-help">
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={5} className="max-w-[220px]">
                  <p className="text-xs">Percentage of winning trades out of total trades. Excludes break-even trades from calculation.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="text-xl font-black font-mono text-foreground tracking-tighter">
            {winRate.toFixed(1)}%
          </span>
        </div>

        <div className="flex-shrink-0">
          <CircularProgress
            value={winRate}
            size={48}
            strokeWidth={5}
            color={color}
            showPercentage={false}
          />
        </div>
      </div>
    </WidgetCard>
  )
})

export default TradeWinRate
