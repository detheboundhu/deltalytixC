import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/server/auth'
import { logActivity, getClientIp } from '@/lib/activity-logger'

// GET /api/auth/profile - Get user profile information
export async function GET() {
  try {
    // Get user ID using the proper auth function
    let userId: string
    try {
      userId = await getUserId()
    } catch (authError) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const user = await prisma.user.findUnique({
      where: { auth_user_id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        accentPack: true,
        theme: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PATCH /api/auth/profile - Update user profile information
export async function PATCH(request: NextRequest) {
  try {
    // Get user ID using the proper auth function
    let userId: string
    try {
      userId = await getUserId()
    } catch (authError) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const { firstName, lastName, accentPack, theme, autoAdjustAccountDate } = body

    // Validate input — only check fields that are actually provided
    if (firstName !== undefined && typeof firstName !== 'string' && firstName !== null) {
      return NextResponse.json(
        { error: 'Invalid firstName format' },
        { status: 400 }
      )
    }

    if (lastName !== undefined && typeof lastName !== 'string' && lastName !== null) {
      return NextResponse.json(
        { error: 'Invalid lastName format' },
        { status: 400 }
      )
    }

    // Build update data — only include fields that were sent
    const updateData: Record<string, any> = {}
    if (firstName !== undefined) updateData.firstName = firstName?.trim() || null
    if (lastName !== undefined) updateData.lastName = lastName?.trim() || null
    if (accentPack && typeof accentPack === 'string') updateData.accentPack = accentPack
    if (theme && typeof theme === 'string') updateData.theme = theme
    if (autoAdjustAccountDate !== undefined) updateData.autoAdjustAccountDate = !!autoAdjustAccountDate

    // Update user profile in database
    const updatedUser = await prisma.user.update({
      where: { auth_user_id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        accentPack: true,
        theme: true,
      }
    })

    logActivity({
      userId: updatedUser.id,
      action: 'PROFILE_UPDATED',
      entity: 'Profile',
      metadata: { updatedFields: Object.keys(updateData) },
      ipAddress: getClientIp(request),
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
