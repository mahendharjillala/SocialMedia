export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  profilePictureUrl?: string;
  coverPictureUrl?: string;
  createdAt: string;
  isVerified?: boolean;
}

export interface Post {
  id: number;
  content: string;
  createdAt: string;
  updatedAt?: string;
  user: User;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'LINK';
  privacy: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  imageUrl?: string;
  videoUrl?: string;
  location?: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isActive: boolean;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt?: string;
  user: User;
  post: Post;
  parentComment?: Comment;
  likeCount: number;
  isActive: boolean;
}

export interface Like {
  id: number;
  user: User;
  post: Post;
  createdAt: string;
}

export interface Follow {
  id: number;
  follower: User;
  following: User;
  createdAt: string;
}

export interface Notification {
  id: number;
  message: string;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'MENTION' | 'POST_SHARE';
  isRead: boolean;
  createdAt: string;
  user: User;
  fromUser?: User;
  post?: Post;
  comment?: Comment;
}

export interface Message {
  id: number;
  content: string;
  createdAt: string;
  updatedAt?: string;
  sender: User;
  receiver: User;
  isRead: boolean;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  content: T[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
