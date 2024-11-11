import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { hash, verify } from '@node-rs/argon2'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { username: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      username: user.username
    })

  } catch (error: any) {
    console.error('Error fetching username:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Generate reset token
    const token = crypto.randomBytes(20).toString('hex')
    const expiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpiry: expiry
      }
    })

    return NextResponse.json({ 
      success: true, 
      resetToken: token,
      username: user.username,
      message: 'Reset token created successfully'
    })

  } catch (error: any) {
    console.error('Error in reset password route:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { resetToken, newPassword } = await request.json()

    if (!resetToken || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Reset token and new password are required' },
        { status: 400 }
      )
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: resetToken,
        passwordResetExpiry: {
          gt: new Date()
        }
      },
      select: {
        id: true,
        email: true,
        username: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    try {
      // Hash the new password
      const hashedPassword = await hash(newPassword, {
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1,
        outputLen: 32
      })

      // Update password and clear reset token
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: hashedPassword,
          passwordResetToken: null,
          passwordResetExpiry: null
        },
        select: {
          id: true,
          username: true,
          passwordHash: true
        }
      })

      if (!updatedUser.passwordHash) {
        throw new Error('Failed to update password hash')
      }

      // Verify the new password
      const verifyPassword = await verify(updatedUser.passwordHash, newPassword, {
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1,
        outputLen: 32
      })

      if (!verifyPassword) {
        throw new Error('Password verification failed')
      }

      return NextResponse.json({ 
        success: true,
        username: user.username,
        message: `Password updated successfully. Please login with username: ${user.username}`
      })

    } catch (hashError) {
      console.error('Error updating password:', hashError)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to update password. Please try again.'
      })
    }

  } catch (error: any) {
    console.error('Error in password reset:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

console.log('Password reset route updated with fetch username functionality')