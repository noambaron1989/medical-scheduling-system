# Local Testing Guide

## ✅ Your Application is Running!

### Current Status
- ✅ Backend: http://localhost:3001
- ✅ Frontend: http://localhost:5173
- ✅ Database: PostgreSQL with demo data seeded
- ✅ Node 20 configured for this project

## Test the Application

### Open in Browser
Go to: **http://localhost:5173**

### Demo Credentials
- **Phone Number**: `+1234567890` or `+1234567891`
- **OTP**: Will be displayed on the login screen

### Test Flow
1. **Login Page**: Enter phone number and request OTP
2. **OTP Display**: Copy the 6-digit code shown on screen
3. **Dashboard**:
   - If using `+1234567890`: You'll see upcoming appointments (returning user view)
   - Try a new number: You'll see welcome message (new user view)
4. **Book Appointment**:
   - Click "Book New Appointment" or "Book Your First Appointment"
   - Select a medical field (e.g., Cardiology)
   - Choose a doctor
   - Pick tomorrow's date or later
   - Select a time slot
   - Add optional notes
   - Confirm booking
5. **View Appointments**:
   - Return to dashboard
   - See your new appointment in upcoming section
   - Try canceling an appointment

## Stopping the Servers

If you need to stop the development servers:

```bash
# Stop backend
lsof -ti:3001 | xargs kill

# Stop frontend
lsof -ti:5173 | xargs kill
```

## Restarting the Servers

### Backend
```bash
cd /Users/noam.baron/medical-scheduling-system/backend
npm run dev
```

### Frontend
```bash
cd /Users/noam.baron/medical-scheduling-system/frontend
source ~/.nvm/nvm.sh
nvm use 20  # or just 'nvm use' if .nvmrc is in parent directory
npm run dev
```

## Database Management

### Reset Database (Clear all data and reseed)
```bash
cd /Users/noam.baron/medical-scheduling-system/backend
npm run seed
```

### Connect to Database Directly
```bash
psql medical_scheduling
```

### Useful SQL Commands
```sql
-- View all users
SELECT * FROM users;

-- View all appointments
SELECT
  a.*,
  u.phone_number,
  d.full_name as doctor_name,
  mf.name as medical_field
FROM appointments a
JOIN users u ON a.user_id = u.id
JOIN doctors d ON a.doctor_id = d.id
JOIN medical_fields mf ON a.medical_field_id = mf.id;

-- View available doctors
SELECT d.*, mf.name as specialty
FROM doctors d
JOIN medical_fields mf ON d.medical_field_id = mf.id;
```

## Troubleshooting

### Port Already in Use
If you see "port already in use" error:

```bash
# Check what's using the port
lsof -i:3001  # for backend
lsof -i:5173  # for frontend

# Kill the process
kill -9 <PID>
```

### Database Connection Error
If backend can't connect to database:

1. Check if PostgreSQL is running:
   ```bash
   brew services list | grep postgresql
   ```

2. Start PostgreSQL if needed:
   ```bash
   brew services start postgresql@14
   ```

3. Verify database exists:
   ```bash
   psql -l | grep medical_scheduling
   ```

### Frontend Shows Blank Page
1. Check browser console for errors (F12)
2. Verify backend is running: http://localhost:3001/health
3. Check CORS settings in backend/.env

### Node Version Issues
This project requires Node 20. Your work projects use Node 18.

**The `.nvmrc` file ensures the right version is used automatically.**

```bash
# In this project directory
nvm use   # Automatically uses Node 20

# In your work directories
nvm use 18  # Or they'll use their own .nvmrc
```

## API Testing

### Test Backend API Directly

```bash
# Health check
curl http://localhost:3001/health

# Get medical fields
curl http://localhost:3001/api/appointments/medical-fields

# Send OTP
curl -X POST http://localhost:3001/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+1234567890"}'

# Get doctors for a field (e.g., Cardiology - ID 1)
curl http://localhost:3001/api/appointments/doctors/1
```

## What to Test

### Core Features
- [ ] OTP login flow
- [ ] New user dashboard view
- [ ] Returning user dashboard view
- [ ] Medical field selection
- [ ] Doctor selection with ratings
- [ ] Date picker (tomorrow and later)
- [ ] Time slot availability
- [ ] Appointment booking
- [ ] View upcoming appointments
- [ ] View past appointments
- [ ] Cancel appointment
- [ ] Logout

### User Experience
- [ ] Responsive design (resize browser)
- [ ] Loading states
- [ ] Error messages
- [ ] Form validation
- [ ] Navigation flow
- [ ] Back buttons work correctly

### Edge Cases
- [ ] Try booking same slot twice (should show error)
- [ ] Try booking yesterday's date (disabled)
- [ ] Try invalid phone number format
- [ ] Try wrong OTP code
- [ ] Try accessing dashboard without login (redirects)

## Demo Data

The seeded database includes:

### Medical Fields
- Cardiology
- Pediatrics
- Dermatology
- Orthopedics
- Neurology
- General Practice

### Doctors
8 doctors across different specialties with:
- Experience years
- Ratings (4.6 - 4.9)
- Professional photos
- Bios

### Appointments
User `+1234567890` has:
- 1 upcoming appointment tomorrow
- 1 upcoming appointment next week

## Ready for Deployment?

Once you've tested locally and everything works:

1. **Push to GitHub**: See `DEPLOYMENT_GUIDE.md` for authentication
2. **Deploy Backend**: Follow Render setup in `DEPLOYMENT_GUIDE.md`
3. **Deploy Frontend**: Follow Vercel setup in `DEPLOYMENT_GUIDE.md`

## Questions?

- See `README.md` for full documentation
- See `DEPLOYMENT_GUIDE.md` for deployment steps
- See `QUICK_START.md` for quick reference

Good luck with your interview! 🚀
