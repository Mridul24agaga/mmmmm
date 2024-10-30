'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cva, type VariantProps } from "class-variance-authority"
import { ImageIcon, Send, Share2, ArrowLeft, Heart, MessageCircle, Upload } from 'lucide-react'
import { cn } from "@/lib/utils"

// Button component
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

// Input component
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

// Textarea component
const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

// Label component
const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className
        )}
        {...props}
      />
    )
  }
)
Label.displayName = "Label"

// Dialog components
const Dialog = ({ open, onOpenChange, children, className }: { open?: boolean, onOpenChange?: (open: boolean) => void, children: React.ReactNode, className?: string }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => onOpenChange && onOpenChange(false)}>
      <div className={cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg", className)} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

const DialogContent = ({ children }: { children: React.ReactNode }) => <div className="grid gap-4">{children}</div>
const DialogHeader = ({ children }: { children: React.ReactNode }) => <div className="flex flex-col space-y-1.5 text-center sm:text-left">{children}</div>
const DialogFooter = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}>
    {children}
  </div>
)
const DialogTitle = ({ children }: { children: React.ReactNode }) => <h3 className="text-lg font-semibold leading-none tracking-tight">{children}</h3>
const DialogDescription = ({ children }: { children: React.ReactNode }) => <p className="text-sm text-muted-foreground">{children}</p>

// Profile Manager Component
interface Comment {
  id: number;
  content: string;
  createdAt: string;
  username: string;
}

interface Post {
  id: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  likes: number;
  comments: Comment[];
}

interface Profile {
  id: number;
  username: string;
  handle: string;
  memberSince: string;
  posts: Post[];
  followers: number;
  bio: string;
  photo: string;
  uniqueUrl: string;
}

export default function ProfileManager() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [newPost, setNewPost] = useState('')
  const [newPostImage, setNewPostImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const profileId = searchParams.get('id')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const storedProfiles = localStorage.getItem('profiles')
    if (storedProfiles) {
      const parsedProfiles = JSON.parse(storedProfiles)
      setProfiles(parsedProfiles.map((profile: Profile) => ({
        ...profile,
        posts: profile.posts || []
      })))
    }
  }, [])

  useEffect(() => {
    if (profiles.length > 0) {
      localStorage.setItem('profiles', JSON.stringify(profiles))
    }
  }, [profiles])

  useEffect(() => {
    if (profileId) {
      const profile = profiles.find(p => p.uniqueUrl === profileId)
      if (profile) {
        setCurrentProfile(profile)
      } else {
        // If profile is not found in state, try to find it in localStorage
        const storedProfiles = localStorage.getItem('profiles')
        if (storedProfiles) {
          const parsedProfiles = JSON.parse(storedProfiles)
          const storedProfile = parsedProfiles.find((p: Profile) => p.uniqueUrl === profileId)
          if (storedProfile) {
            setCurrentProfile({...storedProfile, posts: storedProfile.posts || []})
            setProfiles(parsedProfiles.map((profile: Profile) => ({
              ...profile,
              posts: profile.posts || []
            })))
          } else {
            setCurrentProfile(null)
          }
        } else {
          setCurrentProfile(null)
        }
      }
    } else {
      setCurrentProfile(null)
    }
  }, [profileId, profiles])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (currentProfile) {
      setCurrentProfile({ ...currentProfile, [e.target.name]: e.target.value })
    }
  }

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhotoFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const username = formData.get('username') as string
    const bio = formData.get('bio') as string

    let photo = currentProfile?.photo || ''
    if (profilePhotoFile) {
      // In a real application, you would upload the file to a server here
      // For this example, we'll use a placeholder URL
      photo = URL.createObjectURL(profilePhotoFile)
    }

    if (isEditing && currentProfile) {
      const updatedProfile = { ...currentProfile, username, bio, photo }
      setProfiles(profiles.map(p => p.id === currentProfile.id ? updatedProfile : p))
      setCurrentProfile(updatedProfile)
    } else {
      if (profiles.length >= 5) {
        alert('You can only create up to 5 profiles.')
        return
      }
      const newProfile: Profile = {
        id: Date.now(),
        username,
        handle: `@${username}`,
        memberSince: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        posts: [],
        followers: 0,
        bio,
        photo,
        uniqueUrl: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      }
      setProfiles([...profiles, newProfile])
      router.push(`?id=${newProfile.uniqueUrl}`)
    }
    setIsEditing(false)
    setIsDialogOpen(false)
    setProfilePhotoFile(null)
  }

  const handleEdit = (profile: Profile) => {
    setCurrentProfile(profile)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    const updatedProfiles = profiles.filter(p => p.id !== id)
    setProfiles(updatedProfiles)
    localStorage.setItem('profiles', JSON.stringify(updatedProfiles))
    if (currentProfile && currentProfile.id === id) {
      router.push('/')
      setCurrentProfile(null)
    }
  }

  const handleCreateNew = () => {
    if (profiles.length >= 5) {
      alert('You can only create up to 5 profiles.')
      return
    }
    setCurrentProfile(null)
    setIsEditing(false)
    setIsDialogOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (currentProfile && (newPost.trim() || selectedFile)) {
      let imageUrl
      if (selectedFile) {
        // In a real application, you would upload the file to a server here
        // For this example, we'll use a placeholder URL
        imageUrl = URL.createObjectURL(selectedFile)
      }

      const newPostObj: Post = {
        id: Date.now(),
        content: newPost,
        imageUrl: imageUrl || newPostImage || undefined,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: [],
      }
      const updatedProfile = {
        ...currentProfile,
        posts: [newPostObj, ...(currentProfile.posts || [])],
      }
      const updatedProfiles = profiles.map(p => 
        p.id === currentProfile.id ? updatedProfile : p
      )
      setProfiles(updatedProfiles)
      setCurrentProfile(updatedProfile)
      localStorage.setItem('profiles', JSON.stringify(updatedProfiles))
      setNewPost('')
      setNewPostImage(null)
      setSelectedFile(null)
    }
  }

  const handleLike = (postId: number) => {
    if (currentProfile) {
      const updatedPosts = currentProfile.posts.map(post =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
      const updatedProfile = { ...currentProfile, posts: updatedPosts }
      const updatedProfiles = profiles.map(p =>
        p.id === currentProfile.id ? updatedProfile : p
      )
      setProfiles(updatedProfiles)
      setCurrentProfile(updatedProfile)
      localStorage.setItem('profiles', JSON.stringify(updatedProfiles))
    }
  }

  const handleComment = (postId: number, content: string) => {
    if (currentProfile) {
      const newComment: Comment = {
        id: Date.now(),
        content,
        createdAt: new Date().toISOString(),
        username: currentProfile.username,
      }
      const updatedPosts = currentProfile.posts.map(post =>
        post.id === postId ? { ...post, comments: [...(post.comments || []), newComment] } : post
      )
      const updatedProfile = { ...currentProfile, posts: updatedPosts }
      const updatedProfiles = profiles.map(p =>
        p.id === currentProfile.id ? updatedProfile : p
      )
      setProfiles(updatedProfiles)
      setCurrentProfile(updatedProfile)
      localStorage.setItem('profiles',   JSON.stringify(updatedProfiles))
    }
  }

  const handleShare = (profile: Profile) => {
    setCurrentProfile(profile)
    setIsShareDialogOpen(true)
  }

  const renderProfileCard = (profile: Profile) => (
    <div key={profile.id} className="bg-white rounded-lg border shadow-lg p-6">
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
          {profile.photo ? (
            <img
              src={profile.photo}
              alt={profile.username}
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg?height=64&width=64';
              }}
            />
          ) : (
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold">{profile.username}</h2>
          <p className="text-gray-600">{profile.handle}</p>
        </div>
      </div>
      <p className="text-gray-700 mb-4">{profile.bio}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">Posts: {profile.posts ? profile.posts.length : 0}</span>
        <Button onClick={() => router.push(`?id=${profile.uniqueUrl}`)}>View Profile</Button>
      </div>
    </div>
  )

  const renderProfile = (profile: Profile) => (
    <div key={profile.id} className="bg-white rounded-lg border shadow-lg p-8 w-full">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => router.push('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to All Profiles
        </Button>
        <Button onClick={() => handleShare(profile)}>
          <Share2 className="mr-2 h-4 w-4" />
          Share Profile
        </Button>
      </div>
      <div className="flex flex-col md:flex-row items-center md:items-start mb-6">
        <div className="w-48 h-48 bg-gray-200 rounded-full flex items-center justify-center mb-4 md:mb-0 md:mr-8">
          {profile.photo ? (
            <img
              src={profile.photo}
              alt={profile.username}
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg?height=192&width=192';
              }}
            />
          ) : (
            <svg className="w-24 h-24 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="text-center md:text-left md:flex-grow">
          <h2 className="text-3xl font-bold mb-2">{profile.username}</h2>
          <p className="text-xl text-gray-600 mb-4">{profile.handle}</p>
          <p className="text-lg text-gray-700 mb-4">{profile.bio}</p>
          <div className="flex justify-center md:justify-start space-x-4 text-lg">
            <span>Posts: {profile.posts ? profile.posts.length : 0}</span>
            <span>Followers: {profile.followers}</span>
          </div>
        </div>
      </div>
      <div className="flex justify-end mb-6">
        <Button variant="outline" onClick={() => handleEdit(profile)}>Edit Profile</Button>
      </div>
      <div className="border-t pt-4">
        <p className="text-lg text-gray-600 mb-4">Member since {profile.memberSince}</p>
        <h3 className="text-2xl font-semibold mb-4">{profile.username}&apos;s posts</h3>
        <form onSubmit={handlePostSubmit} className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Input
              type="text"
              placeholder="Please share your memories with us!"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="flex-grow"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <ImageIcon className="h-6 w-6 text-gray-400" />
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {selectedFile && (
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Selected file"
              className="w-20 h-20 object-cover rounded-md"
            />
          )}
        </form>
        {profile.posts && profile.posts.length > 0 ? (
          <div className="space-y-4">
            {profile.posts.map((post) => (
              <div key={post.id} className="bg-gray-100 p-4 rounded-lg">
                <p className="mb-2">{post.content}</p>
                {post.imageUrl && (
                  <img src={post.imageUrl} alt="Post" className="w-full h-40 object-cover rounded-md mb-2" />
                )}
                <p className="text-sm text-gray-500 mb-2">{new Date(post.createdAt).toLocaleString()}</p>
                <div className="flex items-center space-x-4 mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    {post.likes}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {post.comments?.length || 0}
                  </Button>
                </div>
                <div className="space-y-2">
                  {post.comments?.map((comment) => (
                    <div key={comment.id} className="bg-white p-2 rounded">
                      <p className="text-sm font-semibold">{comment.username}</p>
                      <p className="text-sm">{comment.content}</p>
                      <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</p>
                    </div>
                  )) || null}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const form = e.target as HTMLFormElement
                    const input = form.elements.namedItem('comment') as HTMLInputElement
                    handleComment(post.id, input.value)
                    form.reset()
                  }}
                  className="mt-2"
                >
                  <Input
                    name="comment"
                    placeholder="Add a comment..."
                    className="w-full"
                  />
                </form>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 italic">No posts yet.</p>
        )}
      </div>
    </div>
  )

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Profile Manager</h1>
      {!profileId && (
        <Button onClick={handleCreateNew} className="mb-8 w-full max-w-md mx-auto block">Create Additional Profile</Button>
      )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Profile' : 'Create New Profile'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Edit your profile information below.' : 'Enter your profile information below.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  defaultValue={currentProfile?.username || ''}
                  placeholder="Your username"
                  required
                />
              </div>
              <div>
                <Label htmlFor="photo">Profile Photo</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="photo"
                    name="photo"
                    accept="image/*"
                    onChange={handleProfilePhotoChange}
                    className="hidden"
                  />
                  {(profilePhotoFile || currentProfile?.photo) && (
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img
                        src={profilePhotoFile ? URL.createObjectURL(profilePhotoFile) : currentProfile?.photo}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  defaultValue={currentProfile?.bio || ''}
                  placeholder="Tell us about yourself"
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">{isEditing ? 'Update Profile' : 'Create Profile'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Profile</DialogTitle>
            <DialogDescription>
              Copy the link below to share this profile:
            </DialogDescription>
          </DialogHeader>
          <Input
            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/profile?id=${currentProfile?.uniqueUrl}`}
            readOnly
          />
          <DialogFooter>
            <Button onClick={() => {
              navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : ''}/profile?id=${currentProfile?.uniqueUrl}`)
              alert('Link copied to clipboard!')
            }}>
              Copy Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {profileId 
        ? (currentProfile ? renderProfile(currentProfile) : <p>Profile not found</p>)
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {profiles.map(renderProfileCard)}
          </div>
        )
      }
    </div>
  )
}