'use client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, Shield, Server, Zap, Lock } from 'lucide-react'

export default function BackendStructurePage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <Badge variant="outline" className="mb-2">Backend & Data Layer</Badge>
        <h1>Structure & Security</h1>
        <p className="text-xl text-muted-foreground">
          A definitive guide on how data is managed, shaped, and secured in the Deltalytix backend.
        </p>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Database & ORM</h2>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p><strong>Database Engine:</strong> PostgresSQL (Supabase/Vercel Postgres).</p>
              <p><strong>ORM Schema:</strong> Prisma (<code>prisma/schema.prisma</code>) is the absolute source of truth.</p>
              <p><strong>Entities:</strong> Core nodes include <code>User</code>, <code>Account</code>, <code>Trade</code>, <code>DailyNote</code>, and <code>TradingModel</code>.</p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Server className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">API Architecture</h2>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p><strong>Server Actions:</strong> Used for form submissions and mutations in <code>/app/actions/</code>.</p>
              <p><strong>Route Handlers:</strong> Used for webhooks, SSE, or complex REST interactions in <code>app/api/...</code>.</p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Security & Validation</h2>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p><strong>Tenant Isolation:</strong> ALL queries must include <code>userId</code> to prevent data cross-contamination.</p>
              <p><strong>Validation:</strong> Combined Zod validation on both the client and server route boundaries.</p>
              <p><strong>Rate Limiting:</strong> Enforces IP/User-based rate limits on resource-intensive calls.</p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Operational Mechanics</h2>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p><strong>Rich Text Storage:</strong> Lexical editor notes are stored as stringified JSON blobs in <code>TEXT</code> columns.</p>
              <p><strong>Background Jobs:</strong> Scheduled via Vercel Cron mapped to <code>api/cron/...</code> endpoints.</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
