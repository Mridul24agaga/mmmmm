import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";

export async function GET(
  req: Request,
  { params: { username } }: { params: { username: string } }
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
      select: getUserDataSelect(loggedInUser.id),
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params: { username } }: { params: { username: string } }
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userToFollow = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    if (!userToFollow) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (loggedInUser.id === userToFollow.id) {
      return Response.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (prisma) => {
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: loggedInUser.id,
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
              followerId: loggedInUser.id,
              followingId: userToFollow.id,
            },
          },
        });
        isFollowing = false;
      } else {
        // Follow
        await prisma.follow.create({
          data: {
            followerId: loggedInUser.id,
            followingId: userToFollow.id,
          },
        });
        isFollowing = true;
      }

      // Fetch the updated user data within the transaction
      const updatedUser = await prisma.user.findUnique({
        where: { id: userToFollow.id },
        select: getUserDataSelect(loggedInUser.id),
      });

      return { isFollowing, updatedUser };
    });

    return Response.json({
      success: true,
      isFollowing: result.isFollowing,
      user: result.updatedUser,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}