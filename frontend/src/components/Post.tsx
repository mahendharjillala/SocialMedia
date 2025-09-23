import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share, MoreHorizontal, MapPin, Calendar, Send, Edit, Trash2 } from 'lucide-react';
import type { Post as PostType, User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import CommentSection from './CommentSection';
import { getImageUrl } from '../utils/imageUtils';
import { useNavigate } from 'react-router-dom';

interface PostProps {
  post: PostType;
  onUserClick?: (user: User) => void;
}

const Post: React.FC<PostProps> = ({ post, onUserClick }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get initial like status
  const { data: likeStatus } = useQuery({
    queryKey: ['likeStatus', post.id],
    queryFn: () => apiService.getLikeStatus(post.id),
    enabled: !!user, // Only run if user is authenticated
  });

  // Update local state when like status is fetched
  useEffect(() => {
    if (likeStatus) {
      setIsLiked(likeStatus.isLiked);
      setLikeCount(likeStatus.likeCount);
    }
  }, [likeStatus]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const likeMutation = useMutation({
    mutationFn: () => apiService.likePost(post.id),
    onSuccess: (data) => {
      setIsLiked(true);
      setLikeCount(data.likeCount);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['newsFeed'] });
      queryClient.invalidateQueries({ queryKey: ['likeStatus', post.id] });
      toast.success('Post liked!');
    },
    onError: () => {
      toast.error('Failed to like post');
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: () => apiService.unlikePost(post.id),
    onSuccess: (data) => {
      setIsLiked(false);
      setLikeCount(data.likeCount);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['newsFeed'] });
      queryClient.invalidateQueries({ queryKey: ['likeStatus', post.id] });
      toast.success('Post unliked!');
    },
    onError: () => {
      toast.error('Failed to unlike post');
    },
  });

  // Edit post mutation
  const editPostMutation = useMutation({
    mutationFn: (content: string) => apiService.updatePost(post.id, { content }),
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['newsFeed'] });
      toast.success('Post updated successfully!');
    },
    onError: (error: any) => {
      console.error('Edit post error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update post';
      toast.error(errorMessage);
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: () => apiService.deletePost(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['newsFeed'] });
      toast.success('Post deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Delete post error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to delete post';
      toast.error(errorMessage);
    },
  });

  const handleLike = () => {
    if (isLiked) {
      unlikeMutation.mutate();
    } else {
      likeMutation.mutate();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleUserClick = () => {
    if (onUserClick) {
      onUserClick(post.user);
    }
  };

  const handleMessageUser = () => {
    if (user?.id !== post.user.id) {
      navigate('/messages');
      // You could also pass the user ID as a query parameter to pre-select the conversation
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(post.content);
    setShowMenu(false);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }
    if (editContent.trim().length > 2000) {
      toast.error('Post content is too long. Please keep it under 2000 characters.');
      return;
    }
    editPostMutation.mutate(editContent.trim());
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(post.content);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      deletePostMutation.mutate();
    }
    setShowMenu(false);
  };


  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Post Header */}
      <div className="flex items-start justify-between p-6 pb-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <button 
            onClick={handleUserClick} 
            className="flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
              {post.user.profilePictureUrl ? (
                <img
                  src={getImageUrl(post.user.profilePictureUrl)}
                  alt={post.user.username}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    console.error('Profile image failed to load:', post.user.profilePictureUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-white font-semibold text-lg">
                  {post.user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </button>
          <div className="flex-1 min-w-0">
            <button onClick={handleUserClick} className="text-left hover:opacity-80 transition-opacity">
              <h3 className="font-semibold text-gray-900 hover:text-blue-600 truncate">
                {post.user.firstName && post.user.lastName
                  ? `${post.user.firstName} ${post.user.lastName}`
                  : post.user.username}
              </h3>
              <p className="text-sm text-gray-500 truncate">@{post.user.username}</p>
            </button>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
              <Calendar size={14} className="flex-shrink-0" />
              <span className="truncate">{formatDate(post.createdAt)}</span>
              {post.location && (
                <>
                  <span>•</span>
                  <MapPin size={14} className="flex-shrink-0" />
                  <span className="truncate">{post.location}</span>
                </>
              )}
            </div>
          </div>
        </div>
        {user?.id === post.user.id && (
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <MoreHorizontal size={20} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="px-6 pb-4">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
              rows={3}
              maxLength={2000}
            />
            <div className="flex justify-between items-center">
              <span className={`text-sm ${editContent.length > 1800 ? 'text-red-500' : 'text-gray-400'}`}>
                {editContent.length}/2000
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={editPostMutation.isPending}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {editPostMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{post.content}</p>
        )}
        {post.imageUrl && (
          <div className="mt-4">
            <img
              src={getImageUrl(post.imageUrl)}
              alt="Post image"
              className="w-full rounded-lg object-cover max-h-96 shadow-sm"
              onError={(e) => {
                console.error('Post image failed to load:', post.imageUrl);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        {post.videoUrl && (
          <div className="mt-4">
            <video
              src={post.videoUrl}
              controls
              className="w-full rounded-lg max-h-96 shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Post Stats */}
      <div className="px-6 pb-3">
        <div className="flex items-center space-x-6 text-sm text-gray-500">
          {likeCount > 0 && (
            <span className="font-medium">{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
          )}
          {post.commentCount > 0 && (
            <span className="font-medium">{post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}</span>
          )}
          {post.shareCount > 0 && (
            <span className="font-medium">{post.shareCount} {post.shareCount === 1 ? 'share' : 'shares'}</span>
          )}
        </div>
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
        <button
          onClick={handleLike}
          disabled={likeMutation.isPending || unlikeMutation.isPending}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            isLiked
              ? 'text-red-500 hover:bg-red-50'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
          } ${likeMutation.isPending || unlikeMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Heart size={20} className={isLiked ? 'fill-current' : ''} />
          <span className="font-medium">Like</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all duration-200"
        >
          <MessageCircle size={20} />
          <span className="font-medium">Comment</span>
        </button>

        {user?.id !== post.user.id && (
          <button
            onClick={handleMessageUser}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all duration-200"
          >
            <Send size={20} />
            <span className="font-medium">Message</span>
          </button>
        )}

        <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all duration-200">
          <Share size={20} />
          <span className="font-medium">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 bg-gray-50">
          <CommentSection postId={post.id} />
        </div>
      )}
    </article>
  );
};

export default Post;
