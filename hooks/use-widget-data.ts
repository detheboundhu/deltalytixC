'use client'

import { useQuery } from '@tanstack/react-query'
import type { TradeFilters } from './use-filtered-trades'
import { useData } from '@/context/data-provider'
import { format } from 'date-fns'

function buildWidgetQueryString(type: string, filters: Partial<TradeFilters>): string {
  const params = new URLSearchParams()
  params.set('type', type)
  
  if (filters.accounts?.length) params.set('accounts', filters.accounts.join(','))
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  if (filters.instruments?.length) params.set('instruments', filters.instruments.join(','))
  if (filters.pnlMin !== undefined) params.set('pnlMin', String(filters.pnlMin))
  if (filters.pnlMax !== undefined) params.set('pnlMax', String(filters.pnlMax))
  if (filters.timeRange) params.set('timeRange', filters.timeRange)
  if (filters.weekday !== null && filters.weekday !== undefined) params.set('weekday', String(filters.weekday))
  if (filters.hour !== null && filters.hour !== undefined) params.set('hour', String(filters.hour))
  
  return params.toString()
}

export function useWidgetData(type: string) {
  const dataContext = useData()
  
  // Construct filters object from the data context
  const filters: Partial<TradeFilters> = {
    accounts: dataContext.accountNumbers,
    instruments: dataContext.instruments,
    pnlMin: dataContext.pnlRange?.min,
    pnlMax: dataContext.pnlRange?.max,
    weekday: dataContext.weekdayFilter?.day,
    hour: dataContext.hourFilter?.hour,
    timeRange: dataContext.timeRange?.range,
    dateFrom: dataContext.dateRange?.from ? format(dataContext.dateRange.from, 'yyyy-MM-dd') : undefined,
    dateTo: dataContext.dateRange?.to ? format(dataContext.dateRange.to, 'yyyy-MM-dd') : undefined,
  }

  const queryString = buildWidgetQueryString(type, filters)

  return useQuery({
    queryKey: ['dashboard-widget', type, filters],
    queryFn: async () => {
      const response = await fetch(`/api/v1/dashboard/widgets?${queryString}`)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnWindowFocus: false,
  })
}
