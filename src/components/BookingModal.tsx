import { useState } from 'react';
import { X, Calendar, Repeat, Dumbbell, Home } from 'lucide-react';
import './BookingModal.css';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  courts: Array<{ id: string; name: string }>;
  selectedDate?: Date;
}

type BookingTab = 'single' | 'fixed' | 'coach' | 'close';

const BookingModal = ({ isOpen, onClose, courts, selectedDate }: BookingModalProps) => {
  const [activeTab, setActiveTab] = useState<BookingTab>('single');
  const [bookingName, setBookingName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [duration, setDuration] = useState('60');
  const [startTime, setStartTime] = useState('05:30 PM');
  const [startingDate, setStartingDate] = useState(
    selectedDate ? selectedDate.toISOString().split('T')[0] : '2025-11-21'
  );
  const [selectedCourt, setSelectedCourt] = useState('Court 4');
  const [bookingType, setBookingType] = useState('By Owner');
  const [bookingPrice, setBookingPrice] = useState('');
  const [totalReceived, setTotalReceived] = useState('');
  const [paidAtStadium, setPaidAtStadium] = useState(false);

  if (!isOpen) return null;

  const tabs = [
    { id: 'single', label: 'Single Bookings', icon: Calendar },
    { id: 'fixed', label: 'Fixed Bookings', icon: Repeat },
    { id: 'coach', label: 'Coach Bookings', icon: Dumbbell },
    { id: 'close', label: 'Close Stadium', icon: Home },
  ];

  const durationOptions = ['30 minutes', '60 minutes', '90 minutes', '120 minutes'];
  const bookingTypeOptions = ['By Owner', 'By Customer', 'By Admin'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log({
      activeTab,
      bookingName,
      phoneNumber,
      duration,
      startTime,
      startingDate,
      selectedCourt,
      bookingType,
      bookingPrice,
      totalReceived,
      paidAtStadium,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Booking</h2>
          <button className="modal-close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`modal-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id as BookingTab)}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bookingName">Booking Name</label>
              <input
                type="text"
                id="bookingName"
                value={bookingName}
                onChange={(e) => setBookingName(e.target.value)}
                placeholder="Enter booking name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <div className="phone-input-wrapper">
                <input
                  type="text"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="966+ xxxx"
                />
                <button type="button" className="search-icon-button">
                  🔍
                </button>
              </div>
              <small className="form-hint">
                Search by name or phone number, or click the edit icon to enter manually.
              </small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration">Duration</label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                {durationOptions.map((option) => (
                  <option key={option} value={option.split(' ')[0]}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="startTime">Starting Time</label>
              <input
                type="text"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="05:30 PM"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startingDate">Starting Date</label>
              <input
                type="date"
                id="startingDate"
                value={startingDate}
                onChange={(e) => setStartingDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="selectPitch">Select Pitch</label>
              <select
                id="selectPitch"
                value={selectedCourt}
                onChange={(e) => setSelectedCourt(e.target.value)}
              >
                {courts.map((court) => (
                  <option key={court.id} value={court.name}>
                    {court.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bookingType">Booking Type</label>
              <select
                id="bookingType"
                value={bookingType}
                onChange={(e) => setBookingType(e.target.value)}
              >
                {bookingTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bookingPrice">Booking Price</label>
              <input
                type="number"
                id="bookingPrice"
                value={bookingPrice}
                onChange={(e) => setBookingPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="totalReceived">Total Received</label>
              <input
                type="number"
                id="totalReceived"
                value={totalReceived}
                onChange={(e) => setTotalReceived(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={paidAtStadium}
                  onChange={(e) => setPaidAtStadium(e.target.checked)}
                />
                <span>Paid at Stadium</span>
              </label>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Add Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
