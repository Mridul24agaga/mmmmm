'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer"
import Post from "@/components/posts/Post"
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton"
import kyInstance from "@/lib/ky"
import { PostsPage, ProfileSearchResult, FollowerInfo } from "@/lib/types"
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2, UserCircle } from 'lucide-react'
import FollowButton from "@/components/FollowButton"

interface SearchResultsProps {
  query: string
}

export default function SearchResults({ query }: SearchResultsProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!query) {
      router.push("/")
    }
  }, [query, router])

  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useQuery({
    queryKey: ["profile-search", query],
    queryFn: () =>
      kyInstance
        .get("/api/search/profiles", {
          searchParams: { q: query },
        })
        .json<ProfileSearchResult[]>(),
    enabled: !!query,
  })

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "search", query],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get("/api/search", {
          searchParams: {
            q: query,
            ...(pageParam ? { cursor: pageParam } : {}),
          },
        })
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    gcTime: 0,
    enabled: !!query,
  })

  const posts = data?.pages.flatMap((page) => page.posts) || []

  if (isProfileLoading || status === "pending") {
    return <PostsLoadingSkeleton />
  }

  if (isProfileError && status === "error") {
    return (
      <p className="text-center text-red-500">
        An error occurred while loading search results.
      </p>
    )
  }

  const hasResults = (profileData && profileData.length > 0) || (posts.length > 0 && hasNextPage)

  if (!hasResults) {
    return (
      <p className="text-center text-gray-500">
        No results found for this query.
      </p>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {profileData && profileData.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold mb-6">Profiles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profileData.map((profile) => (
              <div key={profile.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <UserCircle className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-semibold text-xl mb-1 break-words">{profile.displayName}</h3>
                      <p className="text-sm text-gray-500 break-words">@{profile.username}</p>
                    </div>
                  </div>
                  {profile.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{profile.bio}</p>
                  )}
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-600">{profile.followerCount} followers</span>
                    <FollowButton
                      userId={profile.id}
                      initialState={{
                        followers: profile.followerCount,
                        isFollowedByUser: profile.isFollowedByUser,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {posts.length > 0 && (
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Posts</h2>
          <InfiniteScrollContainer
            className="space-y-6"
            onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
          >
            {posts.map((post) => (
              <Post key={post.id} post={post} />
            ))}
            {isFetchingNextPage && <Loader2 className="mx-auto my-4 animate-spin" />}
          </InfiniteScrollContainer>
        </div>
      )}
    </div>
  )
}