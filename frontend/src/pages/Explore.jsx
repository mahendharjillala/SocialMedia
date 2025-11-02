import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { User } from '../types';
import PostComponent from '../components/Post';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Search } from 'lucide-react';

const Explore: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'explore' | 'trending'>('explore');

  const { data: exploreData, isLoading: exploreLoading, error: exploreError } = useQuery({
    queryKey: ['exploreFeed'],
    queryFn: () => apiService.getExploreFeed(0, 20),
    enabled: activeTab === 'explore',
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: trendingData, isLoading: trendingLoading, error: trendingError } = useQuery({
    queryKey: ['trendingPosts'],
    queryFn: () => apiService.getTrendingPosts(0, 20),
    enabled: activeTab === 'trending',
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleUserClick = (user: User) => {
    navigate(`/user/${user.id}`);
  };

  const isLoading = activeTab === 'explore' ? exploreLoading : trendingLoading;
  const error = activeTab === 'explore' ? exploreError : trendingError;
  const posts = activeTab === 'explore' ? (exploreData?.content || []) : (trendingData?.content || []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Discover</h1>
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'explore'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Search size={20} />
            <span>Explore</span>
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'trending'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp size={20} />
            <span>Trending</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
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
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-500 mb-4">
            {activeTab === 'explore' 
              ? 'Failed to load explore feed. Please try again.'
              : 'Failed to load trending posts. Please try again.'
            }
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            {activeTab === 'explore' ? (
              <Search className="mx-auto h-12 w-12" />
            ) : (
              <TrendingUp className="mx-auto h-12 w-12" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'explore' ? 'No posts to explore' : 'No trending posts'}
          </h3>
          <p className="text-gray-500">
            {activeTab === 'explore' 
              ? 'Check back later for new posts from the community!'
              : 'No posts are trending right now. Be the first to create engaging content!'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostComponent key={post.id} post={post} onUserClick={handleUserClick} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
