'use client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Paintbrush, Code2, FormInput, Accessibility, Zap, Terminal } from 'lucide-react'

export default function FrontendGuidelinesPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <Badge variant="outline" className="mb-2">Frontend Guidelines</Badge>
        <h1>UI/UX & Code Standards</h1>
        <p className="text-xl text-muted-foreground">
          Strict UI, UX, and code consistency patterns for the Deltalytix codebase.
        </p>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Paintbrush className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Design Aesthetic</h2>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p><strong>Color Palette:</strong> Exclusively use Tailwind CSS variables defined in <code>tailwind.config.ts</code> (e.g., <code>bg-background</code>, <code>text-muted-foreground</code>).</p>
              <p><strong>P&L Colors:</strong> Use <code>text-profit</code> / <code>bg-profit</code> and <code>text-loss</code> / <code>text-destructive</code>.</p>
              <p><strong>Icons:</strong> Only use <code>lucide-react</code>. Remove any legacy <code>weight</code> props from previously migrated icons.</p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Code2 className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Component Architecture</h2>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p><strong>Server vs Client:</strong> Default to RSC (Server Components). Only use <code>'use client'</code> at the lowest possible leaf node.</p>
              <p><strong>Props:</strong> Use standard <code>interface</code> declarations. No inline destructuring without explicit types.</p>
              <p><strong>ClassName:</strong> Always use the <code>cn()</code> utility wrapper to prevent utility collision.</p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <FormInput className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Form Handling</h2>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p><strong>React Hook Form + Zod:</strong> Every form strictly binds to a Zod schema resolver.</p>
              <p><strong>Rich Text:</strong> Use <code>LexicalEditor</code> for all detailed journaling (Backtest Notes, Playbook Notes, Daily Journal, Trade Comments).</p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Performance & Style</h2>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p><strong>Optimization:</strong> Suspend data fetching aggressively via React <code>Suspense</code> and Shimmer skeletons.</p>
              <p><strong>Code Style:</strong> Single quotes for JS strings, arrow functions for components, and no production <code>console.logs</code>.</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
