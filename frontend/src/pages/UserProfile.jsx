import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PostComponent from '../components/Post';
import { 
  Calendar, 
  UserPlus,
  UserMinus,
  MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUtils';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiService.getUserById(Number(userId)),
    enabled: !!userId,
  });

  const { data: followStatus } = useQuery({
    queryKey: ['followStatus', userId],
    queryFn: () => apiService.getFollowStatus(Number(userId)),
    enabled: !!userId && !!currentUser,
  });

  const { data: userPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['userPosts', userId],
    queryFn: () => apiService.getPostsByUser(Number(userId), 0, 20),
    enabled: !!userId,
  });

  useEffect(() => {
    if (followStatus) {
      setIsFollowing(followStatus.isFollowing);
      setFollowerCount(followStatus.followerCount);
      setFollowingCount(followStatus.followingCount);
    }
  }, [followStatus]);


  const followMutation = useMutation({
    mutationFn: () => apiService.followUser(Number(userId)),
    onSuccess: () => {
      setIsFollowing(true);
      setFollowerCount(prev => prev + 1);
      queryClient.invalidateQueries({ queryKey: ['followStatus', userId] });
      toast.success(`Started following ${user?.username}!`);
    },
    onError: () => {
      toast.error('Failed to follow user');
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => apiService.unfollowUser(Number(userId)),
    onSuccess: () => {
      setIsFollowing(false);
      setFollowerCount(prev => prev - 1);
      queryClient.invalidateQueries({ queryKey: ['followStatus', userId] });
      toast.success(`Unfollowed ${user?.username}`);
    },
    onError: () => {
      toast.error('Failed to unfollow user');
    },
  });

  const handleFollow = () => {
    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (userLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">User not found</h3>
        <p className="text-gray-500">The user you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Home
        </button>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="space-y-6">
      {/* Cover Photo */}
      <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden">
        {user.coverPictureUrl && (
          <img
            src={getImageUrl(user.coverPictureUrl)}
            alt="Cover"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Cover image failed to load:', user.coverPictureUrl);
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 -mt-16 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              {user.profilePictureUrl ? (
                <img
                  src={getImageUrl(user.profilePictureUrl)}
                  alt={user.username}
                  className="w-32 h-32 rounded-full object-cover"
                  onError={(e) => {
                    console.error('Profile image failed to load:', user.profilePictureUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-white font-bold text-4xl">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.username}
              </h1>
              {user.isVerified && (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <p className="text-gray-600 mb-2">@{user.username}</p>
            
            {user.bio && (
              <p className="text-gray-700 mb-3">{user.bio}</p>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-1">
                <Calendar size={16} />
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            {!isOwnProfile && currentUser && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleFollow}
                  disabled={followMutation.isPending || unfollowMutation.isPending}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isFollowing
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {followMutation.isPending || unfollowMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : isFollowing ? (
                    <>
                      <UserMinus size={16} />
                      <span>Unfollow</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      <span>Follow</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => navigate('/messages')}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  <MessageCircle size={16} />
                  <span>Message</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-6 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{userPosts.length}</div>
            <div className="text-sm text-gray-500">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{followerCount}</div>
            <div className="text-sm text-gray-500">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{followingCount}</div>
            <div className="text-sm text-gray-500">Following</div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Posts</h2>
        
        {postsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : userPosts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500">
              {isOwnProfile 
                ? 'Share your first post to get started!'
                : `${user.username} hasn't shared any posts yet.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {userPosts.map((post) => (
              <PostComponent key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
