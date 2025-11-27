import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { X, Calendar, Repeat, Dumbbell, Home } from 'lucide-react';
import { apiService } from '../services/api';
import type { Court, ApiBookingCategory, CreateBookingRequest, CreateFixedBookingRequest, Customer, Coach, ClosedDate } from '../types';
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
  const [bookingType, setBookingType] = useState<'SINGLE' | 'TEAM' | 'TOURNAMENT' | 'COACH'>('SINGLE');
  const [bookingPrice, setBookingPrice] = useState('');
  const [totalReceived, setTotalReceived] = useState('');
  const [paidAtStadium, setPaidAtStadium] = useState(false);
  const [categories, setCategories] = useState<ApiBookingCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  
  // Fixed booking specific states
  const [endDate, setEndDate] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  
  // Coach booking specific states
  const [selectedCoach, setSelectedCoach] = useState('');
  const [coaches, setCoaches] = useState<Coach[]>([]);

  // Close Stadium specific states
  const [closedDates, setClosedDates] = useState<ClosedDate[]>([]);
  const [newClosedDate, setNewClosedDate] = useState('');
  const [closedReason, setClosedReason] = useState('');

  const loadClosedDates = useCallback(async () => {
    try {
      const closedDatesData = await apiService.getClosedDates(clubId);
      setClosedDates(closedDatesData);
    } catch (err) {
      console.error('Failed to load closed dates:', err);
      toast.error('Failed to load closed dates');
    }
  }, [clubId]);

  const loadCategories = useCallback(async () => {
    try {
      const categoriesData = await apiService.getBookingCategories(clubId);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to load categories:', err);
      toast.error('Failed to load booking categories');
    }
  }, [clubId]);

  const loadCoaches = useCallback(async () => {
    try {
      const coachesData = await apiService.getCoaches(clubId);
      setCoaches(coachesData);
    } catch (err) {
      console.error('Failed to load coaches:', err);
      toast.error('Failed to load coaches');
    }
  }, [clubId]);

  useEffect(() => {
    if (isOpen && clubId) {
      loadCategories();
      if (activeTab === 'coach') {
        loadCoaches();
      }
      if (activeTab === 'close') {
        loadClosedDates();
      }
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
  }, [isOpen, clubId, courts, activeTab, loadCategories, loadCoaches, loadClosedDates, selectedCourt, bookingPrice, duration]);

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
      toast.error('Failed to search customers');
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  const handleAddClosedDate = async () => {
    if (!newClosedDate || !closedReason) {
      toast.error('Please fill in both date and reason');
      return;
    }

    try {
      setLoading(true);
      await apiService.createClosedDate(clubId, {
        closedDate: newClosedDate,
        reason: closedReason
      });
      toast.success('Closed date added successfully');
      setNewClosedDate('');
      setClosedReason('');
      await loadClosedDates();
    } catch (err: any) {
      console.error('Failed to add closed date:', err);
      toast.error(err.response?.data?.message || 'Failed to add closed date');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClosedDate = async (closedDateId: string) => {
    if (!window.confirm('Are you sure you want to delete this closed date?')) {
      return;
    }

    try {
      setLoading(true);
      await apiService.deleteClosedDate(closedDateId);
      toast.success('Closed date deleted successfully');
      await loadClosedDates();
    } catch (err: any) {
      console.error('Failed to delete closed date:', err);
      toast.error(err.response?.data?.message || 'Failed to delete closed date');
    } finally {
      setLoading(false);
    }
  };

  const formatDisplayDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Helper function to check if a date is closed
  const isDateClosed = (dateString: string) => {
    if (!dateString) return false;
    return closedDates.some(closedDate => 
      closedDate.closedDate === dateString
    );
  };

  // Helper function to format date for comparison (YYYY-MM-DD)
  const formatDateForComparison = (date: Date) => {
    return date.toISOString().split('T')[0];
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

    // Handle close stadium tab differently
    if (activeTab === 'close') {
      setLoading(false);
      return; // Close tab doesn't create bookings
    }

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

    // Check if booking date is closed
    if (isDateClosed(startingDate)) {
      setError('Cannot book on a closed date. Please select a different date.');
      setLoading(false);
      return;
    }

    // Additional validation for fixed bookings
    if (activeTab === 'fixed') {
      if (!endDate) {
        setError('End date is required for fixed bookings');
        setLoading(false);
        return;
      }
      if (selectedDays.length === 0) {
        setError('Please select at least one day of the week');
        setLoading(false);
        return;
      }
      // Check if end date is closed for fixed bookings
      if (isDateClosed(endDate)) {
        setError('Cannot set end date on a closed date. Please select a different end date.');
        setLoading(false);
        return;
      }
    }

    // Additional validation for coach bookings
    if (activeTab === 'coach' && !selectedCoach) {
      setError('Please select a coach');
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

      if (activeTab === 'single') {
        // Single booking
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

        if (notes) {
          bookingData.notes = notes;
        }

        await apiService.createBooking(clubId, bookingData);
      } else if (activeTab === 'fixed') {
        // Fixed booking - now supports multiple days of the week
        const fixedBookingData: CreateFixedBookingRequest = {
          courtId: selectedCourt,
          bookingName: bookingName.trim(),
          phone: phoneNumber.trim(),
          bookingType: "FIXED",
          startDateTime: startDateTime.toISOString(),
          durationMinutes: parseInt(duration),
          repeatedDaysOfWeek: selectedDays.map(day => day.toUpperCase()),
          recurrenceEndDate: endDate,
          price: parseFloat(bookingPrice),
        };

        if (selectedCustomerId) {
          fixedBookingData.customerId = selectedCustomerId;
        }

        if (selectedCategory) {
          fixedBookingData.bookingCategoryId = selectedCategory;
        }

        if (notes) {
          fixedBookingData.notes = notes;
        }

        await apiService.createFixedBooking(clubId, fixedBookingData);
      } else if (activeTab === 'coach') {
        // Coach booking - uses same endpoint as single booking but with COACH type
        const coachBookingData: CreateBookingRequest = {
          courtId: selectedCourt,
          coachId: selectedCoach,
          bookingName: bookingName.trim(),
          phone: phoneNumber.trim(),
          bookingType: 'COACH',
          startDateTime: startDateTime.toISOString(),
          endDateTime: endDateTime.toISOString(),
          price: parseFloat(bookingPrice),
        };

        if (selectedCustomerId) {
          coachBookingData.customerId = selectedCustomerId;
        }

        if (selectedCategory) {
          coachBookingData.bookingCategoryId = selectedCategory;
        }

        if (notes) {
          coachBookingData.notes = notes;
        }

        await apiService.createBooking(clubId, coachBookingData);
      }
      
      // Handle payment if received
      if (totalReceived && parseFloat(totalReceived) > 0) {
        // Payment will be handled in the next step
        // For now, we can create the booking with PAID status
      }

      // Reset form
      resetForm();

      // Call the callback if provided
      if (onBookingCreated) {
        onBookingCreated();
      }

      toast.success('Booking created successfully!');
      onClose();
    } catch (err) {
      console.error('Failed to create booking:', err);
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create booking';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setBookingName('');
    setPhoneNumber('');
    setDuration('60');
    setStartTime('17:30');
    setBookingPrice('');
    setTotalReceived('');
    setPaidAtStadium(false);
    setSelectedCategory('');
    setSelectedCustomerId('');
    setEndDate('');
    setSelectedDays([]);
    setPaymentMethod('Cash');
    setNotes('');
    setSelectedCoach('');
    setError(null);
  };

  // Render Close Stadium Tab Content
  const renderCloseStadiumTab = () => (
    <div className="modal-form">
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

      <div className="close-stadium-content">
        <h3>Stadium Closed Dates</h3>
        
        {/* Add new closed date */}
        <div className="add-closed-date-section">
          <h4>Add New Closed Date</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="newClosedDate">Date</label>
              <input
                type="date"
                id="newClosedDate"
                value={newClosedDate}
                onChange={(e) => setNewClosedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label htmlFor="closedReason">Reason</label>
              <input
                type="text"
                id="closedReason"
                value={closedReason}
                onChange={(e) => setClosedReason(e.target.value)}
                placeholder="e.g., New Year Day, Maintenance"
              />
            </div>
          </div>
          <button 
            type="button" 
            className="btn-add-closed-date"
            onClick={handleAddClosedDate}
            disabled={loading || !newClosedDate || !closedReason}
          >
            {loading ? 'Adding...' : 'Add Closed Date'}
          </button>
        </div>

        {/* Display existing closed dates */}
        <div className="existing-closed-dates-section">
          <h4>Existing Closed Dates</h4>
          {closedDates.length === 0 ? (
            <div className="no-closed-dates">
              <p>No closed dates scheduled. Stadium is available on all dates.</p>
            </div>
          ) : (
            <div className="closed-dates-list">
              {closedDates
                .sort((a, b) => new Date(a.closedDate).getTime() - new Date(b.closedDate).getTime())
                .map((closedDate) => (
                <div key={closedDate._id} className="closed-date-item">
                  <div className="closed-date-info">
                    <span className="closed-date-date">{formatDisplayDate(closedDate.closedDate)}</span>
                    <span className="closed-date-reason">{closedDate.reason}</span>
                  </div>
                  <button 
                    type="button"
                    className="btn-delete-closed-date"
                    onClick={() => handleDeleteClosedDate(closedDate._id)}
                    disabled={loading}
                    title="Delete closed date"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="modal-actions">
        <button type="button" className="btn-cancel" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-tabs">
          <div className="tabs-container">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`modal-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id as BookingTab)}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
          <button className="modal-close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {activeTab === 'close' ? renderCloseStadiumTab() : (
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

            {/* Common fields for all booking types */}
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

            {/* Coach Booking specific: Coach selection */}
            {activeTab === 'coach' && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="coach">Coach *</label>
                  <select
                    id="coach"
                    value={selectedCoach}
                    onChange={(e) => setSelectedCoach(e.target.value)}
                    required
                  >
                    <option value="">Select coach</option>
                    {coaches.map((coach) => (
                      <option key={coach._id || coach.id} value={coach._id || coach.id}>
                        {coach.name || coach.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

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
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    if (isDateClosed(selectedDate)) {
                      setError('This date is closed. Please select a different date.');
                    } else {
                      setError(null);
                    }
                    setStartingDate(selectedDate);
                  }}
                  min={formatDateForComparison(new Date())}
                  className={isDateClosed(startingDate) ? 'date-closed' : ''}
                  required
                />
                {isDateClosed(startingDate) && (
                  <small className="date-closed-warning">
                    ⚠️ This date is closed: {closedDates.find(cd => cd.closedDate === startingDate)?.reason}
                  </small>
                )}
              </div>

              {/* Fixed Booking specific: End Date */}
              {activeTab === 'fixed' ? (
                <div className="form-group">
                  <label htmlFor="endDate">End Date *</label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => {
                      const selectedEndDate = e.target.value;
                      if (isDateClosed(selectedEndDate)) {
                        setError('This end date is closed. Please select a different date.');
                      } else {
                        setError(null);
                      }
                      setEndDate(selectedEndDate);
                    }}
                    min={startingDate || formatDateForComparison(new Date())}
                    className={isDateClosed(endDate) ? 'date-closed' : ''}
                    required
                  />
                  {isDateClosed(endDate) && (
                    <small className="date-closed-warning">
                      ⚠️ This date is closed: {closedDates.find(cd => cd.closedDate === endDate)?.reason}
                    </small>
                  )}
                </div>
              ) : (
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
              )}
            </div>

            {/* Fixed Booking specific: Repeated Day and Court selection in second row */}
            {activeTab === 'fixed' && (
              <>
                <div className="form-group full-width">
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

                <div className="form-group full-width">
                  <label>Repeated Days of Week *</label>
                  <div className="days-selector">
                    {daysOfWeek.map((day) => (
                      <button
                        key={day}
                        type="button"
                        className={`day-button ${selectedDays.includes(day) ? 'selected' : ''}`}
                        onClick={() => toggleDay(day)}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                  {selectedDays.length > 0 && (
                    <div className="selected-days-info">
                      Selected: {selectedDays.join(', ')}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Show notes field for all tabs */}
            {(activeTab === 'fixed' || activeTab === 'single' || activeTab === 'coach') && (
              <div className="form-group full-width">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  rows={3}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e5e5e5' }}
                />
              </div>
            )}

            {/* Single and Fixed bookings: Booking Type row */}
            {activeTab !== 'coach' && (
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

                {activeTab === 'fixed' ? (
                  <div className="form-group">
                    <label htmlFor="paymentMethod">Payment Method *</label>
                    <select
                      id="paymentMethod"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      required
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                ) : (
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
                )}
              </div>
            )}

            {/* Category for Coach and Fixed bookings */}
            {(activeTab === 'coach' || activeTab === 'fixed') && (
              <div className="form-row">
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
            )}

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

            {/* Additional Notes for Fixed and Coach bookings */}
            {(activeTab === 'fixed' || activeTab === 'coach') && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="notes">Additional Notes</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Write notes here…"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Creating...' : 'Add Booking'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingModal;