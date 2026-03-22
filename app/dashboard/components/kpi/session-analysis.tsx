'use client'

import { WidgetCard } from '../widget-card'
import { useWidgetData } from '@/hooks/use-widget-data'
import { MarketSession } from '@/lib/time-utils'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/store/user-store'
import {
    Globe,
    Moon,
    Sun,
    Sunrise
} from "lucide-react"
import { useMemo } from 'react'

interface SessionAnalysisProps {
    size?: string
}

// Market sessions in NY time (for display metadata)
const SESSION_META: Record<MarketSession, { name: string; icon: any; color: string }> = {
    'New York': { name: 'New York', icon: Sun, color: 'text-amber-500' },
    'London': { name: 'London', icon: Sunrise, color: 'text-blue-500' },
    'Asia': { name: 'Asia', icon: Moon, color: 'text-purple-500' },
    'Outside Session': { name: 'Outside Session', icon: Globe, color: 'text-muted-foreground' }
}

export default function SessionAnalysis({ size }: SessionAnalysisProps) {
    const { data: sessionStats } = useWidgetData('sessionAnalysis')

    if (!sessionStats || Object.keys(sessionStats).length === 0) {
        return (
            <WidgetCard title="Session Analysis">
                <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">
                        No trade data available
                    </p>
                </div>
            </WidgetCard>
        )
    }

    const sessions = [
        { key: 'New York', ...SESSION_META['New York'], ...sessionStats['New York'] },
        { key: 'London', ...SESSION_META['London'], ...sessionStats['London'] },
        { key: 'Asia', ...SESSION_META['Asia'], ...sessionStats['Asia'] },
        { key: 'Outside Session', ...SESSION_META['Outside Session'], ...sessionStats['Outside Session'] }
    ]

    const bestSession = sessions.reduce((best, current) =>
        current.pnl > best.pnl ? current : best
        , sessions[0])

    return (
        <WidgetCard title="Session Analysis">
            <div className="space-y-3 h-full">
                {sessions.map(session => {
                    const Icon = session.icon
                    const winRate = session.trades > 0 ? (session.wins / session.trades * 100).toFixed(0) : 0
                    const isPositive = session.pnl >= 0
                    const isBest = session.key === bestSession.key && session.pnl > 0

                    return (
                        <div
                            key={session.key}
                            className={cn(
                                "flex items-center justify-between p-3 rounded-xl border",
                                isBest ? "bg-long/10 border-long/30" : "bg-muted/20 border-border/30"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className={cn("h-5 w-5", session.color)} />
                                <div>
                                    <p className="font-bold text-sm">{session.name}</p>
                                    <p className="text-[10px] text-muted-foreground/50 font-medium">
                                        {session.trades} trades · {winRate}% win
                                    </p>
                                </div>
                            </div>
                            <div className={cn(
                                "text-right font-black font-mono text-sm tracking-tighter",
                                isPositive ? "text-long" : "text-short"
                            )}>
                                {isPositive ? '+' : ''}${session.pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                    )
                })}

                {bestSession.pnl > 0 && (
                    <p className="text-[10px] text-muted-foreground/50 text-center pt-1 font-medium">
                        Best performance: {bestSession.name} session
                    </p>
                )}
            </div>
        </WidgetCard>
    )
}
