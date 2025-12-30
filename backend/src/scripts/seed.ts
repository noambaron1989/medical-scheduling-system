import { query } from '../db/connection';
import { initDatabase } from '../db/init';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  try {
    console.log('Starting database seed...');

    // Initialize database schema
    await initDatabase();

    // Clear existing data
    console.log('Clearing existing data...');
    await query('TRUNCATE TABLE appointment_notes, appointments, doctor_availability, doctors, medical_fields, otp_verifications, users RESTART IDENTITY CASCADE');

    // Seed medical fields
    console.log('Seeding medical fields...');
    const medicalFieldsData = [
      { name: 'Cardiology', description: 'Heart and cardiovascular system specialists', icon: '❤️' },
      { name: 'Pediatrics', description: 'Medical care for infants, children, and adolescents', icon: '👶' },
      { name: 'Dermatology', description: 'Skin, hair, and nail conditions treatment', icon: '🔬' },
      { name: 'Orthopedics', description: 'Musculoskeletal system and bone specialists', icon: '🦴' },
      { name: 'Neurology', description: 'Brain and nervous system specialists', icon: '🧠' },
      { name: 'General Practice', description: 'Primary care and general health services', icon: '🏥' },
    ];

    const medicalFieldIds: number[] = [];
    for (const field of medicalFieldsData) {
      const result = await query(
        'INSERT INTO medical_fields (name, description, icon) VALUES ($1, $2, $3) RETURNING id',
        [field.name, field.description, field.icon]
      );
      medicalFieldIds.push(result.rows[0].id);
    }

    // Seed doctors
    console.log('Seeding doctors...');
    const doctorsData = [
      {
        full_name: 'Dr. Sarah Johnson',
        medical_field_id: medicalFieldIds[0],
        experience_years: 15,
        rating: 4.8,
        bio: 'Specialized in preventive cardiology and heart disease management',
        image_url: 'https://i.pravatar.cc/150?img=1',
      },
      {
        full_name: 'Dr. Michael Chen',
        medical_field_id: medicalFieldIds[0],
        experience_years: 12,
        rating: 4.7,
        bio: 'Expert in interventional cardiology and cardiac catheterization',
        image_url: 'https://i.pravatar.cc/150?img=12',
      },
      {
        full_name: 'Dr. Emily Williams',
        medical_field_id: medicalFieldIds[1],
        experience_years: 10,
        rating: 4.9,
        bio: 'Specialized in developmental pediatrics and child wellness',
        image_url: 'https://i.pravatar.cc/150?img=5',
      },
      {
        full_name: 'Dr. David Martinez',
        medical_field_id: medicalFieldIds[1],
        experience_years: 8,
        rating: 4.6,
        bio: 'Focus on pediatric infectious diseases and immunizations',
        image_url: 'https://i.pravatar.cc/150?img=13',
      },
      {
        full_name: 'Dr. Lisa Anderson',
        medical_field_id: medicalFieldIds[2],
        experience_years: 14,
        rating: 4.8,
        bio: 'Expert in cosmetic and medical dermatology',
        image_url: 'https://i.pravatar.cc/150?img=9',
      },
      {
        full_name: 'Dr. James Brown',
        medical_field_id: medicalFieldIds[3],
        experience_years: 18,
        rating: 4.9,
        bio: 'Specialized in sports medicine and joint replacement',
        image_url: 'https://i.pravatar.cc/150?img=11',
      },
      {
        full_name: 'Dr. Rebecca Taylor',
        medical_field_id: medicalFieldIds[4],
        experience_years: 13,
        rating: 4.7,
        bio: 'Expert in neurodegenerative diseases and stroke treatment',
        image_url: 'https://i.pravatar.cc/150?img=10',
      },
      {
        full_name: 'Dr. Robert Wilson',
        medical_field_id: medicalFieldIds[5],
        experience_years: 20,
        rating: 4.8,
        bio: 'Comprehensive primary care and preventive medicine',
        image_url: 'https://i.pravatar.cc/150?img=14',
      },
    ];

    const doctorIds: number[] = [];
    for (const doctor of doctorsData) {
      const result = await query(
        `INSERT INTO doctors (full_name, medical_field_id, experience_years, rating, bio, image_url)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [doctor.full_name, doctor.medical_field_id, doctor.experience_years, doctor.rating, doctor.bio, doctor.image_url]
      );
      doctorIds.push(result.rows[0].id);
    }

    // Seed doctor availability (Monday to Friday, 9 AM to 5 PM)
    console.log('Seeding doctor availability...');
    for (const doctorId of doctorIds) {
      for (let day = 1; day <= 5; day++) { // Monday to Friday
        await query(
          `INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes)
           VALUES ($1, $2, $3, $4, $5)`,
          [doctorId, day, '09:00:00', '17:00:00', 30]
        );
      }
    }

    // Seed demo users
    console.log('Seeding demo users...');
    const demoUsers = [
      { phone_number: '+1234567890', full_name: 'John Doe', date_of_birth: '1990-05-15' },
      { phone_number: '+1234567891', full_name: 'Jane Smith', date_of_birth: '1985-08-22' },
    ];

    const userIds: number[] = [];
    for (const user of demoUsers) {
      const result = await query(
        'INSERT INTO users (phone_number, full_name, date_of_birth) VALUES ($1, $2, $3) RETURNING id',
        [user.phone_number, user.full_name, user.date_of_birth]
      );
      userIds.push(result.rows[0].id);
    }

    // Seed some appointments
    console.log('Seeding appointments...');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const appointments = [
      {
        user_id: userIds[0],
        doctor_id: doctorIds[0],
        medical_field_id: medicalFieldIds[0],
        appointment_date: tomorrow.toISOString().split('T')[0],
        start_time: '10:00:00',
        end_time: '10:30:00',
        status: 'scheduled',
        notes: 'Annual checkup',
      },
      {
        user_id: userIds[0],
        doctor_id: doctorIds[2],
        medical_field_id: medicalFieldIds[1],
        appointment_date: nextWeek.toISOString().split('T')[0],
        start_time: '14:00:00',
        end_time: '14:30:00',
        status: 'scheduled',
        notes: 'Child vaccination',
      },
    ];

    for (const appointment of appointments) {
      await query(
        `INSERT INTO appointments (user_id, doctor_id, medical_field_id, appointment_date, start_time, end_time, status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          appointment.user_id,
          appointment.doctor_id,
          appointment.medical_field_id,
          appointment.appointment_date,
          appointment.start_time,
          appointment.end_time,
          appointment.status,
          appointment.notes,
        ]
      );
    }

    console.log('✅ Database seeded successfully!');
    console.log('\nDemo credentials:');
    console.log('Phone: +1234567890 or +1234567891');
    console.log('OTP: Any 6-digit code (check console logs when testing)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
