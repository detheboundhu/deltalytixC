'use client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cpu, Layout, Database, Sparkles, ShieldCheck, Microscope } from 'lucide-react'

export default function TechStackPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <Badge variant="outline" className="mb-2">Technology Stack</Badge>
        <h1>Core Infrastructure</h1>
        <p className="text-xl text-muted-foreground">
          The canonical tech stack powering Deltalytix, updated for Q1 2026.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Cpu className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Core Framework</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p><strong>Next.js 15.5+:</strong> App Router exclusively. Used for dynamic routing, Edge Middleware, and Server Components (RSC).</p>
            <p><strong>React 19.2+:</strong> Leveraging concurrent features, native hooks (<code>use</code>, <code>useOptimistic</code>).</p>
            <p><strong>TypeScript 5.x:</strong> Strict mode enabled for robust end-to-end type safety.</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Layout className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Frontend Ecosystem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p><strong>Styling:</strong> Tailwind CSS integrated with <code>tailwind-merge</code> for dynamic utility class composition.</p>
            <p><strong>UI Primitives:</strong> Radix UI wrapped by <code>shadcn/ui</code> components. Icons migrated to <code>lucide-react</code>.</p>
            <p><strong>State:</strong> React Query (Server) and Zustand (Client).</p>
            <p><strong>Rich Text:</strong> Lexical (<code>@lexical/react</code>) for journaling and playbook entries.</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Backend & Data Layer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p><strong>Database:</strong> PostgreSQL Engine.</p>
            <p><strong>ORM:</strong> Prisma (v6.14.0) as the single source of truth for the data model.</p>
            <p><strong>Auth:</strong> <code>@auth/core</code> paired with Supabase SSR.</p>
            <p><strong>API:</strong> Next.js API Route Handlers and Server Actions.</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Artificial Intelligence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p><strong>Vercel AI SDK:</strong> Used to interface with OpenAI (GPT-4o) specifically for analyzing the trader's daily psychology journals.</p>
            <p><strong>Analytics:</strong> AI-powered trade field mapping for CSV imports.</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Microscope className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>QA & Testing</CardTitle>
          </CardHeader>
          <div className="p-6 pt-0 space-y-4 text-sm leading-relaxed">
            <p><strong>Vitest:</strong> Unit and integration testing with React Testing Library.</p>
            <p><strong>Playwright:</strong> End-to-End (E2E) testing ensuring critical trading workflows.</p>
            <p><strong>ESLint:</strong> Strict enforcement of Next.js core web vitals and custom hook rules.</p>
          </div>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Infrastructure</CardTitle>
          </CardHeader>
          <div className="p-6 pt-0 space-y-4 text-sm leading-relaxed">
            <p><strong>Vercel:</strong> Deployment pipeline and hosting.</p>
            <p><strong>Sentry:</strong> Error tracking for Edge, Node, and Browser.</p>
            <p><strong>Rate Limiting:</strong> <code>rate-limiter-flexible</code> for API route protection.</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
