import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const sendOTPSchema = z.object({
  phone_number: z.string().min(10).max(20),
});

const verifyOTPSchema = z.object({
  phone_number: z.string().min(10).max(20),
  otp_code: z.string().length(6),
});

const updateProfileSchema = z.object({
  full_name: z.string().optional(),
  date_of_birth: z.string().optional(),
});

// Send OTP
router.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { phone_number } = sendOTPSchema.parse(req.body);

    const otp = await AuthService.sendOTP(phone_number);

    res.json({
      message: 'OTP sent successfully',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    res.status(400).json({ error: error.message || 'Failed to send OTP' });
  }
});

// Verify OTP and login
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { phone_number, otp_code } = verifyOTPSchema.parse(req.body);

    const isValid = await AuthService.verifyOTP(phone_number, otp_code);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const user = await AuthService.createOrGetUser(phone_number);
    const token = AuthService.generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        phone_number: user.phone_number,
        full_name: user.full_name,
        date_of_birth: user.date_of_birth,
      },
    });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    res.status(400).json({ error: error.message || 'Failed to verify OTP' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await AuthService.createOrGetUser(req.user!.phone_number);
    res.json({
      user: {
        id: result.id,
        phone_number: result.phone_number,
        full_name: result.full_name,
        date_of_birth: result.date_of_birth,
      },
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const user = await AuthService.updateUserProfile(req.user!.id, data);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        phone_number: user.phone_number,
        full_name: user.full_name,
        date_of_birth: user.date_of_birth,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(400).json({ error: error.message || 'Failed to update profile' });
  }
});

export default router;
