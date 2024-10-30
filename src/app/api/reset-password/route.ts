import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { hash, verify } from '@node-rs/argon2'

const prisma = new PrismaClient()

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
      // Hash the new password exactly as done in registration
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

      // Double-check if the password was stored correctly
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const emailParam = searchParams.get('email')
    const passwordParam = searchParams.get('password')

    if (!emailParam || !passwordParam) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Hash the password using the same parameters as login
    const hashedPassword = await hash(passwordParam, {
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
      outputLen: 32
    })

    if (!hashedPassword) {
      throw new Error('Failed to hash password')
    }

    // Create new user with required fields
    const user = await prisma.user.create({
      data: {
        id: crypto.randomBytes(16).toString('hex'),
        email: emailParam,
        passwordHash: hashedPassword,
        username: emailParam.split('@')[0],
        displayName: emailParam.split('@')[0]
      },
      select: {
        id: true,
        email: true,
        username: true
      }
    })

    return NextResponse.json({
      success: true,
      user,
      message: 'User created successfully'
    })

  } catch (error: any) {
    console.error('Error creating user:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create user' },
      { status: 500 }
    )
  }
}