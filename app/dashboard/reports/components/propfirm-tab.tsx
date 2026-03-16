'use client'

import { usePropFirmStats } from '@/hooks/use-propfirm-stats'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Trophy,
    Warning,
    CheckCircle,
    XCircle,
    Clock,
    CurrencyDollar,
    TrendDown,
    TrendUp,
    Buildings,
    Pulse,
} from '@phosphor-icons/react'

// ────────────────────────────────────────────────────────────
// STATUS HELPERS
// ────────────────────────────────────────────────────────────

function statusLabel(phaseStatus: string, masterStatus: string) {
    if (phaseStatus === 'failed' || masterStatus === 'failed') return 'Blown'
    if (phaseStatus === 'passed') return 'Passed'
    if (masterStatus === 'funded' && phaseStatus === 'active') return 'Funded'
    if (phaseStatus === 'active') return 'Active'
    if (phaseStatus === 'pending' || phaseStatus === 'pending_approval') return 'Pending'
    return phaseStatus
}

function statusColor(phaseStatus: string, masterStatus: string) {
    const label = statusLabel(phaseStatus, masterStatus)
    if (label === 'Blown') return 'text-red-400 bg-red-400/10 border-red-400/20'
    if (label === 'Passed') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
    if (label === 'Funded') return 'text-primary bg-primary/10 border-primary/20'
    if (label === 'Active') return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    return 'text-muted-foreground bg-muted/30 border-border/40'
}

// ────────────────────────────────────────────────────────────
// STAT CHIP
// ────────────────────────────────────────────────────────────

function Chip({ label, value, color }: { label: string; value: string | number; color?: string }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[8px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">{label}</span>
            <span className={cn("text-[11px] font-black font-mono", color ?? "text-foreground")}>{value}</span>
        </div>
    )
}

// ────────────────────────────────────────────────────────────
// ACCOUNT CARD
// ────────────────────────────────────────────────────────────

function AccountCard({ account }: { account: any }) {
    const label = statusLabel(account.phaseStatus, account.masterStatus)
    const colorClass = statusColor(account.phaseStatus, account.masterStatus)
    const pnlColor = account.totalNetPnL >= 0 ? 'text-emerald-400' : 'text-red-400'

    // Progress toward profit target
    const profitTargetDollar = account.accountSize * (account.profitTargetPercent / 100)
    const progressPct = profitTargetDollar > 0
        ? Math.min(100, Math.max(0, (account.totalNetPnL / profitTargetDollar) * 100))
        : 0

    return (
        <div className="bg-card border border-border/40 rounded-2xl p-5 flex flex-col gap-4 hover:border-border/70 transition-all group">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                        <Buildings weight="light" className="h-3.5 w-3.5 text-primary/70" />
                        <span className="text-[9px] font-black text-primary/80 uppercase tracking-widest">{account.propFirmName}</span>
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-tight text-foreground">{account.accountName}</span>
                    <span className="text-[9px] text-muted-foreground/50 font-medium">Phase {account.phaseNumber} · ${account.accountSize.toLocaleString()}</span>
                </div>
                <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full border", colorClass)}>
                    {label}
                </span>
            </div>

            {/* P&L */}
            <div className="flex items-baseline gap-1.5">
                <span className={cn("text-2xl font-black font-mono tracking-tighter", pnlColor)}>
                    {account.totalNetPnL >= 0 ? '+' : ''}${account.totalNetPnL.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-muted-foreground/50 font-bold">Net P&L</span>
            </div>

            {/* Progress bar toward profit target */}
            {account.profitTargetPercent > 0 && (
                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <span className="text-[8px] text-muted-foreground/50 font-bold uppercase tracking-widest">Profit Target Progress</span>
                        <span className="text-[8px] font-black text-foreground/60">{progressPct.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                        <div
                            className={cn("h-full rounded-full transition-all", account.totalNetPnL >= 0 ? "bg-emerald-400" : "bg-red-400")}
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[8px] text-muted-foreground/40">$0</span>
                        <span className="text-[8px] text-muted-foreground/40">${profitTargetDollar.toLocaleString()} ({account.profitTargetPercent}%)</span>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 border-t border-border/30 pt-4">
                <Chip label="Win Rate" value={`${account.winRate}%`}
                    color={parseFloat(account.winRate) >= 50 ? 'text-emerald-400' : 'text-red-400'} />
                <Chip label="Profit Factor" value={account.profitFactor}
                    color={parseFloat(account.profitFactor) >= 1 ? 'text-emerald-400' : 'text-red-400'} />
                <Chip label="Expectancy" value={`$${account.expectancy}`}
                    color={parseFloat(account.expectancy) >= 0 ? 'text-emerald-400' : 'text-red-400'} />
                <Chip label="Trades" value={account.totalTrades} />
                <Chip label="Active Days" value={account.tradingDaysActive} />
                <Chip label="Duration" value={`${account.durationDays}d`} />
            </div>

            {/* Risk Row */}
            <div className="grid grid-cols-2 gap-3 border-t border-border/30 pt-3">
                <div className="flex items-center gap-1.5">
                    <TrendDown weight="light" className="h-3 w-3 text-red-400/70" />
                    <div className="flex flex-col">
                        <span className="text-[8px] text-muted-foreground/50 uppercase font-bold tracking-wider">Max DD</span>
                        <span className="text-[10px] font-black font-mono text-red-400">
                            ${account.maxDrawdown.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            <span className="text-muted-foreground/40 font-medium ml-1">({account.maxDrawdownPct}%)</span>
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <TrendUp weight="light" className="h-3 w-3 text-emerald-400/70" />
                    <div className="flex flex-col">
                        <span className="text-[8px] text-muted-foreground/50 uppercase font-bold tracking-wider">Peak Profit</span>
                        <span className="text-[10px] font-black font-mono text-emerald-400">
                            ${account.peakProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Payouts & Breaches */}
            {(account.totalPayouts > 0 || account.breachCount > 0) && (
                <div className="flex items-center gap-3 border-t border-border/30 pt-3">
                    {account.totalPayouts > 0 && (
                        <div className="flex items-center gap-1">
                            <CurrencyDollar weight="fill" className="h-3 w-3 text-primary" />
                            <span className="text-[9px] font-black text-primary">
                                ${account.totalPayouts.toLocaleString('en-US', { minimumFractionDigits: 2 })} Received
                            </span>
                        </div>
                    )}
                    {account.breachCount > 0 && (
                        <div className="flex items-center gap-1">
                            <Warning weight="fill" className="h-3 w-3 text-amber-400" />
                            <span className="text-[9px] font-black text-amber-400">{account.breachCount} Breach{account.breachCount > 1 ? 'es' : ''}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────────────────

export function PropFirmTab() {
    const { data, isLoading } = usePropFirmStats()

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl bg-muted/20" />)}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl bg-muted/20" />)}
                </div>
            </div>
        )
    }

    if (!data || data.accounts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border/60 rounded-2xl bg-muted/5">
                <Buildings weight="light" className="h-10 w-10 text-muted-foreground/30 mb-4" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/50 mb-2">No Prop Firm Accounts</h3>
                <p className="text-[10px] text-muted-foreground/40 font-medium">Import trades linked to prop firm phases to see analytics here</p>
            </div>
        )
    }

    const summaryStats = [
        { label: 'Total Accounts', value: data.totalAccounts, icon: Buildings, color: 'text-foreground' },
        { label: 'Active', value: data.activeAccounts, icon: Pulse, color: 'text-blue-400' },
        { label: 'Funded', value: data.fundedAccounts, icon: CheckCircle, color: 'text-primary' },
        { label: 'Failed', value: data.failedAccounts, icon: XCircle, color: 'text-red-400' },
        { label: 'Phases Passed', value: data.passedPhases, icon: Trophy, color: 'text-emerald-400' },
        { label: 'Total Breaches', value: data.totalBreaches, icon: Warning, color: 'text-amber-400' },
    ]

    return (
        <div className="space-y-8">
            {/* Summary Bar */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {summaryStats.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="flex flex-col items-center justify-center gap-1.5 bg-muted/10 border border-border/40 rounded-xl p-3">
                        <Icon weight="light" className={cn("h-4 w-4", color)} />
                        <span className={cn("text-xl font-black font-mono", color)}>{value}</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/50 text-center">{label}</span>
                    </div>
                ))}
            </div>

            {/* Aggregate P&L + Payouts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 bg-muted/10 border border-border/40 rounded-2xl p-6 flex flex-col gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Combined Net P&L Across All Accounts</span>
                    <span className={cn("text-4xl font-black font-mono tracking-tighter", data.totalNetPnL >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {data.totalNetPnL >= 0 ? '+' : ''}${data.totalNetPnL.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    {data.bestAccount && (
                        <span className="text-[9px] text-muted-foreground/40 font-medium mt-2">
                            🏆 Best: <span className="text-foreground/60 font-bold">{data.bestAccount}</span>
                        </span>
                    )}
                    {data.worstAccount && data.failedAccounts > 0 && (
                        <span className="text-[9px] text-muted-foreground/40 font-medium">
                            💀 Worst: <span className="text-red-400/70 font-bold">{data.worstAccount}</span>
                        </span>
                    )}
                </div>
                <div className="bg-muted/10 border border-border/40 rounded-2xl p-6 flex flex-col gap-2 justify-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Total Payouts Received</span>
                    <span className="text-3xl font-black font-mono tracking-tighter text-primary">
                        ${data.totalPayoutsReceived.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[9px] text-muted-foreground/40 font-medium">Across {data.fundedAccounts} funded account{data.fundedAccounts !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {/* Account Cards */}
            <div>
                <h2 className="text-[11px] uppercase tracking-[0.2em] font-black text-muted-foreground mb-4">All Accounts</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.accounts.map(account => (
                        <AccountCard key={account.id} account={account} />
                    ))}
                </div>
            </div>
        </div>
    )
}
