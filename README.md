<<<<<<< HEAD
# CodeCoach - AI-Powered Coding Practice Platform

A full-stack MERN application that helps developers practice coding problems with AI-powered code reviews and personalized recommendations.

## Features

### ✅ Core Features
- **Code Validation & Testing**: Submit code and get instant feedback with AI-powered validation
- **AI Code Review**: Get AI-generated suggestions for code optimization and alternative approaches
- **Performance Analytics**: Track space-time complexity and execution metrics
- **Personalized Recommendations**: Get problem suggestions based on your solving history and performance

### 🎯 Learning Features
- **Progress Tracking**: Monitor your coding journey with detailed analytics
- **Strength/Weakness Analysis**: Understand your coding patterns and areas for improvement
- **Topic-based Learning**: Focus on specific algorithms and data structures
- **Problem Analysis**: AI-powered analysis of complexity and alternative approaches

## Tech Stack

- **Frontend**: React.js with TypeScript
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose
- **Code Validation**: Google Gemini 2.0 Flash API for intelligent code analysis
- **AI Integration**: Google Gemini API for code reviews and problem analysis
- **Authentication**: JWT tokens

## Project Structure

```
codecoach/
├── client/                 # React frontend
├── server/                 # Node.js backend
├── docs/                   # Documentation
└── README.md
```

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd codecoach
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install
   
   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp server/env.example server/.env
   ```

4. **Configure environment variables**
   ```bash
   # Edit server/.env with your credentials
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random
   GEMINI_API_KEY=your_gemini_api_key
   ```

5. **Start the application**
   ```bash
   # Start backend (from server directory)
   npm start
   
   # Start frontend (from client directory)
   npm start
   ```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

## API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Problems
- `GET /api/problems` - Get all problems
- `GET /api/problems/:id` - Get specific problem
- `GET /api/problems/:id/analysis` - Get AI analysis of problem
- `POST /api/problems/sample` - Add sample problems

### Submissions
- `POST /api/submissions` - Submit code for AI validation
- `GET /api/submissions/user/:userId` - Get user submissions
- `GET /api/submissions/:id` - Get specific submission

### AI Reviews
- `POST /api/reviews/generate` - Generate AI code review
- `GET /api/reviews/:submissionId` - Get review for submission

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details 
=======
# CodeCoach
>>>>>>> 0120db4176aee1f5c00f34086a62c8e8ef5cf4f2
