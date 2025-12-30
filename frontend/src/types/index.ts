export interface User {
  id: number;
  phone_number: string;
  full_name: string | null;
  date_of_birth: string | null;
}

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
  doctor_name?: string;
  doctor_image?: string;
  medical_field_name?: string;
}
