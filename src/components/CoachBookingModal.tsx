// src/components/CoachBookingModal.tsx
import React, { useState } from 'react';
import './FixedBookingModal.css'; // reuse the same styles
// if you prefer, you can duplicate the css to CoachBookingModal.css and import that instead

interface CoachBookingFormValues {
  bookingName: string;
  phoneNumber: string;
  duration: string;
  startingDate: string;
  startingTime: string;
  pitch: string;
  bookingType: string;
  bookingPrice: string;
  totalReceived: string;
  paidAtStadium: boolean;
  coach: string;
  bookingCategory: string;
  notes: string;
}

interface CoachBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: CoachBookingFormValues) => void;
}

const CoachBookingModal: React.FC<CoachBookingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<CoachBookingFormValues>({
    bookingName: '',
    phoneNumber: '',
    duration: '60 minutes',
    startingDate: '',
    startingTime: '',
    pitch: 'Court 4',
    bookingType: 'By Owner',
    bookingPrice: '',
    totalReceived: '',
    paidAtStadium: false,
    coach: '',
    bookingCategory: '',
    notes: '',
  });

  const coaches = ['Coach 1', 'Coach 2', 'Coach 3']; // demo data

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTogglePaid = () => {
    setForm((prev) => ({ ...prev, paidAtStadium: !prev.paidAtStadium }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(form);
    onClose();
  };

  return (
    <div className="fixed-booking-backdrop">
      <div className="fixed-booking-modal">
        {/* HEADER */}
        <div className="fixed-booking-header">
          <h2>Add Booking</h2>
          <button className="fixed-booking-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* TABS ROW – Coach Bookings active */}
        <div className="fixed-booking-tabs">
          <button className="fixed-booking-tab">
            <span className="tab-icon">📅</span>
            <span>Single Bookings</span>
          </button>
          <button className="fixed-booking-tab">
            <span className="tab-icon">🔁</span>
            <span>Fixed Bookings</span>
          </button>
          <button className="fixed-booking-tab fixed-booking-tab--active">
            <span className="tab-icon">🏋️‍♂️</span>
            <span>Coach Bookings</span>
          </button>
          <button className="fixed-booking-tab">
            <span className="tab-icon">🏠</span>
            <span>Close Stadium</span>
          </button>
        </div>

        {/* FORM */}
        <form className="fixed-booking-form" onSubmit={handleSubmit}>
          {/* Booking name + phone */}
          <div className="fixed-booking-grid two-cols">
            <div className="fb-field">
              <label>Booking Name</label>
              <input
                type="text"
                name="bookingName"
                value={form.bookingName}
                onChange={handleChange}
                placeholder="Enter booking name"
              />
            </div>

            <div className="fb-field">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder="3x-xxx-xxxx"
              />
              <small className="form-hint">
                Search by name or phone number, or click the edit icon to enter
                manually.
              </small>
            </div>
          </div>

          {/* Coach select */}
          <div className="fb-field">
            <label>Coach</label>
            <select
              name="coach"
              value={form.coach}
              onChange={handleChange}
            >
              <option value="">Select coach</option>
              {coaches.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Duration + starting time */}
          <div className="fixed-booking-grid two-cols">
            <div className="fb-field">
              <label>Duration</label>
              <select
                name="duration"
                value={form.duration}
                onChange={handleChange}
              >
                <option value="60 minutes">60 minutes</option>
                <option value="90 minutes">90 minutes</option>
                <option value="120 minutes">120 minutes</option>
              </select>
            </div>

            <div className="fb-field">
              <label>Starting Time</label>
              <input
                type="time"
                name="startingTime"
                value={form.startingTime}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Starting date + pitch */}
          <div className="fixed-booking-grid two-cols">
            <div className="fb-field">
              <label>Starting Date</label>
              <input
                type="date"
                name="startingDate"
                value={form.startingDate}
                onChange={handleChange}
              />
            </div>

            <div className="fb-field">
              <label>Select Pitch</label>
              <select
                name="pitch"
                value={form.pitch}
                onChange={handleChange}
              >
                <option value="Court 1">Court 1</option>
                <option value="Court 2">Court 2</option>
                <option value="Court 3">Court 3</option>
                <option value="Court 4">Court 4</option>
                <option value="Court 5">Court 5</option>
                <option value="Court 6">Court 6</option>
              </select>
            </div>
          </div>

          {/* Booking type + price / total received + toggle */}
          <div className="fixed-booking-grid two-cols">
            <div className="fb-field">
              <label>Booking Type</label>
              <select
                name="bookingType"
                value={form.bookingType}
                onChange={handleChange}
              >
                <option>By Owner</option>
                <option>By Player</option>
              </select>
            </div>

            <div className="fb-field">
              <label>Booking Price</label>
              <input
                type="number"
                name="bookingPrice"
                value={form.bookingPrice}
                onChange={handleChange}
                placeholder="220"
              />
            </div>
          </div>

          <div className="fixed-booking-grid two-cols">
            <div className="fb-field">
              <label>Total Received</label>
              <input
                type="number"
                name="totalReceived"
                value={form.totalReceived}
                onChange={handleChange}
                placeholder="0"
              />
              <div className="fb-paid-toggle">
                <span>Paid at Stadium</span>
                <button
                  type="button"
                  className={`fb-switch ${
                    form.paidAtStadium ? 'fb-switch--on' : ''
                  }`}
                  onClick={handleTogglePaid}
                >
                  <span className="fb-switch-thumb" />
                </button>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="fb-field">
            <label>Booking Category</label>
            <select
              name="bookingCategory"
              value={form.bookingCategory}
              onChange={handleChange}
            >
              <option value="">Select category</option>
              <option value="League">League</option>
              <option value="Friends">Friends</option>
              <option value="Training">Training</option>
            </select>
          </div>

          {/* Notes */}
          <div className="fb-field">
            <label>Additional Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Write notes here…"
            />
          </div>

          {/* Footer buttons */}
          <div className="fixed-booking-footer">
            <button
              type="button"
              className="fb-btn fb-btn--ghost"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="fb-btn fb-btn--primary">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoachBookingModal;
