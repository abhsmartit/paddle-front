import { useState, useEffect } from 'react';
import { X, Calendar, Repeat, Dumbbell, Home } from 'lucide-react';
import { apiService } from '../services/api';
import type { Court, ApiBookingCategory, CreateBookingRequest } from '../types';
import './BookingModal.css';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  courts: Court[];
  selectedDate?: Date;
  clubId: string;
  onBookingCreated?: () => void;
}

type BookingTab = 'single' | 'fixed' | 'coach' | 'close';

const BookingModal = ({ isOpen, onClose, courts, selectedDate, clubId, onBookingCreated }: BookingModalProps) => {
  const [activeTab, setActiveTab] = useState<BookingTab>('single');
  const [bookingName, setBookingName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [duration, setDuration] = useState('60');
  const [startTime, setStartTime] = useState('17:30');
  const [startingDate, setStartingDate] = useState(
    selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [selectedCourt, setSelectedCourt] = useState('');
  const [bookingType, setBookingType] = useState<'SINGLE' | 'TEAM' | 'TOURNAMENT'>('SINGLE');
  const [bookingPrice, setBookingPrice] = useState('');
  const [totalReceived, setTotalReceived] = useState('');
  const [paidAtStadium, setPaidAtStadium] = useState(false);
  const [categories, setCategories] = useState<ApiBookingCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  useEffect(() => {
    if (isOpen && clubId) {
      loadCategories();
      // Set default court if available
      if (courts.length > 0 && !selectedCourt) {
        setSelectedCourt(courts[0].id || courts[0]._id || '');
      }
      // Calculate default price
      if (courts.length > 0 && !bookingPrice) {
        const court = courts.find(c => (c.id || c._id) === (selectedCourt || courts[0].id || courts[0]._id));
        if (court?.defaultPricePerHour) {
          const durationHours = parseInt(duration) / 60;
          setBookingPrice((court.defaultPricePerHour * durationHours).toString());
        }
      }
    }
  }, [isOpen, clubId, courts]);

  useEffect(() => {
    // Recalculate price when court or duration changes
    if (selectedCourt && duration) {
      const court = courts.find(c => (c.id || c._id) === selectedCourt);
      if (court?.defaultPricePerHour) {
        const durationHours = parseInt(duration) / 60;
        const calculatedPrice = court.defaultPricePerHour * durationHours;
        setBookingPrice(calculatedPrice.toString());
      }
    }
  }, [selectedCourt, duration, courts]);

  const loadCategories = async () => {
    try {
      const categoriesData = await apiService.getBookingCategories(clubId);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const searchCustomer = async () => {
    if (!phoneNumber || phoneNumber.length < 3) return;
    
    try {
      const customersData = await apiService.getCustomers(clubId, phoneNumber);
      setCustomers(customersData);
      
      if (customersData.length === 1) {
        const customer = customersData[0];
        setBookingName(customer.fullName);
        setSelectedCustomerId(customer._id);
      }
    } catch (err) {
      console.error('Failed to search customers:', err);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'single', label: 'Single Bookings', icon: Calendar },
    { id: 'fixed', label: 'Fixed Bookings', icon: Repeat },
    { id: 'coach', label: 'Coach Bookings', icon: Dumbbell },
    { id: 'close', label: 'Close Stadium', icon: Home },
  ];

  const durationOptions = [
    { value: '30', label: '30 minutes' },
    { value: '60', label: '60 minutes' },
    { value: '90', label: '90 minutes' },
    { value: '120', label: '120 minutes' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (!bookingName.trim()) {
      setError('Booking name is required');
      setLoading(false);
      return;
    }

    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      setLoading(false);
      return;
    }

    if (!selectedCourt) {
      setError('Please select a court');
      setLoading(false);
      return;
    }

    if (!bookingPrice || parseFloat(bookingPrice) <= 0) {
      setError('Please enter a valid price');
      setLoading(false);
      return;
    }

    try {
      // Parse start time (format: HH:mm)
      const [hours, minutes] = startTime.split(':').map(Number);
      const startDateTime = new Date(startingDate);
      startDateTime.setHours(hours, minutes, 0, 0);

      // Calculate end time based on duration
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + parseInt(duration));

      const bookingData: CreateBookingRequest = {
        courtId: selectedCourt,
        bookingName: bookingName.trim(),
        phone: phoneNumber.trim(),
        bookingType: bookingType,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        price: parseFloat(bookingPrice),
      };

      // Add optional fields
      if (selectedCustomerId) {
        bookingData.customerId = selectedCustomerId;
      }

      if (selectedCategory) {
        bookingData.bookingCategoryId = selectedCategory;
      }

      await apiService.createBooking(clubId, bookingData);
      
      // Handle payment if received
      if (totalReceived && parseFloat(totalReceived) > 0) {
        // Payment will be handled in the next step
        // For now, we can create the booking with PAID status
      }

      // Reset form
      setBookingName('');
      setPhoneNumber('');
      setDuration('60');
      setStartTime('17:30');
      setBookingPrice('');
      setTotalReceived('');
      setPaidAtStadium(false);
      setSelectedCategory('');
      setSelectedCustomerId('');
      setError(null);

      // Call the callback if provided
      if (onBookingCreated) {
        onBookingCreated();
      }

      onClose();
    } catch (err: any) {
      console.error('Failed to create booking:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
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
          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fee',
              color: '#c00',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bookingName">Booking Name *</label>
              <input
                type="text"
                id="bookingName"
                value={bookingName}
                onChange={(e) => setBookingName(e.target.value)}
                placeholder="Enter booking name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number *</label>
              <div className="phone-input-wrapper">
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+966 xxx xxx xxx"
                  required
                />
                <button 
                  type="button" 
                  className="search-icon-button"
                  onClick={searchCustomer}
                  title="Search customer"
                >
                  🔍
                </button>
              </div>
              <small className="form-hint">
                Search by name or phone number, or click the search icon.
              </small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration">Duration *</label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              >
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="startTime">Starting Time *</label>
              <input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startingDate">Starting Date *</label>
              <input
                type="date"
                id="startingDate"
                value={startingDate}
                onChange={(e) => setStartingDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="selectPitch">Select Court *</label>
              <select
                id="selectPitch"
                value={selectedCourt}
                onChange={(e) => setSelectedCourt(e.target.value)}
                required
              >
                <option value="">Choose a court</option>
                {courts.map((court) => (
                  <option key={court.id || court._id} value={court.id || court._id}>
                    {court.name} {court.isActive === false ? '(Inactive)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bookingType">Booking Type *</label>
              <select
                id="bookingType"
                value={bookingType}
                onChange={(e) => setBookingType(e.target.value as 'SINGLE' | 'TEAM' | 'TOURNAMENT')}
                required
              >
                <option value="SINGLE">Single</option>
                <option value="TEAM">Team</option>
                <option value="TOURNAMENT">Tournament</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category (Optional)</label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">No Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bookingPrice">Booking Price (SAR) *</label>
              <input
                type="number"
                id="bookingPrice"
                value={bookingPrice}
                onChange={(e) => setBookingPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="totalReceived">Total Received (SAR)</label>
              <input
                type="number"
                id="totalReceived"
                value={totalReceived}
                onChange={(e) => setTotalReceived(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
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
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Creating...' : 'Add Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
