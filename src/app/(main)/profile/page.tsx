'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createUser, getUser, createPost, getPosts, likePost } from './createUser'
import Link from 'next/link'
import { FileText, UserCircle } from 'lucide-react'

interface UserProfile {
  id: string
  username: string
  displayName: string
  bio: string | null
  followers: number
  following: number
  isFollowing: boolean
  isPage?: boolean
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

  const isSharedProfile = !!sharedUsername
  const user = isSharedProfile ? sharedUser : createdUser

  useEffect(() => {
    const fetchUser = async () => {
      if (sharedUsername) {
        const userData = await getUser(sharedUsername)
        if (userData) {
          setSharedUser({
            ...userData,
            followers: 0,
            following: 0,
            isFollowing: false
          })
        } else {
          setError('User not found')
        }
      } else {
        const storedUsername = sessionStorage.getItem('username')
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
          }
        }
      }
    }
    fetchUser()
  }, [sharedUsername])

  useEffect(() => {
    const fetchPosts = async () => {
      if (user) {
        const result = await getPosts(user.username)
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
            user: {
              username: user.username,
              displayName: user.displayName,
              isPage: user.isPage
            }
          }))
          setPosts(formattedPosts)
        } else {
          setError(result.error || 'Failed to fetch posts')
        }
      }
    }
    fetchPosts()
  }, [user])

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await createUser(formData)
    if (result.success && result.user) {
      setMessage('Profile created successfully!')
      setCreatedUser({
        ...result.user,
        followers: 0,
        following: 0,
        isFollowing: false
      })
      sessionStorage.setItem('username', result.user.username)
      setShareableLink(`${window.location.origin}/profile/${result.user.username}`)
    } else {
      setError(result.error || 'Failed to create profile. Please try again.')
    }
  }

  function handleLogout() {
    setCreatedUser(null)
    sessionStorage.removeItem('username')
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
      const result = await createPost(user.username, newPost)
      if (result.success && result.post) {
        const newPostWithUser: Post = {
          ...result.post,
          createdAt: new Date().toISOString(),
          comments: result.post.comments.map(comment => ({
            ...comment,
            createdAt: new Date(comment.createdAt).toISOString()
          })),
          bookmarks: result.post.bookmarks.map(bookmark => ({
            ...bookmark,
            createdAt: new Date(bookmark.createdAt).toISOString()
          })),
          user: {
            username: user.username,
            displayName: user.displayName,
            isPage: user.isPage
          }
        }
        setPosts(prevPosts => [newPostWithUser, ...prevPosts])
        setNewPost('')
        setMessage('Post created successfully!')
      } else {
        setError(result.error || 'Failed to create post')
      }
    }
  }

  async function handleLike(postId: string) {
    if (user) {
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
    }
  }

  if (!user && !isSharedProfile) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
            <div className="px-8 py-10">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Create Profile</h2>
              <form action={handleSubmit} className="space-y-6">
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
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden mb-6">
          <div className="px-8 py-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center">
                  <UserCircle className="w-12 h-12 text-indigo-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
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
              </div>
              {!isSharedProfile && (
                <button
                  onClick={toggleFollow}
                  className={`px-6 py-2 rounded-full text-sm font-medium ${
                    user?.isFollowing
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {user?.isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
            <div className="flex items-center space-x-6 mb-6">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{user?.followers}</div>
                <div className="text-gray-600">Followers</div>
              </div>
              <div className="text-center">
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
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>

        {!isSharedProfile && (
          <div className="bg-white shadow-xl rounded-lg overflow-hidden mb-6">
            <div className="px-8 py-6">
              <form onSubmit={handleCreatePost} className="space-y-4">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                />
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Post
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {posts.map(post => (
            <div key={post.id} className="bg-white shadow-xl rounded-lg overflow-hidden">
              <div className="px-8 py-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <UserCircle className="w-6 h-6 text-indigo-600" />
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
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-red-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                    <span>{post.likes.length}</span>
                  </button>
                  <div className="flex items-center space-x-2 text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    <span>{post.comments.length}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        {message && (
          <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4">
            <p className="text-sm text-green-700">{message}</p>
          </div>
        )}
      </div>
    </div>
  )
}