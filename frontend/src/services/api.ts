import axios from 'axios';
import type { User, MedicalField, Doctor, TimeSlot, Appointment } from '../types/index.ts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  sendOTP: async (phoneNumber: string) => {
    const response = await api.post('/auth/send-otp', { phone_number: phoneNumber });
    return response.data;
  },

  verifyOTP: async (phoneNumber: string, otpCode: string) => {
    const response = await api.post('/auth/verify-otp', {
      phone_number: phoneNumber,
      otp_code: otpCode,
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  updateProfile: async (data: { full_name?: string; date_of_birth?: string }) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
};

// Appointment API
export const appointmentAPI = {
  getMedicalFields: async (): Promise<MedicalField[]> => {
    const response = await api.get('/appointments/medical-fields');
    return response.data.medical_fields;
  },

  getDoctorsByField: async (medicalFieldId: number): Promise<Doctor[]> => {
    const response = await api.get(`/appointments/doctors/${medicalFieldId}`);
    return response.data.doctors;
  },

  getAvailableSlots: async (doctorId: number, date: string): Promise<TimeSlot[]> => {
    const response = await api.get(`/appointments/slots/${doctorId}/${date}`);
    return response.data.slots;
  },

  createAppointment: async (data: {
    doctor_id: number;
    medical_field_id: number;
    appointment_date: string;
    start_time: string;
    end_time: string;
    notes?: string;
  }): Promise<Appointment> => {
    const response = await api.post('/appointments', data);
    return response.data.appointment;
  },

  getUpcomingAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get('/appointments/upcoming');
    return response.data.appointments;
  },

  getPastAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get('/appointments/past');
    return response.data.appointments;
  },

  cancelAppointment: async (appointmentId: number) => {
    const response = await api.delete(`/appointments/${appointmentId}`);
    return response.data;
  },

  rescheduleAppointment: async (
    appointmentId: number,
    data: {
      appointment_date: string;
      start_time: string;
      end_time: string;
    }
  ) => {
    const response = await api.put(`/appointments/${appointmentId}/reschedule`, data);
    return response.data;
  },
};

export default api;
