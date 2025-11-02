import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl } from '../utils/imageUtils';
import { Send, Search, MoreHorizontal, ArrowLeft, Plus, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Message, User } from '../types';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Get conversations (latest messages)
  const { data: conversations = [], isLoading: conversationsLoading, error: conversationsError } = useQuery<Message[]>({
    queryKey: ['conversations'],
    queryFn: () => apiService.getConversations(),
  });

  // Get conversation with selected user
  const { data: conversation, isLoading: conversationLoading } = useQuery<{ content: Message[] }>({
    queryKey: ['conversation', selectedUser?.id],
    queryFn: () => apiService.getConversation(selectedUser!.id, 0, 50),
    enabled: !!selectedUser,
  });

  // Get unread message count
  const { data: unreadCount } = useQuery({
    queryKey: ['unreadMessageCount'],
    queryFn: () => apiService.getUnreadMessageCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Search users for starting new conversations
  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ['userSearch', userSearchQuery],
    queryFn: () => apiService.searchUsers(userSearchQuery),
    enabled: userSearchQuery.length > 2,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => apiService.sendMessage(selectedUser!.id, content),
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['conversation', selectedUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unreadMessageCount'] });
      toast.success('Message sent!');
    },
    onError: (error: any) => {
      console.error('Send message error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to send message';
      toast.error(errorMessage);
    },
  });

  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (userId: number) => apiService.markMessagesAsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unreadMessageCount'] });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedUser) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setShowUserSearch(false);
    setUserSearchQuery('');
    // Mark messages as read when opening conversation
    markAsReadMutation.mutate(user.id);
  };

  const handleStartConversation = (user: User) => {
    setSelectedUser(user);
    setShowUserSearch(false);
    setUserSearchQuery('');
  };

  const formatTime = (dateString: string) => {
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

  const getOtherUser = (message: Message) => {
    return message.sender.id === user?.id ? message.receiver : message.sender;
  };

  const filteredConversations = conversations.filter((conversation: Message) => {
    const otherUser = getOtherUser(conversation);
    return otherUser.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
           otherUser.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           otherUser.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (conversationsLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex h-[600px]">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
                  {unreadCount && unreadCount.unreadCount > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                      {unreadCount.unreadCount} unread
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowUserSearch(!showUserSearch)}
                  className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  title="Start new conversation"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* User Search for New Conversations */}
            {showUserSearch && (
              <div className="p-4 border-b border-gray-200 bg-blue-50">
                <div className="relative mb-3">
                  <Users size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users to message..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {userSearchQuery.length > 2 && (
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {searchLoading ? (
                      <div className="text-center text-gray-500 py-2">Searching...</div>
                    ) : searchResults.length > 0 ? (
                      searchResults
                        .filter(searchUser => searchUser.id !== user?.id)
                        .map((searchUser) => (
                          <button
                            key={searchUser.id}
                            onClick={() => handleStartConversation(searchUser)}
                            className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-100 transition-colors text-left"
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                              {searchUser.profilePictureUrl ? (
                                <img
                                  src={getImageUrl(searchUser.profilePictureUrl)}
                                  alt={searchUser.username}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-semibold text-sm">
                                  {searchUser.username.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {searchUser.firstName && searchUser.lastName
                                  ? `${searchUser.firstName} ${searchUser.lastName}`
                                  : searchUser.username}
                              </p>
                              <p className="text-sm text-gray-500 truncate">@{searchUser.username}</p>
                            </div>
                          </button>
                        ))
                    ) : (
                      <div className="text-center text-gray-500 py-2">No users found</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {conversationsError ? (
                <div className="p-4 text-center text-red-500">
                  <p>Error loading conversations</p>
                  <p className="text-sm">Please try refreshing the page</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchQuery ? 'No conversations found' : (
                    <div>
                      <p className="mb-4">No messages yet</p>
                      <p className="text-sm">Start a conversation by messaging someone from their profile or posts!</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredConversations.map((conversation: Message) => {
                    const otherUser = getOtherUser(conversation);
                    const isSelected = selectedUser?.id === otherUser.id;
                    const isUnread = !conversation.isRead && conversation.receiver.id === user?.id;
                    
                    return (
                      <button
                        key={conversation.id}
                        onClick={() => handleUserSelect(otherUser)}
                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                              {otherUser.profilePictureUrl ? (
                                <img
                                  src={getImageUrl(otherUser.profilePictureUrl)}
                                  alt={otherUser.username}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-semibold text-lg">
                                  {otherUser.username.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            {isUnread && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {otherUser.firstName && otherUser.lastName
                                  ? `${otherUser.firstName} ${otherUser.lastName}`
                                  : otherUser.username}
                              </h3>
                              <span className="text-xs text-gray-500">
                                {formatTime(conversation.createdAt)}
                              </span>
                            </div>
                            <p className={`text-sm truncate ${
                              isUnread ? 'font-semibold text-gray-900' : 'text-gray-500'
                            }`}>
                              {conversation.sender.id === user?.id ? 'You: ' : ''}
                              {conversation.content}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="lg:hidden p-1 rounded-full hover:bg-gray-100"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                      {selectedUser.profilePictureUrl ? (
                        <img
                          src={getImageUrl(selectedUser.profilePictureUrl)}
                          alt={selectedUser.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold">
                          {selectedUser.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedUser.firstName && selectedUser.lastName
                          ? `${selectedUser.firstName} ${selectedUser.lastName}`
                          : selectedUser.username}
                      </h3>
                      <p className="text-sm text-gray-500">@{selectedUser.username}</p>
                    </div>
                  </div>
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {conversationLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                              <div className="h-16 bg-gray-200 rounded w-3/4"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : conversation && conversation.content && conversation.content.length > 0 ? (
                    conversation.content.map((message) => {
                      const isOwnMessage = message.sender.id === user?.id;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isOwnMessage
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No messages yet. Start the conversation!
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendMessageMutation.isPending ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <Send size={20} />
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                  <p>Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
