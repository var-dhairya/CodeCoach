# CodeCoach - AI-Powered Coding Practice Platform

A comprehensive platform for practicing coding problems with AI-powered code review and analysis.

## 🚀 Features

- **AI-Powered Code Review**: Uses Google Gemini AI for intelligent code analysis
- **Code Validation**: AI-powered code analysis and validation
- **Problem Management**: Import problems from Kattis and manage custom problems
- **User Analytics**: Track progress, streaks, and performance metrics
- **Multi-language Support**: JavaScript, Python, Java, C++
- **Responsive UI**: Modern React + Tailwind CSS interface

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd CodeCoach
   ```

2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Start development servers:**
   ```bash
   npm run dev
   ```

## 🚀 Deployment

### Vercel Deployment (Recommended)

This project is configured for easy deployment on Vercel. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick Deploy:**
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Alternative Deployment Options

- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Railway, Render, Heroku, DigitalOcean
- **Database**: MongoDB Atlas (already configured)

## 🏗️ Project Structure

```
CodeCoach/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   ├── pages/          # Page components
│   │   ├── config/         # Configuration files
│   │   └── ...
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic services
│   │   └── index.js        # Main server file
│   ├── .env                # Environment variables
│   └── package.json
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key

### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Required environment variables:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_google_gemini_api_key

   PORT=5000
   NODE_ENV=development
   JWT_EXPIRE=7d
   ```

4. **Start the server:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

### Frontend Setup

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create `.env` file:
   ```env
   REACT_APP_API_BASE_URL=http://localhost:5000
   REACT_APP_ENV=development
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `GEMINI_API_KEY`: Google Gemini AI API key

- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `JWT_EXPIRE`: JWT token expiration (default: 7d)

#### Frontend (.env)
- `REACT_APP_API_BASE_URL`: Backend API base URL
- `REACT_APP_ENV`: Environment (development/production)

### API Endpoints

- **Auth**: `/api/auth/*` - Login, register, profile management
- **Problems**: `/api/problems/*` - Problem CRUD operations
- **Submissions**: `/api/submissions` - Code submission and validation
- **Analytics**: `/api/analytics/*` - User progress and statistics
- **Import**: `/api/import/*` - Import problems from external sources

## 🚀 Running the Application

1. **Start the backend server:**
   ```bash
   cd server
   npm start
   ```

2. **Start the frontend:**
   ```bash
   cd client
   npm start
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health check: http://localhost:5000/api/health

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test
```

### Frontend Tests
```bash
cd client
npm test
```

## 📦 Dependencies

### Backend
- **Express**: Web framework
- **Mongoose**: MongoDB ODM
- **JWT**: Authentication
- **Google Gemini AI**: AI-powered code review

- **Cheerio**: Web scraping for problem import

### Frontend
- **React**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Monaco Editor**: Code editor
- **Chart.js**: Data visualization
- **Axios**: HTTP client

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Environment variable protection
- CORS configuration
- Input validation and sanitization

## 🚧 Development Notes

- The project uses a monorepo structure
- Backend runs on port 5000 by default
- Frontend runs on port 3000 by default
- MongoDB Atlas is used for the database
- All API keys are stored in environment variables

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support or questions, please open an issue in the repository.
