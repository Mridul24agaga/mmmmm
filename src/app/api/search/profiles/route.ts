import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ProfileSearchResult } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const sessionToken = request.cookies.get('session_token')?.value;
    let loggedInUserId: string | undefined;

    if (sessionToken) {
      const session = await prisma.session.findUnique({
        where: { id: sessionToken },
        select: { userId: true, expiresAt: true },
      });

      if (session && session.expiresAt > new Date()) {
        loggedInUserId = session.userId;
      }
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { displayName: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10, // Limit the number of results
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        followers: loggedInUserId ? {
          where: {
            followerId: loggedInUserId,
          },
        } : undefined,
        _count: {
          select: {
            followers: true,
          },
        },
      },
    });

    const profileResults: ProfileSearchResult[] = users.map((user) => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      isFollowedByUser: loggedInUserId ? user.followers.length > 0 : false,
      followerCount: user._count.followers,
    }));

    return NextResponse.json(profileResults);
  } catch (error) {
    console.error('Error searching profiles:', error);
    return NextResponse.json({ error: 'An error occurred while searching profiles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionToken },
      select: { userId: true, expiresAt: true },
    });

    if (!session || session.expiresAt <= new Date()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userToFollow = await prisma.user.findUnique({
      where: { username },
    });

    if (!userToFollow) {
      return NextResponse.json({ error: 'User to follow not found' }, { status: 404 });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: userToFollow.id,
        },
      },
    });

    let isFollowing: boolean;

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: currentUser.id,
            followingId: userToFollow.id,
          },
        },
      });
      isFollowing = false;
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          follower: { connect: { id: currentUser.id } },
          following: { connect: { id: userToFollow.id } },
        },
      });
      isFollowing = true;
    }

    const updatedUserToFollow = await prisma.user.findUnique({
      where: { username },
      include: {
        followers: true,
      },
    });

    const profileResult: ProfileSearchResult = {
      id: updatedUserToFollow!.id,
      username: updatedUserToFollow!.username,
      displayName: updatedUserToFollow!.displayName,
      avatarUrl: updatedUserToFollow!.avatarUrl,
      bio: updatedUserToFollow!.bio,
      isFollowedByUser: isFollowing,
      followerCount: updatedUserToFollow!.followers.length,
    };

    return NextResponse.json({
      success: true,
      isFollowing,
      user: profileResult,
    });
  } catch (error) {
    console.error('Error following/unfollowing user:', error);
    return NextResponse.json({ error: 'An error occurred while following/unfollowing the user' }, { status: 500 });
  }
}