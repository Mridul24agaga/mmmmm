'use client'

import { useState, ReactNode, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Hash, Plus, Search, Heart, MessageCircle, Calendar, Eye, AlertTriangle, Globe } from 'lucide-react'

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2" />
        {children}
      </div>
    </div>
  )
}

function AlertTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-bold">{children}</h3>
}

function AlertDescription({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>
}

interface Reply {
  id: number;
  author: string;
  content: string;
  createdAt: string;
}

interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: string;
  replies: Reply[];
}

interface Forum {
  id: number;
  author: string;
  title: string;
  hashtag: string;
  category: string;
  createdAt: string;
  content: string;
  views: number;
  comments: Comment[];
  likes: number;
}

interface CardProps {
  children: ReactNode;
  className?: string;
}

function Card({ children, className = '' }: CardProps) {
  return <div className={`bg-white shadow-md rounded-lg ${className}`}>{children}</div>
}

function CardHeader({ children }: { children: ReactNode }) {
  return <div className="px-6 py-4">{children}</div>
}

function CardTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-xl font-semibold mb-2">{children}</h3>
}

function CardDescription({ children }: { children: ReactNode }) {
  return <p className="text-gray-600">{children}</p>
}

function CardFooter({ children }: { children: ReactNode }) {
  return <div className="px-6 py-4 bg-gray-50 rounded-b-lg">{children}</div>
}

const localStorageAPI = {
  getForums: (): Forum[] => {
    const forums = localStorage.getItem('public_forums')
    return forums ? JSON.parse(forums) : []
  },
  setForums: (forums: Forum[]) => {
    localStorage.setItem('public_forums', JSON.stringify(forums))
  },
}

export default function PublicForumPage() {
  const [forums, setForums] = useState<Forum[]>([])
  const [title, setTitle] = useState('')
  const [hashtag, setHashtag] = useState('')
  const [content, setContent] = useState('')
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isNewForumDialogOpen, setIsNewForumDialogOpen] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<number | null>(null)

  useEffect(() => {
    const storedForums = localStorageAPI.getForums()
    setForums(storedForums)
  }, [])

  const saveForums = (updatedForums: Forum[]) => {
    setForums(updatedForums)
    localStorageAPI.setForums(updatedForums)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newForum: Forum = {
      id: Date.now(),
      author: 'Anonymous',
      title,
      hashtag,
      category: 'General',
      createdAt: new Date().toISOString(),
      content,
      views: 0,
      comments: [],
      likes: 0,
    }
    const updatedForums = [newForum, ...forums]
    saveForums(updatedForums)
    setTitle('')
    setHashtag('')
    setContent('')
    setIsNewForumDialogOpen(false)
  }

  const addComment = (forumId: number) => {
    if (newComment.trim()) {
      const updatedForums = forums.map(forum => {
        if (forum.id === forumId) {
          return {
            ...forum,
            comments: [
              ...forum.comments,
              {
                id: Date.now(),
                author: 'Anonymous',
                content: newComment,
                createdAt: new Date().toISOString(),
                replies: [],
              },
            ],
          }
        }
        return forum
      })
      saveForums(updatedForums)
      setNewComment('')
    }
  }

  const addReply = (forumId: number, commentId: number) => {
    if (newComment.trim()) {
      const updatedForums = forums.map(forum => {
        if (forum.id === forumId) {
          return {
            ...forum,
            comments: forum.comments.map(comment => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  replies: [
                    ...comment.replies,
                    {
                      id: Date.now(),
                      author: 'Anonymous',
                      content: newComment,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              }
              return comment
            }),
          }
        }
        return forum
      })
      saveForums(updatedForums)
      setNewComment('')
      setReplyingTo(null)
    }
  }

  const likeForum = (forumId: number) => {
    const updatedForums = forums.map(forum => {
      if (forum.id === forumId) {
        return { ...forum, likes: forum.likes + 1 }
      }
      return forum
    })
    saveForums(updatedForums)
  }

  const filteredForums = forums.filter(forum =>
    forum.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    forum.hashtag.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Public Forum Page</h1>
      
      <Alert>
        <AlertTitle>Public Forum</AlertTitle>
        <AlertDescription>
          All posts in this forum are public and visible to everyone across all accounts. Please be mindful of what you share.
        </AlertDescription>
      </Alert>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search forums"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Dialog open={isNewForumDialogOpen} onOpenChange={setIsNewForumDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Create New Public Forum</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create a New Public Forum</DialogTitle>
              <DialogDescription>Fill in the details to create a new public forum topic. Remember, this will be visible to all users.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="hashtag" className="text-right">
                    Hashtag
                  </Label>
                  <div className="col-span-3 relative">
                    <Hash className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="hashtag"
                      value={hashtag}
                      onChange={(e) => setHashtag(e.target.value)}
                      className="pl-8"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="content" className="text-right">
                    Content
                  </Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Public Forum</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {filteredForums.map((forum) => (
          <Card key={forum.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                  <span className="text-xl font-semibold text-gray-600">A</span>
                </div>
                <div>
                  <CardTitle>{forum.title}</CardTitle>
                  <CardDescription>
                    Anonymous • {new Date(forum.createdAt).toLocaleString()} • {forum.category}
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      <Globe className="w-3 h-3 mr-1" />
                      Public
                    </span>
                  </CardDescription>
                </div>
              </div>
              <p className="mb-4">{forum.content}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{forum.views} Views • {forum.comments.length} Replies</span>
                <div className="flex items-center space-x-4">
                  <button className="flex items-center" onClick={() => likeForum(forum.id)}>
                    <Heart className="w-4 h-4 mr-1" /> {forum.likes} Likes
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardFooter>
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedForum(forum)}>View Forum</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">{forum.title}</DialogTitle>
                    <DialogDescription className="flex items-center text-sm text-gray-500 flex-wrap">
                      <span className="flex items-center mr-3 mb-1">
                        <Hash className="w-4 h-4 mr-1" />
                        {forum.hashtag}
                      </span>
                      <span className="flex items-center mr-3 mb-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(forum.createdAt).toLocaleString()}
                      </span>
                      <span className="flex items-center mr-3 mb-1">
                        <Eye className="w-4 h-4 mr-1" />
                        {forum.views} Views
                      </span>
                      <span className="flex items-center mb-1">
                        <Heart className="w-4 h-4 mr-1" />
                        {forum.likes} Likes
                      </span>
                      <span className="flex items-center ml-3 mb-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        <Globe className="w-3 h-3 mr-1" />
                        Public
                      </span>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex-grow mt-4 overflow-y-auto">
                    <div className="space-y-4">
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-gray-800">{forum.content}</p>
                      </div>
                      <div className="h-px bg-gray-200 my-4" />
                      <h4 className="font-semibold text-lg mb-2">Comments</h4>
                      {forum.comments.map(comment => (
                        <div key={comment.id} className="bg-white p-4 rounded-lg shadow mb-4">
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                              <span className="text-xs font-semibold text-gray-600">{comment.author[0]}</span>
                            </div>
                            <span className="font-semibold">{comment.author}</span>
                            <span className="text-gray-500 text-sm ml-2">{new Date(comment.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="mb-2">{comment.content}</p>
                          <Button 
                            onClick={() => setReplyingTo(comment.id)} 
                            variant="link"
                            className="text-sm text-blue-500 p-0"
                          >
                            Reply
                          </Button>
                          {replyingTo === comment.id && (
                            <div className="mt-2">
                              <Textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a reply..."
                                
                                className="w-full p-2 border rounded-md"
                                rows={2}
                              />
                              <Button onClick={() => addReply(forum.id, comment.id)} className="mt-2">Post Public Reply</Button>
                            </div>
                          )}
                          {comment.replies.map(reply => (
                            <div key={reply.id} className="ml-8 mt-2 bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center mb-1">
                                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                  <span className="text-xs font-semibold text-gray-600">{reply.author[0]}</span>
                                </div>
                                <span className="font-semibold text-sm">{reply.author}</span>
                                <span className="text-gray-500 text-xs ml-2">{new Date(reply.createdAt).toLocaleString()}</span>
                              </div>
                              <p className="text-sm">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a public comment..."
                      className="w-full p-2 border rounded-md"
                      rows={3}
                    />
                    <Button onClick={() => addComment(forum.id)} className="mt-2">Post Public Comment</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}