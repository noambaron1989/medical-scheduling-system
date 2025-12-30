# Step-by-Step Deployment Guide

## Step 1: Push to GitHub

Run these commands in your terminal:

```bash
cd /Users/noam.baron/medical-scheduling-system

# Push to your GitHub repository
git remote add origin https://github.com/noambaron1989/medical-scheduling-system.git
git branch -M main
git push -u origin main
```

If prompted for credentials, use your GitHub username and a Personal Access Token (not your password).

To create a Personal Access Token:
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with 'repo' permissions
3. Copy the token and use it as your password when pushing

## Step 2: Deploy Backend to Render

### 2.1 Create PostgreSQL Database

1. Go to https://dashboard.render.com
2. Click "New +" → "PostgreSQL"
3. Configure:
   - Name: `medical-scheduling-db`
   - Database: `medical_scheduling`
   - User: `medical_user`
   - Region: Choose closest to you
   - Plan: Free
4. Click "Create Database"
5. **COPY the Internal Database URL** (starts with `postgresql://`)

### 2.2 Deploy Backend Web Service

1. Click "New +" → "Web Service"
2. Click "Connect account" and authorize GitHub
3. Select your repository: `medical-scheduling-system`
4. Configure:
   - Name: `medical-scheduling-backend`
   - Region: Same as database
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: Free

5. Click "Advanced" and add Environment Variables:
   ```
   NODE_ENV = production
   DATABASE_URL = [Paste the Internal Database URL from step 2.1]
   JWT_SECRET = [Generate a random string: use a password generator]
   FRONTEND_URL = [Leave empty for now, we'll update this after Vercel]
   ```

6. Click "Create Web Service"

7. Wait for deployment to complete (5-10 minutes)

8. **COPY your backend URL** (e.g., `https://medical-scheduling-backend.onrender.com`)

### 2.3 Seed the Database

After deployment completes:

1. Go to your backend service in Render
2. Click "Shell" tab (on the right side)
3. Wait for shell to connect
4. Run:
   ```bash
   npm run seed
   ```
5. You should see "✅ Database seeded successfully!"

## Step 3: Deploy Frontend to Vercel

### 3.1 Deploy Frontend

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `medical-scheduling-system`
4. Configure:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. Add Environment Variable:
   ```
   VITE_API_URL = [Your Render backend URL]/api
   ```
   Example: `https://medical-scheduling-backend.onrender.com/api`

6. Click "Deploy"

7. Wait for deployment (2-3 minutes)

8. **COPY your frontend URL** (e.g., `https://medical-scheduling-system.vercel.app`)

### 3.2 Update Backend CORS

1. Go back to Render dashboard
2. Open your backend service
3. Go to "Environment" tab
4. Update the `FRONTEND_URL` variable:
   ```
   FRONTEND_URL = [Your Vercel URL]
   ```
   Example: `https://medical-scheduling-system.vercel.app`

5. Click "Save Changes"
6. Service will automatically redeploy

## Step 4: Test Your Application

1. Open your Vercel URL in a browser
2. You should see the login page
3. Test with demo phone number: `+1234567890`
4. OTP will be displayed on screen (in production, it would be sent via SMS)
5. After login, explore:
   - New user dashboard view
   - Booking flow
   - Appointment management

## Troubleshooting

### Backend Issues

**"Application failed to start"**
- Check environment variables are set correctly
- View logs in Render dashboard
- Ensure DATABASE_URL is the Internal URL, not External

**"Database connection failed"**
- Verify DATABASE_URL is correct
- Check database is in same region as web service
- Ensure database is running

### Frontend Issues

**"Network Error" or "API calls fail"**
- Verify VITE_API_URL is correct and ends with `/api`
- Check CORS: Ensure backend FRONTEND_URL matches your Vercel URL
- Open browser console to see exact error

**"Blank page"**
- Check build logs in Vercel
- Verify build succeeded
- Check browser console for errors

## Free Tier Limitations

### Render Free Tier
- Service spins down after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds (cold start)
- 750 hours/month (enough for demo purposes)

### Vercel Free Tier
- Fast deployments
- No cold starts
- Perfect for frontend hosting

## Important URLs

Save these for your interview submission:

- **GitHub Repository**: https://github.com/noambaron1989/medical-scheduling-system
- **Live Frontend**: [Your Vercel URL]
- **Backend API**: [Your Render URL]
- **Demo Credentials**:
  - Phone: `+1234567890` or `+1234567891`
  - OTP: Displayed on screen

## Making Changes

After initial deployment, any changes you push to GitHub will:

### Automatic Deployments
- **Vercel**: Automatically deploys on push to `main` branch
- **Render**: Automatically deploys on push to `main` branch

### To make changes:
```bash
cd /Users/noam.baron/medical-scheduling-system
# Make your changes
git add .
git commit -m "Description of changes"
git push
```

Both services will automatically rebuild and deploy!

## Next Steps After Deployment

1. ✅ Update main README.md with your live URLs
2. ✅ Test all features in production
3. ✅ Take screenshots for your interview presentation
4. ✅ Prepare to discuss:
   - Architecture decisions
   - Database schema design
   - Security considerations
   - Scalability approaches

Good luck with your interview! 🚀
