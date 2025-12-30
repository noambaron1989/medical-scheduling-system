# Deploy Your Medical Scheduling System

Your code is on GitHub! Now let's deploy it.

## ✅ Step 1: Deploy Frontend to Vercel (EASIEST)

### Option A: Using Vercel Website (RECOMMENDED - 2 minutes)

1. Go to: https://vercel.com/new
2. Sign in with your Google account (you already signed up)
3. Click "Import Project"
4. Search for: `medical-scheduling-system`
5. Click "Import"
6. **IMPORTANT:** Set these configurations:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
7. Click "Environment Variables" and add:
   ```
   VITE_API_URL = http://localhost:3001/api
   ```
   (We'll update this after deploying backend)
8. Click "Deploy"

Wait 2-3 minutes for deployment. You'll get a URL like:
`https://medical-scheduling-system-xyz.vercel.app`

**SAVE THIS URL!** You'll need it for the backend.

---

## ✅ Step 2: Deploy Backend to Render

### Go to Render Dashboard

1. Go to: https://dashboard.render.com
2. Sign in with your Google account

### Create PostgreSQL Database

1. Click "New +" → "PostgreSQL"
2. Configure:
   - **Name**: `medical-scheduling-db`
   - **Database**: `medical_scheduling`
   - **User**: `medical_user`
   - **Region**: `Oregon (US West)` (or closest to you)
   - **Plan**: **Free**
3. Click "Create Database"
4. Wait 2-3 minutes for it to provision
5. **IMPORTANT:** Go to the database page and find "Internal Database URL"
6. **COPY THE ENTIRE URL** - it looks like:
   ```
   postgresql://medical_user:xxx@dpg-xxx/medical_scheduling
   ```

### Create Web Service

1. Click "New +" → "Web Service"
2. Click "Build and deploy from a Git repository" → "Next"
3. Connect your GitHub account if asked
4. Find and select: `medical-scheduling-system`
5. Click "Connect"
6. Configure:
   - **Name**: `medical-scheduling-backend`
   - **Region**: Same as database (Oregon)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: **Free**

7. **Environment Variables** - Click "Add Environment Variable" for each:
   ```
   NODE_ENV = production
   DATABASE_URL = [PASTE INTERNAL DATABASE URL FROM STEP ABOVE]
   JWT_SECRET = medical-scheduling-jwt-secret-2025
   FRONTEND_URL = [PASTE YOUR VERCEL URL FROM STEP 1]
   PORT = 3001
   ```

8. Click "Create Web Service"

### Wait for Deployment (5-10 minutes)

Watch the logs. When you see "Live", your backend is deployed!

You'll get a URL like: `https://medical-scheduling-backend.onrender.com`

**SAVE THIS URL!**

### Seed the Database

1. In your Render backend service, click "Shell" tab (top right)
2. Wait for shell to connect
3. Run:
   ```bash
   npm run seed
   ```
4. Wait for "✅ Database seeded successfully!"

---

## ✅ Step 3: Update Frontend Environment Variable

1. Go back to Vercel: https://vercel.com/dashboard
2. Find your project: `medical-scheduling-system`
3. Click "Settings" → "Environment Variables"
4. Find `VITE_API_URL` and click "Edit"
5. Change value to:
   ```
   https://medical-scheduling-backend.onrender.com/api
   ```
   (Use YOUR Render backend URL)
6. Click "Save"
7. Go to "Deployments" tab
8. Click the three dots "..." on latest deployment
9. Click "Redeploy"

---

## ✅ Step 4: Update Backend CORS

1. Go to Render dashboard
2. Open your backend service
3. Go to "Environment" tab
4. Find `FRONTEND_URL` and click "Edit"
5. Make sure it's set to your Vercel URL (should already be correct)
6. Service will auto-redeploy

---

## 🎉 YOU'RE DONE!

### Test Your Deployed App

1. Open your Vercel URL: `https://medical-scheduling-system-xyz.vercel.app`
2. You should see the login page
3. Test with phone: `+1234567890`
4. OTP will be shown on screen
5. Login and explore!

### Important URLs for Your Interview

**Frontend (Live Demo)**: [Your Vercel URL]
**Backend API**: [Your Render URL]
**GitHub Repo**: https://github.com/noambaron1989/medical-scheduling-system

**Demo Credentials**:
- Phone: `+1234567890` or `+1234567891`
- OTP: Displayed on screen

---

## Troubleshooting

### Frontend shows "Network Error"
- Check that `VITE_API_URL` in Vercel points to your Render backend URL + `/api`
- Make sure backend `FRONTEND_URL` matches your Vercel URL exactly

### Backend fails to start
- Check Render logs for errors
- Verify `DATABASE_URL` is the **Internal** URL (not External)
- Make sure all environment variables are set

### Database seed fails
- Make sure you're using the Shell in Render (not your local terminal)
- The database must be fully provisioned before seeding

---

## Future Deployments

Now that everything is set up:

1. Make changes to your code locally
2. Commit: `git add . && git commit -m "Your message"`
3. Push: `git push`
4. Vercel and Render will **automatically deploy**!

---

Good luck with your interview! 🚀
