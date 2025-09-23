# Social Media App - Spring Boot

A comprehensive social media application built with Spring Boot, featuring user authentication, posts, likes, comments, follows, notifications, and file uploads.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- User registration and login
- Password encryption with BCrypt
- Role-based access control

### 👤 User Management
- User profiles with bio, profile pictures, and cover photos
- User search functionality
- Profile updates
- User verification system

### 📝 Posts
- Create, read, update, and delete posts
- Support for text, image, and video posts
- Post privacy settings (Public, Friends, Private)
- Post location tagging
- Post engagement metrics (likes, comments, shares)

### ❤️ Social Features
- Like and unlike posts
- Comment on posts with nested replies
- Follow and unfollow users
- Real-time notifications
- News feed with posts from followed users

### 🔔 Notifications
- Like notifications
- Comment notifications
- Follow notifications
- Mention notifications
- Mark notifications as read/unread

### 📁 File Upload
- Profile picture uploads
- Cover photo uploads
- Post image uploads
- File size validation
- Secure file storage

### 🔍 Discovery
- Explore feed with trending posts
- Search posts by content
- Search users by name/username
- Trending posts based on engagement

## Technology Stack

- **Backend**: Spring Boot 3.5.5
- **Database**: MySQL
- **Security**: Spring Security with JWT
- **ORM**: Spring Data JPA with Hibernate
- **File Storage**: Local file system
- **Build Tool**: Maven
- **Java Version**: 24

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user details

### User Management
- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/search?query={query}` - Search users
- `GET /api/user/{userId}` - Get user by ID

### Posts
- `POST /api/post` - Create a new post
- `GET /api/post/{postId}` - Get post by ID
- `PUT /api/post/{postId}` - Update post
- `DELETE /api/post/{postId}` - Delete post
- `GET /api/post` - Get all posts (paginated)
- `GET /api/post/user/{userId}` - Get posts by user

### Social Features
- `POST /api/like/post/{postId}` - Like a post
- `DELETE /api/like/post/{postId}` - Unlike a post
- `GET /api/like/post/{postId}/status` - Get like status

- `POST /api/comment/post/{postId}` - Add comment to post
- `GET /api/comment/post/{postId}` - Get comments for post
- `PUT /api/comment/{commentId}` - Update comment
- `DELETE /api/comment/{commentId}` - Delete comment

- `POST /api/follow/{userId}` - Follow a user
- `DELETE /api/follow/{userId}` - Unfollow a user
- `GET /api/follow/{userId}/followers` - Get user's followers
- `GET /api/follow/{userId}/following` - Get users that user follows
- `GET /api/follow/{userId}/status` - Get follow status

### Feed
- `GET /api/feed/news` - Get news feed (posts from followed users)
- `GET /api/feed/explore` - Get explore feed (all posts)
- `GET /api/feed/trending` - Get trending posts
- `GET /api/feed/user/{userId}` - Get posts by specific user
- `GET /api/feed/search?query={query}` - Search posts

### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/unread` - Get unread notifications
- `GET /api/notifications/unread/count` - Get unread count
- `PUT /api/notifications/{notificationId}/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read

### File Upload
- `POST /api/upload/profile-picture` - Upload profile picture
- `POST /api/upload/cover-picture` - Upload cover picture
- `POST /api/upload/post-image` - Upload post image

## Database Schema

### Users Table
- id, username, email, password
- firstName, lastName, bio
- profilePictureUrl, coverPictureUrl
- createdAt, lastLoginAt
- role, isActive, isVerified

### Posts Table
- id, content, createdAt, updatedAt
- user_id, type, privacy
- imageUrl, videoUrl, location
- likeCount, commentCount, shareCount
- isActive

### Follows Table
- id, follower_id, following_id, createdAt

### Likes Table
- id, user_id, post_id, createdAt

### Comments Table
- id, content, createdAt, updatedAt
- user_id, post_id, parent_comment_id
- likeCount, isActive

### Notifications Table
- id, message, type, isRead, createdAt
- user_id, from_user_id, post_id, comment_id

## Setup Instructions

### Prerequisites
- Java 24 or higher
- Maven 3.6+
- MySQL 8.0+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Socialmedia_app
   ```

2. **Create MySQL Database**
   ```sql
   CREATE DATABASE socialmedia_db;
   ```

3. **Update Database Configuration**
   Edit `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/socialmedia_db
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

4. **Build and Run**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

5. **Access the Application**
   - API Base URL: `http://localhost:8083`
   - Health Check: `http://localhost:8083/actuator/health`

## Configuration

### JWT Configuration
```properties
app.jwt.secret=your-secret-key
app.jwt.expiration=86400
```

### File Upload Configuration
```properties
app.upload.dir=uploads
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

## API Usage Examples

### Register a User
```bash
curl -X POST http://localhost:8083/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:8083/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "password123"
  }'
```

### Create a Post (with JWT token)
```bash
curl -X POST http://localhost:8083/api/post \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "content": "Hello, world!",
    "type": "TEXT",
    "privacy": "PUBLIC"
  }'
```

### Follow a User
```bash
curl -X POST http://localhost:8083/api/follow/2 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Security Features

- JWT token-based authentication
- Password encryption with BCrypt
- CORS configuration for cross-origin requests
- Input validation and sanitization
- File upload security
- Role-based access control

## Error Handling

The application includes comprehensive error handling with:
- Validation error responses
- Authentication error handling
- File upload error handling
- Global exception handling
- Consistent error response format

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
# SocialMediaBackend
