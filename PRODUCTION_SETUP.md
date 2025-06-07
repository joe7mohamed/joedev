# 🚀 Production Setup Guide

This guide will help you deploy Youssef's portfolio with full MongoDB Atlas integration for production use.

## 📋 Prerequisites

1. MongoDB Atlas account
2. Node.js 18+ installed
3. Domain name (optional but recommended)
4. Hosting platform (Vercel, Netlify, DigitalOcean, etc.)

## 🔧 Setup Steps

### 1. MongoDB Atlas Configuration

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new project called "Youssef Portfolio"

2. **Create Database Cluster**
   - Create a free M0 cluster
   - Choose a region close to your users
   - Name your cluster (e.g., "portfolio-cluster")

3. **Database Setup**
   - Database name: `portfolio`
   - Collections will be created automatically:
     - `contacts` - Contact form submissions
     - `bookings` - Session bookings

4. **Security Configuration**
   - Create database user with read/write permissions
   - Add IP addresses to allowlist:
     - For development: `0.0.0.0/0` (allow all)
     - For production: Add your server's IP addresses
   - Get connection string from "Connect" → "Connect your application"

### 2. Backend API Deployment

#### Option A: Deploy API on same platform as frontend

1. **Configure Environment Variables**
   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB_NAME=portfolio
   PORT=3001
   CLIENT_URL=https://your-domain.com
   JWT_SECRET=your-super-secure-random-string-64-chars-minimum
   ADMIN_USERNAME=youssef
   ADMIN_PASSWORD_HASH=your-bcrypt-hashed-password
   ```

2. **Generate Admin Password Hash**
   ```bash
   cd api
   node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-admin-password', 10).then(console.log)"
   ```

3. **Deploy API**
   - For Vercel: Deploy the `/api` folder as a separate project
   - For DigitalOcean: Use App Platform with Node.js
   - For Railway/Render: Connect GitHub repo and set build path to `/api`

#### Option B: Deploy on separate server

1. **Server Setup**
   ```bash
   git clone your-repo
   cd joe-portfolio/api
   npm install
   cp .env.example .env
   # Edit .env with your values
   npm start
   ```

2. **Process Manager (PM2)**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "portfolio-api"
   pm2 startup
   pm2 save
   ```

### 3. Frontend Deployment

1. **Configure Environment Variables**
   ```bash
   VITE_API_BASE_URL=https://your-api-domain.com/api
   VITE_APP_NAME=Youssef Portfolio
   VITE_APP_ENV=production
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   ```

3. **Platform-Specific Instructions**

   **Vercel:**
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Add environment variables in Vercel dashboard

   **Netlify:**
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables in Netlify dashboard

   **DigitalOcean App Platform:**
   - Create new app from GitHub
   - Choose Node.js
   - Set build command: `npm run build`
   - Set run command: `npm run preview`

## 🔒 Security Checklist

- [ ] Changed default admin password
- [ ] Used strong JWT secret (64+ random characters)
- [ ] Limited MongoDB IP allowlist to production IPs only
- [ ] HTTPS enabled on both frontend and API
- [ ] Environment variables secured (not in code)
- [ ] CORS configured for production domain only

## 🧪 Testing the Setup

1. **Test API Connection**
   ```bash
   curl https://your-api-domain.com/api/health
   ```

2. **Test Contact Form**
   - Submit a test contact form
   - Check MongoDB Atlas dashboard for new document
   - Test admin login and verify contact appears

3. **Test Admin Dashboard**
   - Go to `/admin` on your site
   - Login with username: `youssef`, password: `your-admin-password`
   - Verify contact submissions appear

## 📊 Monitoring

1. **MongoDB Atlas Monitoring**
   - Check Atlas dashboard for connection status
   - Monitor database size and operations

2. **API Health Check**
   - Set up uptime monitoring for `/api/health` endpoint
   - Monitor server logs for errors

3. **Frontend Monitoring**
   - Check browser console for API connection errors
   - Monitor contact form submission success rates

## 🚨 Troubleshooting

### Common Issues

1. **Contact Form Falling Back to localStorage**
   - Check API URL in environment variables
   - Verify API server is running and accessible
   - Check CORS configuration
   - Check browser console for network errors

2. **MongoDB Connection Errors**
   - Verify connection string format
   - Check IP allowlist in MongoDB Atlas
   - Ensure database user has correct permissions

3. **Admin Login Issues**
   - Verify password hash generation
   - Check JWT secret configuration
   - Check admin credentials in environment variables

### Development vs Production

**Development (localhost):**
- API URL: `http://localhost:3001/api`
- CORS: `http://localhost:5173`
- MongoDB: Allow all IPs (`0.0.0.0/0`)

**Production:**
- API URL: `https://your-api-domain.com/api`
- CORS: `https://your-frontend-domain.com`
- MongoDB: Specific IP allowlist

## 📞 Support

If you encounter issues during deployment:

1. Check the browser console for errors
2. Check API server logs
3. Verify MongoDB Atlas connection in the Atlas dashboard
4. Test API endpoints manually with curl or Postman

## 🎯 Success Criteria

✅ Portfolio website loads correctly  
✅ Contact form submits successfully  
✅ Admin can login at `/admin`  
✅ Contact submissions appear in admin dashboard  
✅ MongoDB Atlas shows new documents  
✅ No localStorage fallback warnings in console  

---

**Ready for Production!** 🚀

Your portfolio is now properly configured with MongoDB Atlas integration and ready for production use.