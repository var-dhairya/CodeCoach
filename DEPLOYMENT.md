# CodeCoach Vercel Deployment Guide

This guide will help you deploy your CodeCoach application to Vercel.

## 🚀 Deployment Options

### Option 1: Separate Frontend & Backend (Recommended)
Deploy frontend and backend as separate Vercel projects for better management and scalability.

### Option 2: Frontend Only
Deploy only the React frontend to Vercel and use a separate backend service.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab Account**: For repository integration
3. **MongoDB Atlas**: Already configured
4. **API Keys**: Google Gemini API key

## 🔧 Option 1: Separate Frontend & Backend Deployment

### Step 1: Deploy Backend First
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. **Important**: Set root directory to `server`
5. Build command: `npm run vercel-build`
6. Output directory: `.`
7. Install command: `npm install`

### Step 2: Configure Backend Environment Variables
In Vercel dashboard, add these environment variables:
```
MONGODB_URI=mongodb+srv://spare6957:spare6957@cluster0.3wxoqpf.mongodb.net/codecoach
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random
GEMINI_API_KEY=AIzaSyBJfhBJCoFlH5Uq3Z3vySkMheKyA5Z9T8E
NODE_ENV=production
JWT_EXPIRE=7d
FRONTEND_URL=https://your-frontend-project.vercel.app
```

### Step 3: Deploy Frontend
1. Create another Vercel project
2. Import the same GitHub repository
3. **Important**: Set root directory to `client`
4. Build command: `npm run build`
5. Output directory: `build`
6. Install command: `npm install`

### Step 4: Configure Frontend Environment Variables
In frontend Vercel dashboard, add these environment variables:
```
REACT_APP_API_BASE_URL=https://your-backend-project.vercel.app
REACT_APP_ENV=production
```

## 🔧 Option 2: Frontend Only Deployment

### Step 1: Prepare Frontend
```bash
cd client
npm run build
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Set root directory to `client`
5. Build command: `npm run build`
6. Output directory: `build`
7. Install command: `npm install`

### Step 3: Configure Environment Variables
In Vercel dashboard, add these environment variables:
```
REACT_APP_API_BASE_URL=https://your-backend-url.com
REACT_APP_ENV=production
```

### Step 4: Deploy Backend Separately
Use one of these services for your backend:
- **Railway**: Easy Node.js deployment
- **Render**: Free tier available
- **Heroku**: Classic choice
- **DigitalOcean App Platform**: Scalable

## 🌐 Custom Domain Setup

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

## 🔒 Security Considerations

1. **Environment Variables**: Never commit API keys to Git
2. **CORS**: Update CORS settings for production domains
3. **Rate Limiting**: Implement rate limiting for production
4. **HTTPS**: Vercel provides automatic HTTPS

## 📊 Monitoring & Analytics

1. **Vercel Analytics**: Built-in performance monitoring
2. **Error Tracking**: Set up error monitoring (Sentry, LogRocket)
3. **Performance**: Monitor Core Web Vitals

## 🚨 Troubleshooting

### Common Issues:

1. **Build Failures**: Check Node.js version compatibility
2. **Environment Variables**: Verify all required variables are set
3. **CORS Errors**: Update CORS configuration for production domains
4. **Database Connection**: Ensure MongoDB Atlas IP whitelist includes Vercel

### Debug Commands:
```bash
# Test build locally
npm run build

# Check environment variables
echo $REACT_APP_API_BASE_URL

# Test backend locally
cd server && npm start
```

## 📈 Scaling Considerations

1. **Serverless Functions**: Vercel has execution time limits
2. **Database**: MongoDB Atlas scales automatically
3. **CDN**: Vercel provides global CDN
4. **Edge Functions**: Consider for better performance

## 🔄 Continuous Deployment

1. **Git Integration**: Vercel auto-deploys on push to main branch
2. **Preview Deployments**: Automatic preview deployments for PRs
3. **Rollbacks**: Easy rollback to previous deployments

## 💰 Cost Optimization

1. **Free Tier**: Vercel provides generous free tier
2. **Serverless**: Pay only for what you use
3. **Bandwidth**: Monitor bandwidth usage
4. **Function Calls**: Optimize serverless function calls

## 📞 Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

---

**Note**: This deployment guide assumes you're using the current project structure. Adjust paths and commands based on your specific setup.
