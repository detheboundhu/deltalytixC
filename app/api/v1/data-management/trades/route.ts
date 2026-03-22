import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdSafe } from '@/server/auth'
import { applyRateLimit, apiLimiter } from '@/lib/rate-limiter'

export async function GET(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, apiLimiter)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const authUserId = await getUserIdSafe()
    if (!authUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { auth_user_id: authUserId },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // Fetch trades for this user without any specific account/status filters
    // This is for the Data Management "everything" view
    const [trades, total] = await Promise.all([
      prisma.trade.findMany({
        where: { userId: user.id },
        orderBy: { exitTime: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.trade.count({
        where: { userId: user.id }
      })
    ])

    return NextResponse.json({
      success: true,
      data: trades,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error: any) {
    console.error('[Data Management Trades API] Error:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
