import React, { useState } from 'react';
import { Image, MapPin, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUtils';
import { useNavigate } from 'react-router-dom';

const CreatePost: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'FRIENDS' | 'PRIVATE'>('PUBLIC');
  const [location, setLocation] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      let imageUrl = '';
      if (selectedImage) {
        const uploadResult = await apiService.uploadPostImage(selectedImage);
        imageUrl = uploadResult.fileUrl;
      }
      
      return apiService.createPost({
        ...postData,
        imageUrl: imageUrl || undefined,
      });
    },
    onSuccess: () => {
      setContent('');
      setLocation('');
      setSelectedImage(null);
      setImagePreview(null);
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['newsFeed'] });
      toast.success('Post created successfully!');
    },
    onError: (error: any) => {
      console.error('Create post error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create post';
      toast.error(errorMessage);
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to create a post');
      navigate('/login');
      return;
    }
    if (!content.trim()) {
      toast.error('Please enter some content for your post');
      return;
    }
    
    if (content.trim().length > 2000) {
      toast.error('Post content is too long. Please keep it under 2000 characters.');
      return;
    }
    
    createPostMutation.mutate({
      content: content.trim(),
      privacy,
      location: location.trim() || undefined,
      type: selectedImage ? 'IMAGE' : 'TEXT',
    });
  };

  const handleClose = () => {
    setContent('');
    setLocation('');
    setSelectedImage(null);
    setImagePreview(null);
    setIsOpen(false);
  };


  if (!isOpen) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
            {user?.profilePictureUrl ? (
              <img
                src={getImageUrl(user.profilePictureUrl)}
                alt={user.username}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  console.error('Profile image failed to load:', user.profilePictureUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <span className="text-white font-semibold text-lg">
                {user?.username?.charAt(0).toUpperCase() ?? '+'}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              if (!user) {
                navigate('/login');
              } else {
                setIsOpen(true);
              }
            }}
            className="flex-1 text-left px-6 py-3 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200 border border-gray-200 hover:border-gray-300"
          >
            What's on your mind?
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Create Post</h3>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Info */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
            {user?.profilePictureUrl ? (
              <img
                src={getImageUrl(user.profilePictureUrl)}
                alt={user.username}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  console.error('Profile image failed to load:', user.profilePictureUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <span className="text-white font-semibold text-lg">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.username}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as 'PUBLIC' | 'FRIENDS' | 'PRIVATE')}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PUBLIC">🌍 Public</option>
                <option value="FRIENDS">👥 Friends</option>
                <option value="PRIVATE">🔒 Private</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
            rows={4}
            maxLength={2000}
          />
          <div className="flex justify-end mt-1">
            <span className={`text-sm ${content.length > 1800 ? 'text-red-500' : 'text-gray-400'}`}>
              {content.length}/2000
            </span>
          </div>
        </div>

        {/* Location */}
        <div className="relative">
          <MapPin size={20} className="absolute left-4 top-3 text-gray-400" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Add location (optional)"
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
          />
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full rounded-xl object-cover max-h-80 shadow-sm"
            />
            <button
              type="button"
              onClick={() => {
                setSelectedImage(null);
                setImagePreview(null);
              }}
              className="absolute top-3 right-3 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 cursor-pointer transition-colors">
              <Image size={20} />
              <span className="font-medium">Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim() || createPostMutation.isPending}
              className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg font-medium"
            >
              {createPostMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Posting...</span>
                </div>
              ) : (
                'Post'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
