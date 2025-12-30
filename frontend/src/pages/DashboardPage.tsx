import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI } from '../services/api';
import { Appointment, MedicalField } from '../types';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [medicalFields, setMedicalFields] = useState<MedicalField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [upcoming, past, fields] = await Promise.all([
        appointmentAPI.getUpcomingAppointments(),
        appointmentAPI.getPastAppointments(),
        appointmentAPI.getMedicalFields(),
      ]);

      setUpcomingAppointments(upcoming);
      setPastAppointments(past);
      setMedicalFields(fields);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await appointmentAPI.cancelAppointment(appointmentId);
      await loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to cancel appointment');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const isNewUser = upcomingAppointments.length === 0 && pastAppointments.length === 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Medical Scheduling</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              {user?.full_name || user?.phone_number}
            </span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isNewUser ? (
          /* New User View */
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-8 text-white">
              <h2 className="text-3xl font-bold mb-2">Welcome to MedSchedule!</h2>
              <p className="text-blue-100 mb-6">
                Book your first appointment with our trusted medical professionals
              </p>
              <button
                onClick={() => navigate('/book')}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Book Your First Appointment
              </button>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Available Medical Services
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {medicalFields.map((field) => (
                  <div
                    key={field.id}
                    className="bg-white p-6 rounded-lg shadow hover:shadow-md transition cursor-pointer"
                    onClick={() => navigate('/book', { state: { selectedField: field } })}
                  >
                    <div className="text-4xl mb-3">{field.icon}</div>
                    <h4 className="font-semibold text-gray-900 mb-2">{field.name}</h4>
                    <p className="text-sm text-gray-600">{field.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Returning User View */
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.full_name || 'Patient'}!
                </h2>
                <button
                  onClick={() => navigate('/book')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Book New Appointment
                </button>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Upcoming Appointments
              </h3>
              {upcomingAppointments.length === 0 ? (
                <p className="text-gray-500">No upcoming appointments</p>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                          <img
                            src={appointment.doctor_image}
                            alt={appointment.doctor_name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {appointment.doctor_name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {appointment.medical_field_name}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                              {formatDate(appointment.appointment_date)} at{' '}
                              {formatTime(appointment.start_time)}
                            </p>
                            {appointment.notes && (
                              <p className="text-sm text-gray-600 mt-1">
                                Note: {appointment.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCancelAppointment(appointment.id)}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Appointments */}
            {pastAppointments.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Past Appointments
                </h3>
                <div className="space-y-4">
                  {pastAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded-lg p-4 opacity-75"
                    >
                      <div className="flex gap-4">
                        <img
                          src={appointment.doctor_image}
                          alt={appointment.doctor_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {appointment.doctor_name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {appointment.medical_field_name}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            {formatDate(appointment.appointment_date)} at{' '}
                            {formatTime(appointment.start_time)}
                          </p>
                          <span className="inline-block mt-2 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
