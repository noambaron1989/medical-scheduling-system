import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { appointmentAPI } from '../services/api';
import { MedicalField, Doctor, TimeSlot } from '../types';

type BookingStep = 'field' | 'doctor' | 'time' | 'confirm';

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<BookingStep>('field');
  const [loading, setLoading] = useState(false);

  // Data
  const [medicalFields, setMedicalFields] = useState<MedicalField[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Selections
  const [selectedField, setSelectedField] = useState<MedicalField | null>(
    location.state?.selectedField || null
  );
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadMedicalFields();
    if (location.state?.selectedField) {
      setStep('doctor');
      loadDoctors(location.state.selectedField.id);
    }
  }, []);

  const loadMedicalFields = async () => {
    try {
      const fields = await appointmentAPI.getMedicalFields();
      setMedicalFields(fields);
    } catch (error) {
      console.error('Failed to load medical fields:', error);
    }
  };

  const loadDoctors = async (fieldId: number) => {
    setLoading(true);
    try {
      const doctorList = await appointmentAPI.getDoctorsByField(fieldId);
      setDoctors(doctorList);
    } catch (error) {
      console.error('Failed to load doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTimeSlots = async (doctorId: number, date: string) => {
    setLoading(true);
    try {
      const slots = await appointmentAPI.getAvailableSlots(doctorId, date);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Failed to load time slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldSelect = (field: MedicalField) => {
    setSelectedField(field);
    setSelectedDoctor(null);
    setSelectedSlot(null);
    loadDoctors(field.id);
    setStep('doctor');
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedSlot(null);
    setSelectedDate('');
    setStep('time');
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    if (selectedDoctor) {
      loadTimeSlots(selectedDoctor.id, date);
    }
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!selectedField || !selectedDoctor || !selectedSlot) {
      return;
    }

    setLoading(true);
    try {
      await appointmentAPI.createAppointment({
        doctor_id: selectedDoctor.id,
        medical_field_id: selectedField.id,
        appointment_date: selectedSlot.date,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        notes,
      });

      alert('Appointment booked successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-gray-900"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { key: 'field', label: 'Medical Field' },
              { key: 'doctor', label: 'Select Doctor' },
              { key: 'time', label: 'Choose Time' },
              { key: 'confirm', label: 'Confirm' },
            ].map((s, index) => (
              <React.Fragment key={s.key}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step === s.key
                        ? 'bg-blue-600 text-white'
                        : index < ['field', 'doctor', 'time', 'confirm'].indexOf(step)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-xs mt-1 text-gray-600">{s.label}</span>
                </div>
                {index < 3 && (
                  <div className="flex-1 h-1 bg-gray-300 mx-2 mt-[-20px]" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {step === 'field' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Select Medical Field
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {medicalFields.map((field) => (
                  <div
                    key={field.id}
                    onClick={() => handleFieldSelect(field)}
                    className={`p-6 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition ${
                      selectedField?.id === field.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="text-4xl mb-3">{field.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">{field.name}</h3>
                    <p className="text-sm text-gray-600">{field.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'doctor' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Select Doctor
              </h2>
              <p className="text-gray-600 mb-6">
                Specialty: {selectedField?.name}
              </p>
              {loading ? (
                <div className="text-center py-8">Loading doctors...</div>
              ) : doctors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No doctors available for this specialty
                </div>
              ) : (
                <div className="space-y-4">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      onClick={() => handleDoctorSelect(doctor)}
                      className={`flex gap-4 p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition ${
                        selectedDoctor?.id === doctor.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={doctor.image_url}
                        alt={doctor.full_name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {doctor.full_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {doctor.experience_years} years experience
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{doctor.bio}</p>
                        <div className="flex items-center mt-2">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm text-gray-700 ml-1">
                            {doctor.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => setStep('field')}
                className="mt-6 text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Change Medical Field
              </button>
            </div>
          )}

          {step === 'time' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Choose Date & Time
              </h2>
              <p className="text-gray-600 mb-6">
                Doctor: {selectedDoctor?.full_name}
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {selectedDate && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">
                    Available Time Slots
                  </h3>
                  {loading ? (
                    <div className="text-center py-8">Loading slots...</div>
                  ) : timeSlots.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No available slots for this date
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {timeSlots
                        .filter((slot) => slot.available)
                        .map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => handleSlotSelect(slot)}
                            className={`py-2 px-4 border-2 rounded-lg font-medium transition ${
                              selectedSlot?.start_time === slot.start_time
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 hover:border-blue-300'
                            }`}
                          >
                            {formatTime(slot.start_time)}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setStep('doctor')}
                className="mt-6 text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Change Doctor
              </button>
            </div>
          )}

          {step === 'confirm' && selectedSlot && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Confirm Appointment
              </h2>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-600">Medical Field</span>
                    <p className="font-semibold text-gray-900">
                      {selectedField?.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Doctor</span>
                    <p className="font-semibold text-gray-900">
                      {selectedDoctor?.full_name}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Date & Time</span>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedSlot.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}{' '}
                      at {formatTime(selectedSlot.start_time)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional information for your appointment..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('time')}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
