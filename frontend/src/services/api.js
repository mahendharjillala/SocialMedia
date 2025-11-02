import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';

import type { 
  User, 
  Post, 
  Comment, 
  Notification, 
  Message,
  AuthResponse, 
  LoginRequest, 
  RegisterRequest,
  ApiResponse,
  PaginatedResponse
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:8084/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response: AxiosResponse<any> = await this.api.post('/auth/register', data);
    // Extract the AuthResponse from the backend response format
    return {
      token: response.data.token,
      type: response.data.type,
      user: response.data.user
    };
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<any> = await this.api.post('/auth/login', data);
      console.log('Raw login response:', response.data);
      
      // Check if the response has the expected structure
      if (!response.data.token || !response.data.user) {
        throw new Error('Invalid response format from server');
      }
      
      // Extract the AuthResponse from the backend response format
      return {
        token: response.data.token,
        type: response.data.type,
        user: response.data.user
      };
    } catch (error: any) {
      console.error('Login API error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<any> = await this.api.get('/auth/me');
    return response.data.user;
  }

  // User endpoints
  async getUserProfile(): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/user/profile');
    return response.data.data!;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.put('/user/profile', data);
    return response.data.data!;
  }

  async searchUsers(query: string): Promise<User[]> {
    const response: AxiosResponse<ApiResponse<User[]>> = await this.api.get(`/user/search?query=${query}`);
    return response.data.data!;
  }

  async getUserById(userId: number): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get(`/user/${userId}`);
    return response.data.data!;
  }

  // Post endpoints
  async createPost(data: Partial<Post>): Promise<Post> {
    const response: AxiosResponse<any> = await this.api.post('/post', data);
    const raw = response.data?.data ?? response.data;
    return this.mapPost(raw);
  }

  async getPostById(postId: number): Promise<Post> {
    const response: AxiosResponse<any> = await this.api.get(`/post/${postId}`);
    // Backend returns PostDTO directly (with 'author')
    return this.mapPost(response.data);
  }

  async updatePost(postId: number, data: Partial<Post>): Promise<Post> {
    const response: AxiosResponse<ApiResponse<Post>> = await this.api.put(`/post/${postId}`, data);
    return response.data.data!;
  }

  async deletePost(postId: number): Promise<boolean> {
    const response: AxiosResponse<ApiResponse<boolean>> = await this.api.delete(`/post/${postId}`);
    return response.data.success!;
  }

  async getAllPosts(page: number = 0, size: number = 10): Promise<Post[]> {
    const response: AxiosResponse<Post[]> = await this.api.get(`/post?page=${page}&size=${size}`);
    return response.data;
  }

  async getPostsByUser(userId: number, page: number = 0, size: number = 10): Promise<Post[]> {
    const response: AxiosResponse<any> = await this.api.get(`/post/user/${userId}?page=${page}&size=${size}`);
    if (response.data.success === false) {
      throw new Error(response.data.error || 'Failed to fetch user posts');
    }
    return (response.data.content || []).map((p: any) => this.mapPost(p));
  }

  // Like endpoints
  async likePost(postId: number): Promise<{ success: boolean; likeCount: number }> {
    const response: AxiosResponse<ApiResponse<{ success: boolean; likeCount: number }>> = 
      await this.api.post(`/like/post/${postId}`);
    return response.data.data!;
  }

  async unlikePost(postId: number): Promise<{ success: boolean; likeCount: number }> {
    const response: AxiosResponse<ApiResponse<{ success: boolean; likeCount: number }>> = 
      await this.api.delete(`/like/post/${postId}`);
    return response.data.data!;
  }

  async getLikeStatus(postId: number): Promise<{ isLiked: boolean; likeCount: number }> {
    const response: AxiosResponse<ApiResponse<{ isLiked: boolean; likeCount: number }>> = 
      await this.api.get(`/like/post/${postId}/status`);
    return response.data.data!;
  }

  // Comment endpoints
  async createComment(postId: number, content: string, parentCommentId?: number): Promise<Comment> {
    const response: AxiosResponse<ApiResponse<Comment>> = await this.api.post(`/comment/post/${postId}`, {
      content,
      parentCommentId
    });
    return response.data.data!;
  }

  async getCommentsByPost(postId: number): Promise<Comment[]> {
    const response: AxiosResponse<ApiResponse<Comment[]>> = await this.api.get(`/comment/post/${postId}`);
    return response.data.data!;
  }

  async updateComment(commentId: number, content: string): Promise<Comment> {
    const response: AxiosResponse<ApiResponse<Comment>> = await this.api.put(`/comment/${commentId}`, {
      content
    });
    return response.data.data!;
  }

  async deleteComment(commentId: number): Promise<boolean> {
    const response: AxiosResponse<ApiResponse<boolean>> = await this.api.delete(`/comment/${commentId}`);
    return response.data.success!;
  }

  // Follow endpoints
  async followUser(userId: number): Promise<{ success: boolean }> {
    const response: AxiosResponse<ApiResponse<{ success: boolean }>> = 
      await this.api.post(`/follow/${userId}`);
    return response.data.data!;
  }

  async unfollowUser(userId: number): Promise<{ success: boolean }> {
    const response: AxiosResponse<ApiResponse<{ success: boolean }>> = 
      await this.api.delete(`/follow/${userId}`);
    return response.data.data!;
  }

  async getFollowers(userId: number): Promise<User[]> {
    const response: AxiosResponse<ApiResponse<User[]>> = await this.api.get(`/follow/${userId}/followers`);
    return response.data.data!;
  }

  async getFollowing(userId: number): Promise<User[]> {
    const response: AxiosResponse<ApiResponse<User[]>> = await this.api.get(`/follow/${userId}/following`);
    return response.data.data!;
  }

  async getFollowStatus(userId: number): Promise<{ 
    isFollowing: boolean; 
    followerCount: number; 
    followingCount: number 
  }> {
    const response: AxiosResponse<ApiResponse<{ 
      isFollowing: boolean; 
      followerCount: number; 
      followingCount: number 
    }>> = await this.api.get(`/follow/${userId}/status`);
    return response.data.data!;
  }

  // Feed endpoints
  async getNewsFeed(page: number = 0, size: number = 10): Promise<PaginatedResponse<Post>> {
    const response: AxiosResponse<any> = 
      await this.api.get(`/feed/news?page=${page}&size=${size}`);
    
    // Handle the backend response format which has success field and direct data
    if (response.data.success === false) {
      throw new Error(response.data.error || 'Failed to fetch news feed');
    }
    
    return {
      content: (response.data.content || []).map((p: any) => this.mapPost(p)),
      currentPage: response.data.currentPage || 0,
      totalPages: response.data.totalPages || 0,
      totalElements: response.data.totalElements || 0,
      hasNext: response.data.hasNext || false,
      hasPrevious: response.data.hasPrevious || false,
    };
  }

  async getExploreFeed(page: number = 0, size: number = 10): Promise<PaginatedResponse<Post>> {
    const response: AxiosResponse<any> = 
      await this.api.get(`/feed/explore?page=${page}&size=${size}`);
    
    // Handle the backend response format which has success field and direct data
    if (response.data.success === false) {
      throw new Error(response.data.error || 'Failed to fetch explore feed');
    }
    
    return {
      content: (response.data.content || []).map((p: any) => this.mapPost(p)),
      currentPage: response.data.currentPage || 0,
      totalPages: response.data.totalPages || 0,
      totalElements: response.data.totalElements || 0,
      hasNext: response.data.hasNext || false,
      hasPrevious: response.data.hasPrevious || false,
    };
  }

  async getTrendingPosts(page: number = 0, size: number = 10): Promise<PaginatedResponse<Post>> {
    const response: AxiosResponse<any> = 
      await this.api.get(`/feed/trending?page=${page}&size=${size}`);
    
    // Handle the backend response format which has success field and direct data
    if (response.data.success === false) {
      throw new Error(response.data.error || 'Failed to fetch trending posts');
    }
    
    return {
      content: (response.data.content || []).map((p: any) => this.mapPost(p)),
      currentPage: response.data.currentPage || 0,
      totalPages: response.data.totalPages || 0,
      totalElements: response.data.totalElements || 0,
      hasNext: response.data.hasNext || false,
      hasPrevious: response.data.hasPrevious || false,
    };
  }

  async searchPosts(query: string, page: number = 0, size: number = 10): Promise<PaginatedResponse<Post>> {
    const response: AxiosResponse<any> = 
      await this.api.get(`/feed/search?query=${query}&page=${page}&size=${size}`);
    
    // Handle the backend response format which has success field and direct data
    if (response.data.success === false) {
      throw new Error(response.data.error || 'Failed to search posts');
    }
    
    return {
      content: (response.data.content || []).map((p: any) => this.mapPost(p)),
      currentPage: response.data.currentPage || 0,
      totalPages: response.data.totalPages || 0,
      totalElements: response.data.totalElements || 0,
      hasNext: response.data.hasNext || false,
      hasPrevious: response.data.hasPrevious || false,
    };
  }

  // Notification endpoints
  async getNotifications(): Promise<Notification[]> {
    const response: AxiosResponse<ApiResponse<Notification[]>> = await this.api.get('/notifications');
    return response.data.data!;
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    const response: AxiosResponse<ApiResponse<Notification[]>> = await this.api.get('/notifications/unread');
    return response.data.data!;
  }

  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const response: AxiosResponse<ApiResponse<{ unreadCount: number }>> = await this.api.get('/notifications/unread/count');
    return response.data.data!;
  }

  async markNotificationAsRead(notificationId: number): Promise<boolean> {
    const response: AxiosResponse<ApiResponse<boolean>> = 
      await this.api.put(`/notifications/${notificationId}/read`);
    return response.data.data!;
  }

  async markAllNotificationsAsRead(): Promise<boolean> {
    const response: AxiosResponse<ApiResponse<boolean>> = 
      await this.api.put('/notifications/read-all');
    return response.data.data!;
  }

  // File upload endpoints
  async uploadProfilePicture(file: File): Promise<{ fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response: AxiosResponse<any> = 
      await this.api.post('/upload/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    return response.data.data;
  }

  async uploadCoverPicture(file: File): Promise<{ fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response: AxiosResponse<any> = 
      await this.api.post('/upload/cover-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    return response.data.data;
  }

  async uploadPostImage(file: File): Promise<{ fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response: AxiosResponse<ApiResponse<{ fileUrl: string }>> = 
      await this.api.post('/upload/post-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    return response.data.data!;
  }

  // Message endpoints
  async sendMessage(receiverId: number, content: string): Promise<Message> {
    const response: AxiosResponse<ApiResponse<Message>> = 
      await this.api.post('/messages/send', { receiverId, content });
    return response.data.data!;
  }

  async getConversation(userId: number, page: number = 0, size: number = 20): Promise<PaginatedResponse<Message>> {
    const response: AxiosResponse<any> = 
      await this.api.get(`/messages/conversation/${userId}?page=${page}&size=${size}`);
    
    if (response.data.success === false) {
      throw new Error(response.data.error || 'Failed to fetch conversation');
    }
    
    // The backend returns Page<Message> directly in data field
    const pageData = response.data.data;
    
    return {
      content: pageData.content || [],
      currentPage: pageData.number || 0,
      totalPages: pageData.totalPages || 0,
      totalElements: pageData.totalElements || 0,
      hasNext: pageData.hasNext || false,
      hasPrevious: pageData.hasPrevious || false,
    };
  }

  async getConversations(): Promise<Message[]> {
    const response: AxiosResponse<ApiResponse<Message[]>> = 
      await this.api.get('/messages/conversations');
    return response.data.data!;
  }

  async getUnreadMessageCount(): Promise<{ unreadCount: number }> {
    const response: AxiosResponse<ApiResponse<{ unreadCount: number }>> = 
      await this.api.get('/messages/unread/count');
    return response.data.data!;
  }

  async getUnreadMessages(): Promise<Message[]> {
    const response: AxiosResponse<ApiResponse<Message[]>> = 
      await this.api.get('/messages/unread');
    return response.data.data!;
  }

  async markMessagesAsRead(userId: number): Promise<boolean> {
    const response: AxiosResponse<ApiResponse<boolean>> = 
      await this.api.put(`/messages/mark-read/${userId}`);
    return response.data.success!;
  }

  async deleteMessage(messageId: number): Promise<boolean> {
    const response: AxiosResponse<ApiResponse<boolean>> = 
      await this.api.delete(`/messages/${messageId}`);
    return response.data.success!;
  }

  // Helper to normalize PostDTO (backend) to Post (frontend)
  private mapPost = (raw: any): Post => {
    if (!raw) return raw as Post;
    // If backend sends 'author', map it to 'user'
    const user = raw.user ?? raw.author ?? raw.owner;
    return {
      id: raw.id,
      content: raw.content,
      createdAt: String(raw.createdAt),
      updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
      user: user,
      type: raw.type,
      privacy: raw.privacy,
      imageUrl: raw.imageUrl,
      videoUrl: raw.videoUrl,
      location: raw.location,
      likeCount: raw.likeCount ?? 0,
      commentCount: raw.commentCount ?? 0,
      shareCount: raw.shareCount ?? 0,
      isActive: raw.isActive ?? raw.active ?? true,
    } as Post;
  }
}

export const apiService = new ApiService();
