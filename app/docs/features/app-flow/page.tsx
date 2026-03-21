'use client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function AppFlowPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <Badge variant="outline" className="mb-2">Application Flow</Badge>
        <h1>Core User Journeys</h1>
        <p className="text-xl">
          An overview of the primary user journeys and data lifecycles within the Deltalytix platform.
        </p>
      </div>

      <div className="space-y-10">
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="font-bold text-primary px-1">1</span>
            </div>
            <h2>Authentication & Onboarding</h2>
          </div>
          <div className="pl-11 space-y-4">
            <p>1. <strong>Landing/Login:</strong> User accesses <code>/login</code>. Unauthenticated users are redirected here automatically via Next.js Edge Middleware.</p>
            <p>2. <strong>Setup:</strong> After initial authentication via Auth.js / Supabase Auth, they arrive at the Dashboard.</p>
            <p>3. <strong>Account Creation:</strong> If no active trading accounts exist, the user must create an Account (associated with a Master Account or Phase Account) specifying initial balance and currency before logging any live trades.</p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="font-bold text-primary px-1">2</span>
            </div>
            <h2>Core Operational Flow (Dashboard & Trades)</h2>
          </div>
          <div className="pl-11 space-y-4">
            <p>1. <strong>The Navigation Hub:</strong> The left Sidebar serves as the central hub: 
              <code>Dashboard</code>, <code>Calendar</code>, <code>Trades</code>, <code>Journal</code>, <code>Playbook</code>, and <code>Backtesting</code>.
            </p>
            <p>2. <strong>Adding a Trade:</strong> Clicking "Add Trade" opens a multi-step form dialog. User inputs Asset, Direction, Status, Risk metrics, and Entry/Exit paths. A Lexical Rich Text editor allows them to embed screenshot URLs or type comprehensive comments.</p>
            <p>3. <strong>Reviewing the Trade:</strong> Saved trades appear in the data table. Clicking a row expands the "Trade Details" slide-out sidebar overlay summarizing ROI, R:R, and mapped chart screenshots.</p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="font-bold text-primary px-1">3</span>
            </div>
            <h2>Daily Review & Psychology (Journal Flow)</h2>
          </div>
          <div className="pl-11 space-y-4">
            <p>1. <strong>Daily Check-in:</strong> The user navigates to <code>/dashboard/journal</code>.</p>
            <p>2. <strong>Logging the Day:</strong> They select today's date and log qualitative emotional tracking, market conditions, and personal notes.</p>
            <p>3. <strong>AI Interrogation:</strong> Selecting the "AI Analysis" command triggers the <code>AIAnalysisDialog</code>. The system bundles the daily journal strings and associated trade hit-rates to the OpenAI endpoint, injecting analytical cards with emotional patterns and recommendations.</p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="font-bold text-primary px-1">4</span>
            </div>
            <h2>System Building (Playbook & Backtest Flow)</h2>
          </div>
          <div className="pl-11 space-y-4">
            <p>1. <strong>Modeling Strategy:</strong> The <code>/dashboard/playbook</code> acts as the user's rulebook where they define strategies and entry rules.</p>
            <p>2. <strong>Testing the Theory:</strong> In <code>/dashboard/backtesting</code>, the user initiates a sandbox "Session".</p>
            <p>3. <strong>Dry Runs:</strong> Using either "Full Manual" or "Simple R:R", they log simulated executions that mimic real market data.</p>
            <p>4. <strong>Validation:</strong> The session aggregates the simulated win rate and concluding on the statistical edge of the model.</p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="font-bold text-primary px-1">5</span>
            </div>
            <h2>Analytics Consumption</h2>
          </div>
          <div className="pl-11 space-y-4">
            <p>The <strong>Dashboard</strong> reads historical data natively via Prisma and outputs grouped arrays to Recharts and Lightweight Charts for equity curve plotting.</p>
            <p>The <strong>Calendar</strong> renders color-coded performance tiles. Clicking a tile cascades open a Modal showing exactly which trades occurred on that day.</p>
          </div>
        </section>

        <div className="pt-8 flex justify-between items-center border-t">
          <Link href="/docs/getting-started" className="flex items-center text-primary hover:underline">
            ← Getting Started
          </Link>
          <Link href="/docs/features/importing" className="flex items-center text-primary hover:underline">
            Trade Import →
          </Link>
        </div>
      </div>
    </div>
  )
}
