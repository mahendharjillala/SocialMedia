import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { Post, User } from '../types';
import CreatePost from '../components/CreatePost';
import PostComponent from '../components/Post';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['newsFeed'],
    queryFn: ({ pageParam = 0 }) => apiService.getNewsFeed(pageParam, 10),
    getNextPageParam: (lastPage: any) => {
      return lastPage.hasNext ? lastPage.currentPage + 1 : undefined;
    },
    initialPageParam: 0,
    enabled: isAuthenticated,
  });

  // Determine if news feed is empty (after it loads)
  const newsPosts = data?.pages.flatMap((page: any) => page.content) || [];
  const isNewsEmpty = isAuthenticated && !isLoading && newsPosts.length === 0;

  // Default fallback: Explore feed (public). Enabled when not authenticated or when news feed is empty.
  const {
    data: exploreData,
    isLoading: isExploreLoading,
    fetchNextPage: fetchNextExplore,
    hasNextPage: hasNextExplore,
    isFetchingNextPage: isFetchingNextExplore,
  } = useInfiniteQuery({
    queryKey: ['exploreFeed', { fallback: true }],
    queryFn: ({ pageParam = 0 }) => apiService.getExploreFeed(pageParam, 10),
    getNextPageParam: (lastPage: any) => {
      return lastPage.hasNext ? lastPage.currentPage + 1 : undefined;
    },
    initialPageParam: 0,
    enabled: !isAuthenticated || isNewsEmpty,
  });

  // Second fallback: Trending posts, if Explore has no posts
  const {
    data: trendingData,
    isLoading: isTrendingLoading,
    fetchNextPage: fetchNextTrending,
    hasNextPage: hasNextTrending,
    isFetchingNextPage: isFetchingNextTrending,
  } = useInfiniteQuery({
    queryKey: ['trendingFeed', { fallback: true }],
    queryFn: ({ pageParam = 0 }) => apiService.getTrendingPosts(pageParam, 10),
    getNextPageParam: (lastPage: any) => {
      return lastPage.hasNext ? lastPage.currentPage + 1 : undefined;
    },
    initialPageParam: 0,
    enabled: (!isAuthenticated || isNewsEmpty) && !isExploreLoading && ((exploreData?.pages.flatMap((p: any) => p.content).length || 0) === 0),
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <CreatePost />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If not authenticated, we'll show the public Explore feed instead of a hard stop.

  const handleUserClick = (user: User) => {
    navigate(`/user/${user.id}`);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {isAuthenticated && <CreatePost />}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && isAuthenticated) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-500">Failed to load posts. Please try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const explorePosts = exploreData?.pages.flatMap((page: any) => page.content) || [];
  const trendingPosts = trendingData?.pages.flatMap((page: any) => page.content) || [];
  const showingExplore = !isAuthenticated || isNewsEmpty;
  const showingTrending = showingExplore && !isExploreLoading && explorePosts.length === 0;
  const allPosts = showingExplore ? (showingTrending ? trendingPosts : explorePosts) : newsPosts;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6">
        <CreatePost />
        
        {showingExplore && isExploreLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (showingTrending && isTrendingLoading) ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : allPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-6">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No posts yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {isAuthenticated
                ? 'No posts in your feed yet. Here are some popular posts to explore.'
                : 'Welcome! Explore popular posts below or log in to see a personalized feed.'}
            </p>
            {!isAuthenticated && (
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Log in
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {allPosts.map((post: Post) => (
              <PostComponent key={post.id} post={post} onUserClick={handleUserClick} />
            ))}
            
            {(showingTrending ? hasNextTrending : showingExplore ? hasNextExplore : hasNextPage) && (
              <div className="text-center py-8">
                <button
                  onClick={showingTrending ? () => fetchNextTrending() : showingExplore ? () => fetchNextExplore() : handleLoadMore}
                  disabled={showingTrending ? isFetchingNextTrending : showingExplore ? isFetchingNextExplore : isFetchingNextPage}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg"
                >
                  {(showingTrending ? isFetchingNextTrending : showingExplore ? isFetchingNextExplore : isFetchingNextPage) ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      <span>Loading more posts...</span>
                    </>
                  ) : (
                    <>
                      <span>Load More Posts</span>
                      <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
