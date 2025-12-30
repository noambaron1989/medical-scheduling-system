# Quick Start Guide

## Testing Locally (Right Now!)

### Terminal 1 - Backend
```bash
cd /Users/noam.baron/medical-scheduling-system/backend
npm install
# Make sure PostgreSQL is running and create database
createdb medical_scheduling
npm run seed
npm run dev
```

### Terminal 2 - Frontend
```bash
cd /Users/noam.baron/medical-scheduling-system/frontend
npm install
npm run dev
```

Open http://localhost:5173 and test with phone: `+1234567890`

## Deploy in 3 Steps

### 1️⃣ Push to GitHub
```bash
cd /Users/noam.baron/medical-scheduling-system
git push -u origin main
```
(You may need to authenticate with GitHub)

### 2️⃣ Render (Backend)
1. Go to https://render.com → New PostgreSQL → Free
2. New Web Service → Connect GitHub → Select repo
3. Root: `backend`, Build: `npm install && npm run build`, Start: `npm start`
4. Add env vars (see DEPLOYMENT_GUIDE.md)
5. After deploy, run `npm run seed` in Shell

### 3️⃣ Vercel (Frontend)
1. Go to https://vercel.com → Import Project
2. Select repo, Root: `frontend`
3. Add env: `VITE_API_URL=https://your-backend.onrender.com/api`
4. Deploy!

## Demo Credentials
- Phone: `+1234567890`
- OTP: Shown on screen

That's it! 🎉
