# Medical Scheduling System

A full-stack medical appointment booking system built with React, Node.js, Express, and PostgreSQL.

## Live Demo

- **Frontend**: [Deploy to Vercel]
- **Backend API**: [Deploy to Render]

## Demo Credentials

For testing purposes, use any of these phone numbers:
- `+1234567890`
- `+1234567891`

OTP codes will be displayed in the console/UI during development and shown on the login page.

## Features

### Core Features

- **OTP Authentication**: Secure phone number-based authentication with mock OTP verification
- **Context-Aware Dashboard**:
  - New users see welcome message, CTA to book first appointment, and overview of services
  - Returning users see upcoming appointments, past history, and quick actions
- **Step-by-Step Booking Flow**:
  1. Select medical specialty (Cardiology, Pediatrics, Dermatology, etc.)
  2. Choose from available doctors with ratings and experience
  3. Pick date and time slot from doctor's availability
  4. Confirm appointment with optional notes
- **Appointment Management**:
  - View upcoming appointments
  - View past appointment history
  - Cancel appointments
  - Reschedule appointments

### Technical Implementation

- **Frontend**: React 18 with TypeScript, TailwindCSS, React Router
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with indexed queries
- **Authentication**: JWT tokens with secure storage
- **API**: RESTful API with Zod validation
- **Error Handling**: Comprehensive error handling throughout the stack
- **Security**: Prepared statements to prevent SQL injection, CORS configuration

## Architecture Decisions

### Database Schema

The schema is designed for scalability and data integrity:

- **users**: Store patient information
- **medical_fields**: Configurable medical specialties
- **doctors**: Doctor profiles linked to specialties
- **doctor_availability**: Weekly schedule per doctor
- **appointments**: Appointment records with status tracking
- **otp_verifications**: Temporary OTP storage with expiration

Key indexes on frequently queried fields (user_id, doctor_id, appointment_date) for optimal performance.

### API Design

RESTful API structure:
- `/api/auth/*` - Authentication endpoints
- `/api/appointments/*` - Appointment management endpoints

All endpoints use Zod for request validation and return consistent JSON responses.

### Frontend Organization

- **Context API** for global auth state
- **Service layer** for API communication
- **Type-safe** with TypeScript interfaces
- **Responsive** TailwindCSS styling
- **Route protection** with PrivateRoute component

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up PostgreSQL database:
```bash
createdb medical_scheduling
```

4. Update `.env` file with your database connection:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/medical_scheduling
JWT_SECRET=your-secret-key
PORT=3001
FRONTEND_URL=http://localhost:5173
```

5. Initialize database and seed data:
```bash
npm run seed
```

6. Start development server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:3001/api
```

4. Start development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Deployment

### Backend Deployment (Render)

1. Create a new account on [Render](https://render.com)

2. Create a new PostgreSQL database:
   - Go to "New" → "PostgreSQL"
   - Name: `medical-scheduling-db`
   - Copy the internal database URL

3. Create a new Web Service:
   - Go to "New" → "Web Service"
   - Connect your GitHub repository
   - Select the `backend` folder as root directory
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add environment variables:
     - `DATABASE_URL`: [Paste internal database URL]
     - `JWT_SECRET`: [Generate a secure random string]
     - `NODE_ENV`: `production`
     - `FRONTEND_URL`: [Your Vercel frontend URL]

4. After deployment, run the seed script:
   - Go to "Shell" tab in Render dashboard
   - Run: `npm run seed`

### Frontend Deployment (Vercel)

1. Create account on [Vercel](https://vercel.com)

2. Import your Git repository

3. Configure project:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. Add environment variables:
   - `VITE_API_URL`: [Your Render backend URL]/api

5. Deploy

6. Update backend `FRONTEND_URL` environment variable with your Vercel URL

## Testing the Application

1. Open the deployed frontend URL
2. Enter phone number: `+1234567890`
3. Click "Send OTP"
4. Copy the OTP displayed on screen
5. Enter OTP and verify
6. Explore the dashboard:
   - As a new user, you'll see welcome message and available services
   - Book an appointment through the flow
   - Return to dashboard to see your upcoming appointments

## API Documentation

### Authentication

**Send OTP**
```
POST /api/auth/send-otp
Body: { "phone_number": "+1234567890" }
```

**Verify OTP**
```
POST /api/auth/verify-otp
Body: { "phone_number": "+1234567890", "otp_code": "123456" }
```

**Get Current User**
```
GET /api/auth/me
Headers: { "Authorization": "Bearer <token>" }
```

### Appointments

**Get Medical Fields**
```
GET /api/appointments/medical-fields
```

**Get Doctors by Field**
```
GET /api/appointments/doctors/:medicalFieldId
```

**Get Available Slots**
```
GET /api/appointments/slots/:doctorId/:date
```

**Create Appointment**
```
POST /api/appointments
Headers: { "Authorization": "Bearer <token>" }
Body: {
  "doctor_id": 1,
  "medical_field_id": 1,
  "appointment_date": "2025-01-15",
  "start_time": "10:00:00",
  "end_time": "10:30:00",
  "notes": "Optional notes"
}
```

**Get Upcoming Appointments**
```
GET /api/appointments/upcoming
Headers: { "Authorization": "Bearer <token>" }
```

**Cancel Appointment**
```
DELETE /api/appointments/:id
Headers: { "Authorization": "Bearer <token>" }
```

## Project Structure

```
medical-scheduling-system/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── connection.ts
│   │   │   ├── init.ts
│   │   │   └── schema.sql
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   └── appointment.routes.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   └── appointment.service.ts
│   │   ├── scripts/
│   │   │   └── seed.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   └── BookingPage.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Future Enhancements

Potential improvements that could be added:

- Email/SMS notifications for appointment reminders
- Doctor admin panel for managing availability
- Payment integration for appointment fees
- Medical history and prescription tracking
- Multi-language support
- Real-time chat with doctors
- Video consultation integration
- Insurance provider integration

## Technology Stack

### Frontend
- React 18
- TypeScript
- TailwindCSS
- React Router v7
- Axios
- Vite

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL
- JWT
- Zod
- Bcrypt

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: Render PostgreSQL

## License

This project is created as a home assignment demonstration.

## Contact

For questions or feedback about this project, please create an issue in the repository.
