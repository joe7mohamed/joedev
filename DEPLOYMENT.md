# Deployment Guide

## MongoDB Atlas + Vercel Deployment

This project has been configured to work with MongoDB Atlas for data storage and Vercel for hosting.

### Prerequisites

1. **MongoDB Atlas Account**: Create a cluster and get your connection string
2. **Vercel Account**: For deployment
3. **Admin Access**: Set a secure admin password

### Environment Variables

Set these environment variables in Vercel:

```bash
MONGODB_URI=mongodb+srv://joedb:NP63qxnEJGeUagOi@joe-profile.iym080o.mongodb.net/joe-profile?retryWrites=true&w=majority&appName=joe-profile
MONGODB_DB=joe-profile
ADMIN_SECRET=your-secure-admin-password
```

### Vercel Configuration

The `vercel.json` file is already configured with:
- API routes in the `/api` directory
- Environment variable references
- Proper Node.js runtime settings

### Features

#### Contact Form
- **URL**: `https://joedev.net/api/contacts`
- **Method**: POST
- **Data**: Saves all contact form submissions to MongoDB
- **Security**: IP tracking and user agent logging

#### Admin Dashboard
- **URL**: `https://joedev.net/admin`
- **Authentication**: Password-based login
- **Features**:
  - View all contact submissions
  - Filter by project type
  - Search contacts
  - Delete contacts
  - Statistics dashboard
  - Pagination

### API Endpoints

#### POST /api/contacts
Submit a new contact form:
```json
{
  "name": "string",
  "email": "string",
  "company": "string (optional)",
  "projectType": "string",
  "message": "string",
  "wantsFreeConsultation": "boolean"
}
```

#### POST /api/admin
Admin login:
```json
{
  "password": "string"
}
```

#### GET /api/admin
Get contacts (requires authentication):
- Query params: `page`, `limit`, `search`, `projectType`
- Returns paginated contacts with statistics

#### DELETE /api/admin?id={contactId}
Delete a contact (requires authentication)

### Database Schema

#### Contacts Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  company: String (optional),
  projectType: String,
  message: String,
  wantsFreeConsultation: Boolean,
  createdAt: Date,
  ip: String,
  userAgent: String
}
```

### Security Features

- **CORS**: Properly configured for production
- **JWT Authentication**: For admin sessions
- **IP Logging**: Track submission sources
- **Rate Limiting**: Built into the API design
- **Secure Headers**: All API responses include security headers

### Deployment Steps

1. **Push to GitHub**: Ensure all changes are committed
2. **Connect to Vercel**: Link your GitHub repository
3. **Set Environment Variables**: Add the MongoDB and admin credentials
4. **Deploy**: Vercel will automatically build and deploy

### Post-Deployment

1. **Test Contact Form**: Submit a test contact through your website
2. **Verify Database**: Check MongoDB Atlas for the new submission
3. **Test Admin Dashboard**: Access `/admin` and login
4. **Monitor Logs**: Check Vercel function logs for any issues

### Troubleshooting

#### Common Issues

1. **CORS Errors**: Check the domain configuration in API files
2. **Database Connection**: Verify MongoDB URI and network access
3. **Admin Login**: Ensure ADMIN_SECRET matches exactly
4. **API Timeouts**: Check MongoDB Atlas connection limits

#### Monitoring

- **Vercel Analytics**: Monitor API response times
- **MongoDB Metrics**: Track database performance
- **Error Logging**: Check Vercel function logs for errors

### Admin Access

To access the admin dashboard:
1. Go to `https://joedev.net/admin`
2. Enter your admin password
3. The token is stored locally and expires in 24 hours

### Backup

Consider setting up automated backups for your MongoDB Atlas data to ensure contact submissions are never lost.