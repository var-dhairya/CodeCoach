# CodeCoach Vercel Deployment Guide

## 🚀 **Deployment Options**

### **Option 1: Separate Frontend & Backend (Recommended)**
Deploy frontend and backend as separate Vercel projects for better scalability and maintenance.

**Frontend:** `https://code-coach-client.vercel.app/`
**Backend:** `https://code-coach-server.vercel.app/`

### **Option 2: Frontend Only**
Deploy only the frontend and use a different backend service.

## 📋 **Prerequisites**

- [ ] Vercel account
- [ ] GitHub repository connected to Vercel
- [ ] MongoDB Atlas database
- [ ] Google Gemini API key
- [ ] JWT secret key

## 🔧 **Separate Frontend & Backend Deployment**

### **Step 1: Deploy Backend**

1. **Create new Vercel project:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set **Root Directory** to `server`
   - Framework Preset: **Other**

2. **Configure environment variables:**
   ```bash
   MONGODB_URI=mongodb+srv://coder:codercoder@cluster0.3wxoqpf.mongodb.net/codecoach
   JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random
   GEMINI_API_KEY=your_gemini_api_key_here
   FRONTEND_URL=https://code-coach-client.vercel.app
   NODE_ENV=production
   ```

3. **Deploy backend project**

### **Step 2: Deploy Frontend**

1. **Create new Vercel project:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set **Root Directory** to `client`
   - Framework Preset: **Create React App**

2. **Configure environment variables:**
   ```bash
   REACT_APP_API_BASE_URL=https://code-coach-server.vercel.app
   REACT_APP_ENV=production
   ```

3. **Deploy frontend project**

### **Step 3: Update URLs After Deployment**

After both projects are deployed, update the URLs in your environment variables if needed.

## 🌐 **Production URLs**

- **Frontend:** `https://code-coach-client.vercel.app/`
- **Backend:** `https://code-coach-server.vercel.app/`
- **API Base:** `https://code-coach-server.vercel.app/api`

## 🔍 **Troubleshooting**

### **CORS Issues**
- Ensure `FRONTEND_URL` is set correctly in backend
- Check that `NODE_ENV=production` is set

### **Build Errors**
- Verify all environment variables are set
- Check Vercel build logs for specific errors

### **Database Connection**
- Ensure MongoDB URI is correct: `mongodb+srv://coder:codercoder@cluster0.3wxoqpf.mongodb.net/codecoach`
- Check network access settings in MongoDB Atlas
- Verify username and password are correct

## 📚 **Useful Links**

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/)
- [Google Gemini API](https://ai.google.dev/docs)
