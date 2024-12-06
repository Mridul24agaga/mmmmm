'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type Post = {
  id: string
  content: string
  userId: string
  createdAt: Date
  bookmarks: Bookmark[]
  comments: Comment[]
  likes: Like[]
  attachments: Media[]
  user: {
    username: string
    displayName: string
    isPage?: boolean
    avatarUrl?: string | null
  }
}

type Comment = {
  id: string
  content: string
  userId: string
  postId: string
  createdAt: Date
}

type Like = {
  userId: string
  postId: string
}

type Bookmark = {
  id: string
  userId: string
  postId: string
  createdAt: Date
}

type Media = {
  id: string
  postId: string | null
  type: 'IMAGE' | 'VIDEO'
  url: string
  createdAt: Date
}

export async function createUser(formData: FormData) {
  const username = formData.get('username') as string
  const displayName = formData.get('displayName') as string
  const bio = formData.get('bio') as string

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return { success: false, error: 'Username already exists' }
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        displayName,
        bio,
      },
    })

    return { success: true, user: newUser }
  } catch (error) {
    console.error('Failed to create user:', error)
    return { success: false, error: 'Failed to create user' }
  }
}

export async function getUser(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    })
    return user
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return null
  }
}

export async function updateUserAvatar(username: string, avatarUrl: string) {
  try {
    const updatedUser = await prisma.user.update({
      where: { username },
      data: { avatarUrl },
    })
    return { success: true, user: updatedUser }
  } catch (error) {
    console.error('Failed to update user avatar:', error)
    return { success: false, error: 'Failed to update user avatar' }
  }
}

export async function createPost(username: string, content: string, mediaUrls: string[] = []) {
  try {
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    const newPost = await prisma.post.create({
      data: {
        content,
        user: { connect: { id: user.id } },
        attachments: {
          create: mediaUrls.map(url => ({
            type: 'IMAGE',
            url,
          })),
        },
      },
      include: {
        attachments: true,
        comments: true,
        likes: true,
        bookmarks: true,
        user: true,
      },
    })

    return { success: true, post: newPost }
  } catch (error) {
    console.error('Failed to create post:', error)
    return { success: false, error: 'Failed to create post' }
  }
}

export async function likePost(postId: string, username: string) {
  try {
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) {
      return { success: false, error: 'Post not found' }
    }

    const like = await prisma.like.create({
      data: {
        user: { connect: { id: user.id } },
        post: { connect: { id: postId } },
      },
    })

    return { success: true, like }
  } catch (error) {
    console.error('Failed to like post:', error)
    return { success: false, error: 'Failed to like post' }
  }
}

export async function createComment(postId: string, username: string, content: string) {
  try {
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) {
      return { success: false, error: 'Post not found' }
    }

    const newComment = await prisma.comment.create({
      data: {
        content,
        user: { connect: { id: user.id } },
        post: { connect: { id: postId } },
      },
    })

    return { success: true, comment: newComment }
  } catch (error) {
    console.error('Failed to create comment:', error)
    return { success: false, error: 'Failed to create comment' }
  }
}

export async function getPosts(username: string) {
  try {
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    const posts = await prisma.post.findMany({
      where: { userId: user.id },
      include: {
        user: true,
        comments: true,
        likes: true,
        bookmarks: true,
        attachments: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, posts }
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return { success: false, error: 'Failed to fetch posts' }
  }
}

export async function bookmarkPost(postId: string, username: string) {
  try {
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) {
      return { success: false, error: 'Post not found' }
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        user: { connect: { id: user.id } },
        post: { connect: { id: postId } },
      },
    })

    return { success: true, bookmark }
  } catch (error) {
    console.error('Failed to bookmark post:', error)
    return { success: false, error: 'Failed to bookmark post' }
  }
}

export async function getBookmarkedPosts(username: string) {
  try {
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    const bookmarkedPosts = await prisma.bookmark.findMany({
      where: { userId: user.id },
      include: {
        post: {
          include: {
            comments: true,
            likes: true,
            attachments: true,
            user: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, bookmarkedPosts: bookmarkedPosts.map(b => b.post) }
  } catch (error) {
    console.error('Failed to fetch bookmarked posts:', error)
    return { success: false, error: 'Failed to fetch bookmarked posts' }
  }
}

