# 🚀 CodeCoach Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Current Status
- [x] Codebase cleaned and optimized
- [x] Environment variables configured
- [x] .gitignore updated to protect sensitive files
- [x] API endpoints prepared for production
- [x] Build scripts configured

## 🔧 Environment Setup

### 1. Server Environment Variables (.env)
```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
MONGODB_URI=mongodb+srv://spare6957:spare6957@cluster0.3wxoqpf.mongodb.net/codecoach

# JWT Configuration
JWT_SECRET=codecoach_jwt_secret_key_2024_make_it_long_and_random_for_security
JWT_EXPIRE=7d

# Google Gemini Configuration (Optional)
GEMINI_API_KEY=AIzaSyBJfhBJCoFlH5Uq3Z3vySkMheKyA5Z9T8E

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### 2. Client Environment Variables
Create `client/.env.production`:
```bash
REACT_APP_API_URL=https://your-codecoach-backend.vercel.app
GENERATE_SOURCEMAP=false
```

## 🌐 Vercel Deployment Steps

### Option 1: Separate Deployments (Recommended)

#### Deploy Backend (API)
1. **Create new Vercel project for backend:**
   ```bash
   cd server
   vercel
   ```

2. **Configure Vercel project:**
   - Choose "Other" framework
   - Set output directory to `src`
   - Add environment variables in Vercel dashboard

3. **Add environment variables in Vercel dashboard:**
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `NODE_ENV=production`

#### Deploy Frontend
1. **Update API URL in `client/.env.production`:**
   ```bash
   REACT_APP_API_URL=https://your-backend-url.vercel.app
   ```

2. **Deploy frontend:**
   ```bash
   cd client
   vercel
   ```

### Option 2: Monorepo Deployment

1. **Deploy from root directory:**
   ```bash
   vercel
   ```

2. **Configure build settings:**
   - Framework: Other
   - Build command: `npm run build`
   - Output directory: `client/build`

## 🔒 Security Checklist

### Before Deployment:
- [x] `.env` files added to `.gitignore`
- [x] No hardcoded secrets in code
- [x] Strong JWT secret configured
- [x] CORS properly configured
- [x] Rate limiting enabled

### After Deployment:
- [ ] Test all API endpoints
- [ ] Verify authentication works
- [ ] Check database connections
- [ ] Test demo user login
- [ ] Verify analytics dashboard

## 🧪 Testing Production Build

### Local Production Testing:
```bash
# Build client
cd client
npm run build

# Serve built files
npx serve -s build -l 3000

# Test backend
cd ../server
NODE_ENV=production npm start
```

## 📱 Demo Credentials

For recruiter demonstrations:
- **Email:** demo@codecoach.com
- **Password:** demo123

## 🛠️ Post-Deployment Configuration

### 1. Update API URLs
After backend deployment, update the frontend environment:
```bash
# In client/.env.production
REACT_APP_API_URL=https://your-actual-backend-url.vercel.app
```

### 2. Redeploy Frontend
```bash
cd client
vercel --prod
```

### 3. Test Complete Flow
1. Visit deployed frontend URL
2. Test login with demo credentials
3. Navigate through all features
4. Submit code solutions
5. Check analytics dashboard

## 🚨 Troubleshooting

### Common Issues:

#### 1. CORS Errors
- Ensure backend CORS is configured for frontend domain
- Check Vercel function URLs

#### 2. Environment Variables
- Verify all env vars are set in Vercel dashboard
- Check variable names match exactly

#### 3. Database Connection
- Verify MongoDB Atlas allows connections from 0.0.0.0/0
- Check connection string format

#### 4. Build Failures
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall
- Check for TypeScript errors

## 📊 Monitoring

### After Deployment:
- Monitor Vercel function logs
- Check MongoDB Atlas metrics
- Monitor API response times
- Track user activity

## 🎯 Success Metrics

Deployment is successful when:
- [x] Frontend loads without errors
- [x] Authentication works end-to-end
- [x] All 15 problems display with solutions
- [x] Code submission and execution works
- [x] Analytics dashboard displays data
- [x] Demo user can login and use all features

## 📞 Support

If deployment issues occur:
1. Check Vercel function logs
2. Verify environment variables
3. Test API endpoints directly
4. Check database connections
5. Review CORS configuration