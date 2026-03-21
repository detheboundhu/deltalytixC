import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// The new updated DEFAULT_LAYOUT mapping to WIDGET_DIMENSIONS
const DEFAULT_LAYOUT = [
  // KPIs (Fixed top row)
  { i: 'accountBalancePnl', type: 'accountBalancePnl', x: 0, y: 0, w: 1, h: 1, size: 'kpi' },
  { i: 'tradeWinRate', type: 'tradeWinRate', x: 1, y: 0, w: 1, h: 1, size: 'kpi' },
  { i: 'dayWinRate', type: 'dayWinRate', x: 2, y: 0, w: 1, h: 1, size: 'kpi' },
  { i: 'profitFactor', type: 'profitFactor', x: 3, y: 0, w: 1, h: 1, size: 'kpi' },
  { i: 'avgWinLoss', type: 'avgWinLoss', x: 4, y: 0, w: 1, h: 1, size: 'kpi' },

  // Row 1
  { i: 'recentTrades', type: 'recentTrades', x: 0, y: 1, w: 4, h: 5, size: 'medium' },
  { i: 'calendarMini', type: 'calendarMini', x: 4, y: 1, w: 8, h: 5, size: 'medium' },

  // Row 2
  { i: 'netDailyPnL', type: 'netDailyPnL', x: 0, y: 6, w: 4, h: 4, size: 'medium' },
  { i: 'dailyCumulativePnL', type: 'dailyCumulativePnL', x: 4, y: 6, w: 4, h: 4, size: 'medium' },
  { i: 'accountBalanceChart', type: 'accountBalanceChart', x: 8, y: 6, w: 4, h: 4, size: 'medium' },

  // Row 3
  { i: 'weekdayPnL', type: 'weekdayPnL', x: 0, y: 10, w: 4, h: 4, size: 'medium' },
  { i: 'tradeDurationPerformance', type: 'tradeDurationPerformance', x: 4, y: 10, w: 4, h: 4, size: 'medium' },
  { i: 'performanceScore', type: 'performanceScore', x: 8, y: 10, w: 4, h: 4, size: 'medium' },
]

async function resetAllLayouts() {
  console.log('Fetching all dashboard templates...')
  const { data: templates, error: fetchError } = await supabase
    .from('DashboardTemplate')
    .select('id, user_id, is_default')

  if (fetchError) {
    console.error('Error fetching templates:', fetchError)
    process.exit(1)
  }

  console.log(`Found ${templates.length} templates. Resetting to new default layout...`)

  let successCount = 0
  let errorCount = 0

  for (const template of templates) {
    const { error: updateError } = await supabase
      .from('DashboardTemplate')
      .update({ layout: DEFAULT_LAYOUT })
      .eq('id', template.id)

    if (updateError) {
      console.error(`Failed to update template ${template.id}:`, updateError)
      errorCount++
    } else {
      successCount++
    }
  }

  console.log('---')
  console.log('Reset Complete!')
  console.log(`Successfully updated: ${successCount}`)
  console.log(`Failed to update: ${errorCount}`)
  process.exit(0)
}

resetAllLayouts()
