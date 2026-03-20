import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/server/auth-utils'
import { prisma } from '@/lib/prisma'
import { invalidateUserCaches } from '@/server/accounts'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUserId = await getUserId()
    if (!authUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { auth_user_id: authUserId },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const { newDate, isPropFirm, notificationId } = await request.json()

    if (!newDate) {
      return NextResponse.json(
        { success: false, error: 'New date is required' },
        { status: 400 }
      )
    }

    const adjustedDate = new Date(newDate)
    if (isNaN(adjustedDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format' },
        { status: 400 }
      )
    }

    // Execute update
    if (isPropFirm) {
      await prisma.masterAccount.update({
        where: { id: params.id, userId: user.id },
        data: { createdAt: adjustedDate }
      })
    } else {
      await prisma.account.update({
        where: { id: params.id, userId: user.id },
        data: { createdAt: adjustedDate }
      })
    }

    // Mark notification as read if provided
    if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId, userId: user.id },
        data: { isRead: true }
      })
    }

    // Invalidate caches
    await invalidateUserCaches(user.id)

    return NextResponse.json({
      success: true,
      message: 'Account creation date adjusted successfully'
    })

  } catch (error) {
    console.error('Adjust account date error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to adjust account date' },
      { status: 500 }
    )
  }
}
