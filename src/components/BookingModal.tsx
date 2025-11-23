// src/components/BookingModal.tsx
import React, { useState } from 'react';
import './BookingModal.css';
import type { Court } from '../types';

type Tab = 'single' | 'fixed' | 'coach' | 'close';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  courts: Court[];
  selectedDate: Date;
}

interface BookingFormState {
  bookingName: string;
  phoneNumber: string;
  duration: string;
  paymentMethod: string;
  startingDate: string;
  endDate: string;
  startingTime: string;
  repeatedDay: string;
  bookingType: string;
  pitch: string;
  bookingPrice: string;
  totalReceived: string;
  isPaid: boolean;
  coach: string;
  bookingCategory: string;
  notes: string;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  courts,
  selectedDate,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('single');

  const [form, setForm] = useState<BookingFormState>({
    bookingName: '',
    phoneNumber: '',
    duration: '60 minutes',
    paymentMethod: 'Cash',
    startingDate: selectedDate.toISOString().substring(0, 10),
    endDate: '',
    startingTime: '',
    repeatedDay: 'Friday',
    bookingType: 'By Owner',
    pitch: courts[0]?.id || '',
    bookingPrice: '',
    totalReceived: '',
    isPaid: false,
    coach: '',
    bookingCategory: '',
    notes: '',
  });

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTogglePaid = () => {
    setForm((prev) => ({ ...prev, isPaid: !prev.isPaid }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit booking', { activeTab, form });
    onClose();
  };

  /* ---------- SINGLE BOOKING FORM ---------- */
  const renderSingleForm = () => (
    <>
      <div className="bm-grid two-cols">
        <div className="bm-field">
          <label>Booking Name</label>
          <input
            type="text"
            name="bookingName"
            value={form.bookingName}
            onChange={handleChange}
            placeholder="Enter booking name"
          />
        </div>

        <div className="bm-field">
          <label>Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            placeholder="966+ xxxx"
          />
        </div>
      </div>

      <div className="bm-grid two-cols">
        <div className="bm-field">
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

        <div className="bm-field">
          <label>Starting Time</label>
          <input
            type="time"
            name="startingTime"
            value={form.startingTime}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="bm-grid two-cols">
        <div className="bm-field">
          <label>Starting Date</label>
          <input
            type="date"
            name="startingDate"
            value={form.startingDate}
            onChange={handleChange}
          />
        </div>

        <div className="bm-field">
          <label>Select Pitch</label>
          <select
            name="pitch"
            value={form.pitch}
            onChange={handleChange}
          >
            {courts.map((court) => (
              <option key={court.id} value={court.id}>
                {court.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bm-grid two-cols">
        <div className="bm-field">
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

        <div className="bm-field">
          <label>Booking Price</label>
          <input
            type="number"
            name="bookingPrice"
            value={form.bookingPrice}
            onChange={handleChange}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="bm-grid two-cols">
        <div className="bm-field">
          <label>Total Received</label>
          <input
            type="number"
            name="totalReceived"
            value={form.totalReceived}
            onChange={handleChange}
            placeholder="0.00"
          />
        </div>
      </div>
    </>
  );

  /* ---------- FIXED BOOKING FORM ---------- */
  const renderFixedForm = () => (
    <>
      <div className="bm-grid two-cols">
        <div className="bm-field">
          <label>Booking Name</label>
          <input
            type="text"
            name="bookingName"
            value={form.bookingName}
            onChange={handleChange}
            placeholder="Enter booking name"
          />
        </div>

        <div className="bm-field">
          <label>Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            placeholder="3x-xxx-xxxx"
          />
        </div>
      </div>

      <div className="bm-grid two-cols">
        <div className="bm-field">
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

        <div className="bm-field">
          <label>Payment Method</label>
          <select
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
          >
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Transfer">Transfer</option>
          </select>
        </div>
      </div>

      <div className="bm-grid two-cols">
        <div className="bm-field">
          <label>Starting Date</label>
          <input
            type="date"
            name="startingDate"
            value={form.startingDate}
            onChange={handleChange}
          />
        </div>

        <div className="bm-field">
          <label>End Date</label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="bm-grid two-cols">
        <div className="bm-field">
          <label>Starting Time</label>
          <input
            type="time"
            name="startingTime"
            value={form.startingTime}
            onChange={handleChange}
          />
        </div>

        <div className="bm-field">
          <label>Repeated Day</label>
          <select
            name="repeatedDay"
            value={form.repeatedDay}
            onChange={handleChange}
          >
            <option>Sunday</option>
            <option>Monday</option>
            <option>Tuesday</option>
            <option>Wednesday</option>
            <option>Thursday</option>
            <option>Friday</option>
            <option>Saturday</option>
          </select>
        </div>
      </div>

      <div className="bm-grid two-cols">
        <div className="bm-field">
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

        <div className="bm-field">
          <label>Select Pitch</label>
          <select
            name="pitch"
            value={form.pitch}
            onChange={handleChange}
          >
            {courts.map((court) => (
              <option key={court.id} value={court.id}>
                {court.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bm-grid two-cols">
        <div className="bm-field">
          <label>Booking Price</label>
          <input
            type="number"
            name="bookingPrice"
            value={form.bookingPrice}
            onChange={handleChange}
            placeholder="220"
          />
          <small>Total Bookings: SAR 0</small>
        </div>

        <div className="bm-field">
          <label>Total Received</label>
          <input
            type="number"
            name="totalReceived"
            value={form.totalReceived}
            onChange={handleChange}
            placeholder="0"
          />
          <div className="bm-paid-toggle">
            <span>Paid</span>
            <button
              type="button"
              className={`bm-switch ${form.isPaid ? 'bm-switch--on' : ''}`}
              onClick={handleTogglePaid}
            >
              <span className="bm-switch-thumb" />
            </button>
          </div>
        </div>
      </div>

      <div className="bm-field">
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

      <div className="bm-field">
        <label>Additional Notes</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Write notes here…"
        />
      </div>
    </>
  );

  /* ---------- COACH BOOKING FORM (NEW) ---------- */
  const renderCoachForm = () => (
    <>
      {/* Booking name + phone */}
      <div className="bm-grid two-cols">
        <div className="bm-field">
          <label>Booking Name</label>
          <input
            type="text"
            name="bookingName"
            value={form.bookingName}
            onChange={handleChange}
            placeholder="Enter booking name"
          />
        </div>

        <div className="bm-field">
          <label>Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            placeholder="3x-xxx-xxxx"
          />
          <small>Search by name or phone number, or click the edit icon to enter manually.</small>
        </div>
      </div>

      {/* Coach */}
      <div className="bm-field">
        <label>Coach</label>
        <select
          name="coach"
          value={form.coach}
          onChange={handleChange}
        >
          <option value="">Select coach</option>
          <option value="Coach 1">Coach 1</option>
          <option value="Coach 2">Coach 2</option>
          <option value="Coach 3">Coach 3</option>
        </select>
      </div>

      {/* Duration + starting time */}
      <div className="bm-grid two-cols">
        <div className="bm-field">
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

        <div className="bm-field">
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
      <div className="bm-grid two-cols">
        <div className="bm-field">
          <label>Starting Date</label>
          <input
            type="date"
            name="startingDate"
            value={form.startingDate}
            onChange={handleChange}
          />
        </div>

        <div className="bm-field">
          <label>Select Pitch</label>
          <select
            name="pitch"
            value={form.pitch}
            onChange={handleChange}
          >
            {courts.map((court) => (
              <option key={court.id} value={court.id}>
                {court.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Booking type + price */}
      <div className="bm-grid two-cols">
        <div className="bm-field">
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

        <div className="bm-field">
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

      {/* Total received + paid at stadium */}
      <div className="bm-grid two-cols">
        <div className="bm-field">
          <label>Total Received</label>
          <input
            type="number"
            name="totalReceived"
            value={form.totalReceived}
            onChange={handleChange}
            placeholder="0"
          />
          <div className="bm-paid-toggle">
            <span>Paid at Stadium</span>
            <button
              type="button"
              className={`bm-switch ${form.isPaid ? 'bm-switch--on' : ''}`}
              onClick={handleTogglePaid}
            >
              <span className="bm-switch-thumb" />
            </button>
          </div>
        </div>
      </div>

      {/* Category */}
      <div className="bm-field">
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
      <div className="bm-field">
        <label>Additional Notes</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Write notes here…"
        />
      </div>
    </>
  );

  /* ---------- CLOSE STADIUM PLACEHOLDER ---------- */
  const renderCloseStadiumForm = () => (
    <div style={{ paddingTop: 8, fontSize: 14, color: '#6b7280' }}>
      Close Stadium form can go here later.
    </div>
  );

  return (
    <div className="bm-backdrop">
      <div className="bm-modal">
        {/* Header */}
        <div className="bm-header">
          <h2>Add Booking</h2>
          <button className="bm-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="bm-tabs">
          <button
            type="button"
            className={`bm-tab ${activeTab === 'single' ? 'bm-tab--active' : ''}`}
            onClick={() => setActiveTab('single')}
          >
            <span>📅</span>
            <span>Single Bookings</span>
          </button>
          <button
            type="button"
            className={`bm-tab ${activeTab === 'fixed' ? 'bm-tab--active' : ''}`}
            onClick={() => setActiveTab('fixed')}
          >
            <span>🔁</span>
            <span>Fixed Bookings</span>
          </button>
          <button
            type="button"
            className={`bm-tab ${activeTab === 'coach' ? 'bm-tab--active' : ''}`}
            onClick={() => setActiveTab('coach')}
          >
            <span>🏋️‍♂️</span>
            <span>Coach Bookings</span>
          </button>
          <button
            type="button"
            className={`bm-tab ${activeTab === 'close' ? 'bm-tab--active' : ''}`}
            onClick={() => setActiveTab('close')}
          >
            <span>🏠</span>
            <span>Close Stadium</span>
          </button>
        </div>

        {/* Form body */}
        <form className="bm-form" onSubmit={handleSubmit}>
          {activeTab === 'single' && renderSingleForm()}
          {activeTab === 'fixed' && renderFixedForm()}
          {activeTab === 'coach' && renderCoachForm()}
          {activeTab === 'close' && renderCloseStadiumForm()}

          {/* Footer buttons */}
          <div className="bm-footer">
            <button
              type="button"
              className="bm-btn bm-btn--ghost"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="bm-btn bm-btn--primary">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
