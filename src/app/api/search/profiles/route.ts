import { NextRequest, NextResponse } from 'next/server';
import prisma  from '@/lib/prisma';
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