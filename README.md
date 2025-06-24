# Jante ChAi - Government Services Chat Assistant

A web application that helps users get information about government services through an AI-powered chat interface. Built as a course project to demonstrate full-stack development with modern web technologies.

## What This Project Does

This is a government services portal where users can:
- Chat with an AI assistant about various government services (National ID, Passport, Birth Certificate, etc.)
- Get step-by-step guidance on application processes
- Access their service history and documents

## Tech Stack

**Frontend:**
- HTML5, CSS3, Vanilla JavaScript
- Bootstrap 5 for responsive design
- Font Awesome for icons

**Backend:**
- Node.js with Express.js
- MongoDB for database
- JWT for authentication
- bcrypt for password hashing

**Key Features:**
- Real-time chat interface
- Multi-language support (English/Bengali)
- Responsive design for mobile/desktop
- User authentication and profiles
- Session management

## Project Structure

```
Jante_ch-AI/
├── assets/                 # Static assets (CSS, images)
├── js/                    # Frontend JavaScript modules
│   ├── auth/             # Authentication system
│   ├── components/       # Reusable UI components
│   └── utils/           # Utility functions
├── pages/                # HTML pages
├── server/               # Backend Node.js application
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic
│   └── services/        # External service integrations
└── package.json
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Jante_ch-AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/jante-chai
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## How to Use

### For Users
1. Visit the homepage and click "Get Started"
2. Create an account or log in
3. Use the chat interface to ask about government services
4. Browse your dashboard for service history

### For Developers
- Frontend code is in the root directory
- Backend API is in the `server/` folder
- Authentication logic is in `js/auth/`
- Database models are in `server/config/`

## Key Components Explained

### Authentication System
The app uses JWT tokens stored in HTTP-only cookies for security. Users can register, login, and manage their profiles through the auth system.

### Chat Interface
The chat system provides pre-programmed responses about government services. It supports both English and Bengali languages.

### State Management
User state is managed through a custom state management system that handles authentication, user preferences, and UI state.

## Development Notes

### Code Style
- Use camelCase for JavaScript variables and functions
- Use kebab-case for CSS classes and HTML IDs
- Use PascalCase for component names
- Add meaningful comments for complex logic

### Database Schema
Users collection stores:
- Basic info (email, name, mobile)
- Authentication data (hashed password)
- Preferences (language, theme)
- Timestamps (created, updated, last login)

### API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

## Common Issues & Solutions

**MongoDB Connection Error:**
- Check if MongoDB is running
- Verify connection string in .env file
- Ensure network access if using Atlas

**Authentication Issues:**
- Clear browser cookies
- Check JWT_SECRET in environment
- Verify token expiration settings

**CORS Errors:**
- Update CORS settings in server.js
- Check frontend URL configuration

## License

This project is for educational purposes only.