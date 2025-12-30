import { Router, Response } from 'express';
import { AppointmentService } from '../services/appointment.service';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createAppointmentSchema = z.object({
  doctor_id: z.number(),
  medical_field_id: z.number(),
  appointment_date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  notes: z.string().optional(),
});

const rescheduleSchema = z.object({
  appointment_date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
});

// Get all medical fields
router.get('/medical-fields', async (req, res: Response) => {
  try {
    const fields = await AppointmentService.getMedicalFields();
    res.json({ medical_fields: fields });
  } catch (error: any) {
    console.error('Get medical fields error:', error);
    res.status(500).json({ error: 'Failed to get medical fields' });
  }
});

// Get doctors by medical field
router.get('/doctors/:medicalFieldId', async (req, res: Response) => {
  try {
    const medicalFieldId = parseInt(req.params.medicalFieldId);
    const doctors = await AppointmentService.getDoctorsByField(medicalFieldId);
    res.json({ doctors });
  } catch (error: any) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Failed to get doctors' });
  }
});

// Get available slots for a doctor
router.get('/slots/:doctorId/:date', async (req, res: Response) => {
  try {
    const doctorId = parseInt(req.params.doctorId);
    const date = req.params.date;
    const slots = await AppointmentService.getAvailableSlots(doctorId, date);
    res.json({ slots });
  } catch (error: any) {
    console.error('Get slots error:', error);
    res.status(500).json({ error: 'Failed to get available slots' });
  }
});

// Create appointment
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const data = createAppointmentSchema.parse(req.body);
    const appointment = await AppointmentService.createAppointment(
      req.user!.id,
      data.doctor_id,
      data.medical_field_id,
      data.appointment_date,
      data.start_time,
      data.end_time,
      data.notes
    );

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment,
    });
  } catch (error: any) {
    console.error('Create appointment error:', error);
    res.status(400).json({ error: error.message || 'Failed to create appointment' });
  }
});

// Get user's upcoming appointments
router.get('/upcoming', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const appointments = await AppointmentService.getUpcomingAppointments(req.user!.id);
    res.json({ appointments });
  } catch (error: any) {
    console.error('Get upcoming appointments error:', error);
    res.status(500).json({ error: 'Failed to get appointments' });
  }
});

// Get user's past appointments
router.get('/past', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const appointments = await AppointmentService.getPastAppointments(req.user!.id);
    res.json({ appointments });
  } catch (error: any) {
    console.error('Get past appointments error:', error);
    res.status(500).json({ error: 'Failed to get appointments' });
  }
});

// Cancel appointment
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const appointmentId = parseInt(req.params.id);
    await AppointmentService.cancelAppointment(appointmentId, req.user!.id);
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error: any) {
    console.error('Cancel appointment error:', error);
    res.status(400).json({ error: 'Failed to cancel appointment' });
  }
});

// Reschedule appointment
router.put('/:id/reschedule', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const appointmentId = parseInt(req.params.id);
    const data = rescheduleSchema.parse(req.body);

    const appointment = await AppointmentService.rescheduleAppointment(
      appointmentId,
      req.user!.id,
      data.appointment_date,
      data.start_time,
      data.end_time
    );

    res.json({
      message: 'Appointment rescheduled successfully',
      appointment,
    });
  } catch (error: any) {
    console.error('Reschedule appointment error:', error);
    res.status(400).json({ error: error.message || 'Failed to reschedule appointment' });
  }
});

export default router;
