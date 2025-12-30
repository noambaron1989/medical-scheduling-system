import jwt from 'jsonwebtoken';
import { query } from '../db/connection';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface User {
  id: number;
  phone_number: string;
  full_name: string | null;
  date_of_birth: Date | null;
}

export class AuthService {
  // Generate a 6-digit OTP
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP (mock - just store in DB and log)
  static async sendOTP(phoneNumber: string): Promise<string> {
    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await query(
      'INSERT INTO otp_verifications (phone_number, otp_code, expires_at) VALUES ($1, $2, $3)',
      [phoneNumber, otp, expiresAt]
    );

    console.log(`[OTP] Code for ${phoneNumber}: ${otp}`);
    return otp;
  }

  // Verify OTP
  static async verifyOTP(phoneNumber: string, otpCode: string): Promise<boolean> {
    const result = await query(
      `SELECT * FROM otp_verifications
       WHERE phone_number = $1 AND otp_code = $2 AND expires_at > NOW() AND verified = FALSE
       ORDER BY created_at DESC LIMIT 1`,
      [phoneNumber, otpCode]
    );

    if (result.rows.length === 0) {
      return false;
    }

    // Mark OTP as verified
    await query(
      'UPDATE otp_verifications SET verified = TRUE WHERE id = $1',
      [result.rows[0].id]
    );

    return true;
  }

  // Create or get user
  static async createOrGetUser(phoneNumber: string): Promise<User> {
    // Check if user exists
    let result = await query('SELECT * FROM users WHERE phone_number = $1', [phoneNumber]);

    if (result.rows.length === 0) {
      // Create new user
      result = await query(
        'INSERT INTO users (phone_number) VALUES ($1) RETURNING *',
        [phoneNumber]
      );
    }

    return result.rows[0];
  }

  // Generate JWT token
  static generateToken(user: User): string {
    return jwt.sign(
      { id: user.id, phone_number: user.phone_number },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
  }

  // Verify JWT token
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  // Update user profile
  static async updateUserProfile(
    userId: number,
    data: { full_name?: string; date_of_birth?: string }
  ): Promise<User> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.full_name) {
      updates.push(`full_name = $${paramIndex++}`);
      values.push(data.full_name);
    }

    if (data.date_of_birth) {
      updates.push(`date_of_birth = $${paramIndex++}`);
      values.push(data.date_of_birth);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows[0];
  }
}
