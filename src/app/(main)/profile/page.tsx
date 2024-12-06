'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { createUser, getUser, createPost, getPosts, likePost, updateUserAvatar } from './createUser'
import Link from 'next/link'
import { FileText, UserCircle, Heart, MessageCircle, Loader2 } from 'lucide-react'

interface UserProfile {
  id: string
  username: string
  displayName: string
  bio: string | null
  followers: number
  following: number
  isFollowing: boolean
  isPage?: boolean
  avatarUrl?: string | null
}

interface Post {
  id: string
  content: string
  createdAt: string
  likes: { userId: string }[]
  comments: { id: string; createdAt: string; content: string; userId: string; postId: string }[]
  bookmarks: { id: string; createdAt: string; userId: string; postId: string }[]
  attachments: { id: string; url: string; type: string }[]
  user: {
    username: string
    displayName: string
    isPage?: boolean
    avatarUrl?: string | null
  }
  userId: string
}

export default function SocialProfile() {
  const params = useParams()
  const sharedUsername = params.username as string | undefined

  const [message, setMessage] = useState('')
  const [createdUser, setCreatedUser] = useState<UserProfile | null>(null)
  const [sharedUser, setSharedUser] = useState<UserProfile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [shareableLink, setShareableLink] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isSharedProfile = !!sharedUsername
  const user = isSharedProfile ? sharedUser : createdUser

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)
      try {
        if (sharedUsername) {
          const userData = await getUser(sharedUsername)
          if (userData) {
            setSharedUser({
              ...userData,
              followers: 0,
              following: 0,
              isFollowing: false
            })
            setAvatarUrl(userData.avatarUrl || null)
            await fetchUserPosts(sharedUsername)
          } else {
            setError('User not found')
          }
        } else {
          const storedUsername = localStorage.getItem('username')
          if (storedUsername) {
            const userData = await getUser(storedUsername)
            if (userData) {
              setCreatedUser({
                ...userData,
                followers: 0,
                following: 0,
                isFollowing: false
              })
              setShareableLink(`${window.location.origin}/profile/${userData.username}`)
              setAvatarUrl(userData.avatarUrl || null)
              await fetchUserPosts(storedUsername)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        setError('Failed to load user data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [sharedUsername])

  const fetchUserPosts = async (username: string) => {
    try {
      const result = await getPosts(username)
      if (result.success && Array.isArray(result.posts)) {
        const formattedPosts: Post[] = result.posts.map(post => ({
          ...post,
          createdAt: new Date(post.createdAt).toISOString(),
          comments: post.comments.map(comment => ({
            ...comment,
            createdAt: new Date(comment.createdAt).toISOString()
          })),
          bookmarks: post.bookmarks.map(bookmark => ({
            ...bookmark,
            createdAt: new Date(bookmark.createdAt).toISOString()
          })),
        }))
        setPosts(formattedPosts)
      } else {
        setError(result.error || 'Failed to fetch posts')
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      setError('Failed to load posts. Please try again.')
    }
  }

  async function handleSubmit(formData: FormData) {
    setError(null)
    setIsLoading(true)
    try {
      const result = await createUser(formData)
      if (result.success && result.user) {
        setMessage('Profile created successfully!')
        setCreatedUser({
          ...result.user,
          followers: 0,
          following: 0,
          isFollowing: false
        })
        localStorage.setItem('username', result.user.username)
        setShareableLink(`${window.location.origin}/profile/${result.user.username}`)
      } else {
        setError(result.error || 'Failed to create profile. Please try again.')
      }
    } catch (error) {
      console.error('Error creating profile:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleLogout() {
    setCreatedUser(null)
    localStorage.removeItem('username')
    setMessage('Logged out successfully.')
    setShareableLink('')
  }

  function toggleFollow() {
    if (user) {
      setCreatedUser(prev => 
        prev ? {
          ...prev,
          followers: prev.isFollowing ? prev.followers - 1 : prev.followers + 1,
          isFollowing: !prev.isFollowing
        } : null
      )
    }
  }

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault()
    if (newPost.trim() && user) {
      setIsLoading(true)
      try {
        const result = await createPost(user.username, newPost)
        if (result.success && result.post) {
          await fetchUserPosts(user.username)
          setNewPost('')
          setMessage('Post created successfully!')
        } else {
          setError(result.error || 'Failed to create post')
        }
      } catch (error) {
        console.error('Error creating post:', error)
        setError('An unexpected error occurred. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  async function handleLike(postId: string) {
    if (user) {
      try {
        const result = await likePost(postId, user.username)
        if (result.success) {
          setPosts(prevPosts => 
            prevPosts.map(post => 
              post.id === postId 
                ? { ...post, likes: [...post.likes, { userId: user.id }] } 
                : post
            )
          )
        } else {
          setError(result.error || 'Failed to like post')
        }
      } catch (error) {
        console.error('Error liking post:', error)
        setError('An unexpected error occurred. Please try again.')
      }
    }
  }

  const handleAvatarClick = () => {
    if (!isSharedProfile) {
      fileInputRef.current?.click()
    }
  }

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isSharedProfile) return

    setIsUploading(true)
    try {
      setError(null)
      const file = event.target.files?.[0]
      if (!file) {
        console.error('No file selected')
        setError('Please select a file to upload')
        return
      }

      const formData = new FormData()
      formData.append('avatar', file)

      console.log('Uploading file:', file.name)
      const response = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload avatar')
      }

      const { avatarUrl } = await response.json()
      console.log('Avatar uploaded successfully:', avatarUrl)

      setAvatarUrl(avatarUrl)
      
      if (user) {
        console.log('Updating user avatar in database')
        const result = await updateUserAvatar(user.username, avatarUrl)
        if (result.success) {
          setCreatedUser(prev => prev ? { ...prev, avatarUrl } : null)
          setMessage('Avatar updated successfully')
        } else {
          throw new Error('Failed to update user avatar in database')
        }
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      setError(error instanceof Error ? error.message : 'Error uploading avatar')
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl flex items-center space-x-4">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          <p className="text-lg font-semibold text-gray-700">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user && !isSharedProfile) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
            <div className="px-8 py-10">
              <h2 className="text-4xl font-bold text-center text-gray-900 mb-8">Create Profile</h2>
              <form action={handleSubmit} className="space-y-8">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Memorial Person Name
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your Memorial Person Name"
                  />
                </div>
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your display name"
                  />
                </div>
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Tell us About Them
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Tell us about yourself"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create Profile
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="w-full max-w-4xl">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="relative">
            <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <div className="px-8 py-10 relative">
              <div className="flex flex-col sm:flex-row items-center sm:items-end sm:space-x-5 -mt-20 sm:-mt-16 mb-6">
                <div 
                  className={`w-32 h-32 bg-white p-2 rounded-full flex items-center justify-center overflow-hidden relative z-10 ring-4 ring-white ${!isSharedProfile ? 'cursor-pointer' : ''}`}
                  onClick={handleAvatarClick}
                >
                  {isUploading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  ) : avatarUrl ? (
                    <Image src={avatarUrl} alt="Avatar" width={128} height={128} className="rounded-full object-cover w-full h-full ring-2 ring-white/50" />
                  ) : (
                    <UserCircle className="w-20 h-20 text-indigo-600" />
                  )}
                </div>
                <div className="mt-4 sm:mt-0 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start space-x-2">
                    <h2 className="text-3xl font-bold text-gray-900">{user?.displayName}</h2>
                    {user?.isPage && (
                      <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        Page
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600">@{user?.username}</p>
                </div>
                {!isSharedProfile && (
                  <button
                    onClick={toggleFollow}
                    className={`mt-4 sm:mt-0 sm:ml-auto px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                      user?.isFollowing
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {user?.isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-6 mb-6">
                <div className="text-center sm:text-left">
                  <div className="text-xl font-bold text-gray-900">{user?.followers}</div>
                  <div className="text-gray-600">Followers</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-xl font-bold text-gray-900">{user?.following}</div>
                  <div className="text-gray-600">Following</div>
                </div>
              </div>
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2 text-gray-900">Bio</h4>
                <p className="text-gray-700">{user?.bio || 'No bio provided.'}</p>
              </div>
              {!isSharedProfile && (
                <>
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2 text-gray-900">Shareable Link</h4>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={shareableLink}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(shareableLink)
                          setMessage('Link copied to clipboard!')
                        }}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                  >
                    Logout
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={uploadAvatar}
                    accept="image/*"
                    className="hidden"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {!isSharedProfile && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
            <div className="px-8 py-6">
              <form onSubmit={handleCreatePost} className="space-y-4">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-none"
                  rows={3}
                />
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  Post
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {posts.map(post => (
            <div key={post.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="px-8 py-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-white p-0.5 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white">
                    {post.user.avatarUrl ? (
                      <Image 
                        src={post.user.avatarUrl} 
                        alt="Avatar" 
                        width={48} 
                        height={48} 
                        className="rounded-full object-cover w-full h-full" 
                      />
                    ) : (
                      <UserCircle className="w-8 h-8 text-indigo-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">@{post.user.username}</p>
                      {post.user.isPage && (
                        <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full flex items-center">
                          <FileText className="w-3 h-3 mr-1" />
                          Page
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-gray-800 mb-4">{post.content}</p>
                {post.attachments && post.attachments.length > 0 && (
                  <div className="mb-4">
                    {post.attachments.map((attachment, index) => (
                      <div key={index} className="mt-2">
                        {attachment.type === 'IMAGE' ? (
                          <Image src={attachment.url} alt="Post attachment" width={300} height={200} className="rounded-lg object-cover" />
                        ) : (
                          <video src={attachment.url} controls className="w-full rounded-lg" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors duration-200"
                  >
                    <Heart className={`w-5 h-5 ${post.likes.some(like => like.userId === user?.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{post.likes.length}</span>
                  </button>
                  <div className="flex items-center space-x-2 text-gray-500">
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.comments.length}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        {message && (
          <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
            <p className="text-sm text-green-700">{message}</p>
          </div>
        )}
      </div>
    </div>
  )
}

