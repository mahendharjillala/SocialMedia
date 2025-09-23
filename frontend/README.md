# Social Media Frontend - React + Vite

A modern, responsive social media frontend built with React, TypeScript, and Vite, designed to work with the Spring Boot social media backend.

## Features

### 🔐 Authentication
- User registration and login
- JWT token-based authentication
- Protected routes
- Automatic token refresh

### 👤 User Management
- User profiles with bio, profile pictures, and cover photos
- Profile editing
- User search functionality
- Follow/unfollow system

### 📝 Posts
- Create posts with text, images, and location
- Post privacy settings (Public, Friends, Private)
- Like and unlike posts
- Comment system with nested replies
- Post engagement metrics

### 🔔 Social Features
- Real-time notifications
- News feed with posts from followed users
- Explore feed with trending posts
- User search and discovery

### 📱 Responsive Design
- Mobile-first design
- Responsive navigation
- Touch-friendly interface
- Modern UI components

## Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Yup validation
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with navigation
│   ├── Post.tsx        # Post component
│   ├── CreatePost.tsx  # Post creation form
│   └── CommentSection.tsx # Comments component
├── pages/              # Page components
│   ├── Home.tsx        # News feed
│   ├── Explore.tsx     # Explore/trending posts
│   ├── Profile.tsx     # User profile
│   ├── UserProfile.tsx # Other user profiles
│   ├── Notifications.tsx # Notifications page
│   ├── Search.tsx      # Search functionality
│   ├── Login.tsx       # Login page
│   └── Register.tsx    # Registration page
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── services/           # API services
│   └── api.ts         # API client
├── types/             # TypeScript type definitions
│   └── index.ts       # Shared types
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
└── assets/            # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Running Spring Boot backend (see backend README)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd socialmedia-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8083/api
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The frontend communicates with the Spring Boot backend through a comprehensive API service layer:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/post` - Get all posts
- `POST /api/post` - Create new post
- `PUT /api/post/:id` - Update post
- `DELETE /api/post/:id` - Delete post

### Social Features
- `POST /api/like/post/:id` - Like post
- `DELETE /api/like/post/:id` - Unlike post
- `POST /api/comment/post/:id` - Add comment
- `POST /api/follow/:id` - Follow user
- `DELETE /api/follow/:id` - Unfollow user

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read

## Key Features

### Responsive Design
- Mobile-first approach
- Responsive navigation with mobile menu
- Touch-friendly interactions
- Optimized for all screen sizes

### State Management
- React Query for server state
- Context API for authentication
- Local state with React hooks
- Optimistic updates

### User Experience
- Loading states and skeletons
- Error handling with user feedback
- Toast notifications
- Smooth animations and transitions

### Security
- JWT token management
- Automatic token refresh
- Protected routes
- Input validation

## Customization

### Styling
The app uses Tailwind CSS for styling. You can customize the design by:

1. Modifying `tailwind.config.js` for theme customization
2. Adding custom CSS in `src/App.css`
3. Using Tailwind utility classes in components

### API Configuration
Update the API base URL in `src/services/api.ts` to point to your backend server.

### Adding New Features
1. Create new components in `src/components/`
2. Add new pages in `src/pages/`
3. Extend the API service in `src/services/api.ts`
4. Add new types in `src/types/index.ts`

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.# SocialMediaFrontend
