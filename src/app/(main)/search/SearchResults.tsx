"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import kyInstance from "@/lib/ky";
import { PostsPage, ProfileSearchResult } from "@/lib/types";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Loader2, UserCircle } from "lucide-react";

interface SearchResultsProps {
  query: string;
}

export default function SearchResults({ query }: SearchResultsProps) {
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
  });

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
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (isProfileLoading || status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  if (isProfileError && status === "error") {
    return (
      <p className="text-center text-red-500">
        An error occurred while loading search results.
      </p>
    );
  }

  const hasResults = (profileData && profileData.length > 0) || (posts.length > 0 && hasNextPage);

  if (!hasResults) {
    return (
      <p className="text-center text-gray-500">
        No results found for this query.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {profileData && profileData.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Profiles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profileData.map((profile) => (
              <div key={profile.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center space-x-4 p-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">{profile.displayName}</h3>
                    <p className="text-sm text-gray-500">@{profile.username}</p>
                  </div>
                  <button
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      profile.isFollowedByUser
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {profile.isFollowedByUser ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4">Posts</h2>
        <InfiniteScrollContainer
          className="space-y-5"
          onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
        >
          {posts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
          {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
        </InfiniteScrollContainer>
      </div>
    </div>
  );
}