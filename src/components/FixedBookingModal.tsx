import React, { useState } from 'react';
import './FixedBookingModal.css';

export type FixedBookingTab =
  | 'single'
  | 'fixed'
  | 'coach'
  | 'close-stadium';

export interface FixedBookingFormValues {
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
  bookingCategory: string;
  notes: string;
}

interface FixedBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (values: FixedBookingFormValues) => void;
  /** which tab should be active by default – usually "fixed" */
  initialTab?: FixedBookingTab;
}

const FixedBookingModal: React.FC<FixedBookingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTab = 'fixed',
}) => {
  const [activeTab, setActiveTab] = useState<FixedBookingTab>(initialTab);
  const [form, setForm] = useState<FixedBookingFormValues>({
    bookingName: '',
    phoneNumber: '',
    duration: '60 minutes',
    paymentMethod: 'Cash',
    startingDate: '',
    endDate: '',
    startingTime: '',
    repeatedDay: 'Friday',
    bookingType: 'By Owner',
    pitch: '',
    bookingPrice: '',
    totalReceived: '',
    isPaid: false,
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
    if (onSubmit) onSubmit(form);
    // you can remove this alert later – just for debug
    console.log('Fixed booking submit:', form);
  };

  const handleCancel = () => {
    onClose();
  };

  const tabLabel = (tab: FixedBookingTab) => {
    switch (tab) {
      case 'single':
        return 'Single Bookings';
      case 'fixed':
        return 'Fixed Bookings';
      case 'coach':
        return 'Coach Bookings';
      case 'close-stadium':
        return 'Close Stadium';
      default:
        return '';
    }
  };

  return (
    <div className="fixed-booking-overlay">
      <div className="fixed-booking-modal">
        {/* HEADER */}
        <div className="fixed-booking-header">
          <div className="fixed-booking-title">Add Booking</div>
          <button className="fixed-booking-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* TABS */}
        <div className="fixed-booking-tabs">
          {(['single', 'fixed', 'coach', 'close-stadium'] as FixedBookingTab[]).map(
            (tab) => (
              <button
                key={tab}
                type="button"
                className={`fixed-booking-tab ${
                  activeTab === tab ? 'active' : ''
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tabLabel(tab)}
              </button>
            )
          )}
        </div>

        {/* CONTENT – for now we show the same fixed booking form for all tabs */}
        <form className="fixed-booking-form" onSubmit={handleSubmit}>
          {/* ROW 1 */}
          <div className="fixed-booking-grid">
            <div className="fixed-booking-field">
              <label>Booking Name</label>
              <input
                name="bookingName"
                value={form.bookingName}
                onChange={handleChange}
                type="text"
                placeholder=""
              />
            </div>

            <div className="fixed-booking-field">
              <label>Phone Number</label>
              <div className="fixed-booking-input-with-icons">
                <span className="fb-icon-left">🔍</span>
                <input
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  type="tel"
                  placeholder="3 6 x x - x x x x"
                />
                <span className="fb-icon-right">✏️</span>
              </div>
              <div className="fixed-booking-help">
                Search by name or phone number, or click the edit icon to enter
                manually.
              </div>
            </div>
          </div>

          {/* ROW 2 */}
          <div className="fixed-booking-grid">
            <div className="fixed-booking-field">
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

            <div className="fixed-booking-field">
              <label>Payment Method</label>
              <select
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          {/* ROW 3 */}
          <div className="fixed-booking-grid">
            <div className="fixed-booking-field">
              <label>Starting Date</label>
              <div className="fixed-booking-input-with-icons">
                <input
                  name="startingDate"
                  value={form.startingDate}
                  onChange={handleChange}
                  type="date"
                />
              </div>
            </div>

            <div className="fixed-booking-field">
              <label>End Date</label>
              <div className="fixed-booking-input-with-icons">
                <input
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  type="date"
                  placeholder="dd/mm/yyyy"
                />
              </div>
            </div>
          </div>

          {/* ROW 4 */}
          <div className="fixed-booking-grid">
            <div className="fixed-booking-field">
              <label>Starting Time</label>
              <div className="fixed-booking-input-with-icons">
                <input
                  name="startingTime"
                  value={form.startingTime}
                  onChange={handleChange}
                  type="time"
                />
              </div>
            </div>

            <div className="fixed-booking-field">
              <label>Repeated Day</label>
              <select
                name="repeatedDay"
                value={form.repeatedDay}
                onChange={handleChange}
              >
                <option value="Sunday">Sunday</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
              </select>
            </div>
          </div>

          {/* ---- SECOND SCREEN PART ---- */}

          <div className="fixed-booking-grid">
            <div className="fixed-booking-field">
              <label>Booking Type</label>
              <select
                name="bookingType"
                value={form.bookingType}
                onChange={handleChange}
              >
                <option value="By Owner">By Owner</option>
                <option value="By Customer">By Customer</option>
              </select>
            </div>

            <div className="fixed-booking-field">
              <label>Select Pitch</label>
              <select
                name="pitch"
                value={form.pitch}
                onChange={handleChange}
              >
                <option value="">Select Pitch</option>
                <option value="Court 1">Court 1</option>
                <option value="Court 2">Court 2</option>
                <option value="Court 3">Court 3</option>
                <option value="Court 4">Court 4</option>
                <option value="Court 5">Court 5</option>
                <option value="Court 6">Court 6</option>
              </select>
            </div>
          </div>

          <div className="fixed-booking-grid">
            <div className="fixed-booking-field">
              <label>Booking Price</label>
              <input
                name="bookingPrice"
                value={form.bookingPrice}
                onChange={handleChange}
                type="number"
                placeholder="0"
              />
              <div className="fixed-booking-help">
                Total Bookings: SAR {form.bookingPrice || 0}
              </div>
            </div>

            <div className="fixed-booking-field">
              <label>Total Received</label>
              <div className="fixed-booking-toggle-row">
                <input
                  name="totalReceived"
                  value={form.totalReceived}
                  onChange={handleChange}
                  type="number"
                  placeholder="0"
                />
                <button
                  type="button"
                  className={`fixed-booking-toggle ${
                    form.isPaid ? 'on' : ''
                  }`}
                  onClick={handleTogglePaid}
                >
                  <span className="fixed-booking-toggle-knob" />
                </button>
                <span className="fixed-booking-toggle-label">Paid</span>
              </div>
            </div>
          </div>

          <div className="fixed-booking-field">
            <label>Booking Category</label>
            <select
              name="bookingCategory"
              value={form.bookingCategory}
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              <option value="League">League</option>
              <option value="Training">Training</option>
              <option value="Friendly">Friendly</option>
            </select>
          </div>

          <div className="fixed-booking-field">
            <label>Additional Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder=""
            />
          </div>

          {/* FOOTER BUTTONS */}
          <div className="fixed-booking-footer">
            <button
              type="button"
              className="fixed-booking-btn fixed-booking-btn-cancel"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="fixed-booking-btn fixed-booking-btn-submit"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FixedBookingModal;
