import { query } from '../db/connection';

export interface MedicalField {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface Doctor {
  id: number;
  full_name: string;
  medical_field_id: number;
  experience_years: number;
  rating: number;
  bio: string;
  image_url: string;
}

export interface TimeSlot {
  date: string;
  start_time: string;
  end_time: string;
  available: boolean;
}

export interface Appointment {
  id: number;
  user_id: number;
  doctor_id: number;
  medical_field_id: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
}

export class AppointmentService {
  // Get all medical fields
  static async getMedicalFields(): Promise<MedicalField[]> {
    const result = await query('SELECT * FROM medical_fields ORDER BY name');
    return result.rows;
  }

  // Get doctors by medical field
  static async getDoctorsByField(medicalFieldId: number): Promise<Doctor[]> {
    const result = await query(
      'SELECT * FROM doctors WHERE medical_field_id = $1 ORDER BY rating DESC',
      [medicalFieldId]
    );
    return result.rows;
  }

  // Get available time slots for a doctor
  static async getAvailableSlots(
    doctorId: number,
    date: string
  ): Promise<TimeSlot[]> {
    const dayOfWeek = new Date(date).getDay();

    // Get doctor's availability for this day
    const availabilityResult = await query(
      `SELECT start_time, end_time, slot_duration_minutes
       FROM doctor_availability
       WHERE doctor_id = $1 AND day_of_week = $2`,
      [doctorId, dayOfWeek]
    );

    if (availabilityResult.rows.length === 0) {
      return [];
    }

    const availability = availabilityResult.rows[0];
    const slotDuration = availability.slot_duration_minutes;

    // Get existing appointments for this doctor on this date
    const appointmentsResult = await query(
      `SELECT start_time, end_time
       FROM appointments
       WHERE doctor_id = $1 AND appointment_date = $2 AND status = 'scheduled'`,
      [doctorId, date]
    );

    const bookedSlots = appointmentsResult.rows.map((row) => ({
      start: row.start_time,
      end: row.end_time,
    }));

    // Generate all possible slots
    const slots: TimeSlot[] = [];
    const startTime = this.parseTime(availability.start_time);
    const endTime = this.parseTime(availability.end_time);

    let currentTime = startTime;
    while (currentTime + slotDuration <= endTime) {
      const slotStart = this.formatTime(currentTime);
      const slotEnd = this.formatTime(currentTime + slotDuration);

      const isBooked = bookedSlots.some(
        (booked) => booked.start === slotStart
      );

      slots.push({
        date,
        start_time: slotStart,
        end_time: slotEnd,
        available: !isBooked,
      });

      currentTime += slotDuration;
    }

    return slots;
  }

  // Helper to parse time string (HH:MM:SS) to minutes
  private static parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Helper to format minutes to time string (HH:MM:SS)
  private static formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
  }

  // Create appointment
  static async createAppointment(
    userId: number,
    doctorId: number,
    medicalFieldId: number,
    appointmentDate: string,
    startTime: string,
    endTime: string,
    notes?: string
  ): Promise<Appointment> {
    // Check if slot is available
    const conflictCheck = await query(
      `SELECT id FROM appointments
       WHERE doctor_id = $1 AND appointment_date = $2
       AND start_time = $3 AND status = 'scheduled'`,
      [doctorId, appointmentDate, startTime]
    );

    if (conflictCheck.rows.length > 0) {
      throw new Error('This time slot is no longer available');
    }

    const result = await query(
      `INSERT INTO appointments
       (user_id, doctor_id, medical_field_id, appointment_date, start_time, end_time, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'scheduled')
       RETURNING *`,
      [userId, doctorId, medicalFieldId, appointmentDate, startTime, endTime, notes]
    );

    return result.rows[0];
  }

  // Get user's upcoming appointments
  static async getUpcomingAppointments(userId: number): Promise<any[]> {
    const result = await query(
      `SELECT
         a.*,
         d.full_name as doctor_name,
         d.image_url as doctor_image,
         mf.name as medical_field_name
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       JOIN medical_fields mf ON a.medical_field_id = mf.id
       WHERE a.user_id = $1
       AND a.appointment_date >= CURRENT_DATE
       AND a.status = 'scheduled'
       ORDER BY a.appointment_date, a.start_time`,
      [userId]
    );

    return result.rows;
  }

  // Get user's past appointments
  static async getPastAppointments(userId: number): Promise<any[]> {
    const result = await query(
      `SELECT
         a.*,
         d.full_name as doctor_name,
         d.image_url as doctor_image,
         mf.name as medical_field_name
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       JOIN medical_fields mf ON a.medical_field_id = mf.id
       WHERE a.user_id = $1
       AND (a.appointment_date < CURRENT_DATE OR a.status != 'scheduled')
       ORDER BY a.appointment_date DESC, a.start_time DESC
       LIMIT 20`,
      [userId]
    );

    return result.rows;
  }

  // Cancel appointment
  static async cancelAppointment(appointmentId: number, userId: number): Promise<void> {
    await query(
      `UPDATE appointments
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2`,
      [appointmentId, userId]
    );
  }

  // Reschedule appointment
  static async rescheduleAppointment(
    appointmentId: number,
    userId: number,
    newDate: string,
    newStartTime: string,
    newEndTime: string
  ): Promise<Appointment> {
    // Get the appointment to check doctor
    const appointmentResult = await query(
      'SELECT doctor_id FROM appointments WHERE id = $1 AND user_id = $2',
      [appointmentId, userId]
    );

    if (appointmentResult.rows.length === 0) {
      throw new Error('Appointment not found');
    }

    const doctorId = appointmentResult.rows[0].doctor_id;

    // Check if new slot is available
    const conflictCheck = await query(
      `SELECT id FROM appointments
       WHERE doctor_id = $1 AND appointment_date = $2
       AND start_time = $3 AND status = 'scheduled' AND id != $4`,
      [doctorId, newDate, newStartTime, appointmentId]
    );

    if (conflictCheck.rows.length > 0) {
      throw new Error('This time slot is not available');
    }

    const result = await query(
      `UPDATE appointments
       SET appointment_date = $1, start_time = $2, end_time = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [newDate, newStartTime, newEndTime, appointmentId, userId]
    );

    return result.rows[0];
  }
}
