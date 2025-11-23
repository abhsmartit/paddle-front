import React, { useState, Fragment } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Booking, Court, ViewMode } from '../types';
import BookingCard from './BookingCard';
import BookingDetailsModal from './BookingDetailsModal';
import './ScheduleView.css';

interface ScheduleViewProps {
  courts: Court[];
  bookings: Booking[];
  selectedDate: Date;
  viewMode: ViewMode;
  onDateChange: (date: Date) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onBookingDragDrop?: (bookingId: string, newCourtId: string, newStartTime: string, newEndTime: string, date: string) => Promise<void>;
}

const ScheduleView = ({
  courts,
  bookings,
  selectedDate,
  viewMode,
  onDateChange,
  onViewModeChange,
  onBookingDragDrop,
}: ScheduleViewProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [draggedBooking, setDraggedBooking] = useState<Booking | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // --- Handlers ---
  const handlePrevious = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const handleDragStart = (booking: Booking) => {
    setDraggedBooking(booking);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedBooking(null);
  };

  const getTimeFromSlot = (slotIndex: number): string => {
    const hour = Math.floor(slotIndex / 2) % 24;
    const minutes = slotIndex % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  };

  const handleDrop = async (courtId: string, slotIndex: number) => {
    if (!draggedBooking || !onBookingDragDrop) {
      setDraggedBooking(null);
      return;
    }

    const duration = getDuration(draggedBooking.startTime, draggedBooking.endTime);
    const newStartTime = getTimeFromSlot(slotIndex);
    const newEndTime = getTimeFromSlot(slotIndex + duration);
    const currentDateStr = format(selectedDate, 'yyyy-MM-dd');

    // Call the API handler
    await onBookingDragDrop(
      draggedBooking.id,
      courtId,
      newStartTime,
      newEndTime,
      currentDateStr
    );

    setDraggedBooking(null);
  };

  const toggleCalendar = () => {
    setIsCalendarOpen((prev) => !prev);
  };

  const handleDateSelect = (date: Date) => {
    onDateChange(date);
    setIsCalendarOpen(false);
  };

  // --- Calendar data ---
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  // --- Grid Logic ---
  const currentDateStr = format(selectedDate, 'yyyy-MM-dd');
  
  // Filter bookings to show:
  // 1. Bookings that start on current date
  // 2. Overnight bookings from previous day that end on current date
  const dayBookings = bookings.filter((booking) => {
    const startsToday = booking.date === currentDateStr;
    const endsToday = booking.isOvernightBooking && booking.endDate === currentDateStr;
    return startsToday || endsToday;
  });

  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minutes = i % 2 === 0 ? '00' : '30';
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  });

  const getSlotIndex = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 2 + (minutes >= 30 ? 1 : 0);
  };

  const getDuration = (startTime: string, endTime: string): number => {
    const start = getSlotIndex(startTime);
    let end = getSlotIndex(endTime);
    if (end <= start) end += 48;
    return end - start;
  };

  const getDisplayDuration = (booking: Booking): number => {
    // For overnight bookings ending today, calculate from midnight
    if (booking.isOvernightBooking && booking.endDate === currentDateStr) {
      const e = getSlotIndex(booking.endTime);
      return e; // From 00:00 to end time
    }
    
    // For bookings starting today
    const s = getSlotIndex(booking.startTime);
    const e = getSlotIndex(booking.endTime);
    
    // If booking ends after midnight (overnight), show until end of day
    if (e <= s) return 48 - s;
    
    return e - s;
  };

  return (
    <div className="schedule-view">
      {/* --- Controls Header --- */}
      <div className="schedule-controls-header">
        {/* Previous / Next Buttons */}
        <div className="nav-group">
          <button className="nav-btn" onClick={handlePrevious}>
            <ChevronLeft size={18} />
            <span>Previous</span>
          </button>
          <button className="nav-btn" onClick={handleNext}>
            <span>Next</span>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Date Display + Calendar */}
        <div className="date-display-container">
          <button
            type="button"
            className="date-display-wrapper"
            onClick={toggleCalendar}
          >
            <span>{format(selectedDate, 'EEEE, MMM dd')}</span>
            <ChevronDown size={16} />
          </button>

          {isCalendarOpen && (
            <div className="date-picker-dropdown">
              <div className="date-picker-header">
                <button
                  type="button"
                  className="date-picker-nav-btn"
                  onClick={() => onDateChange(subMonths(selectedDate, 1))}
                >
                  ‹
                </button>
                <span className="date-picker-month-label">
                  {format(selectedDate, 'MMMM yyyy')}
                </span>
                <button
                  type="button"
                  className="date-picker-nav-btn"
                  onClick={() => onDateChange(addMonths(selectedDate, 1))}
                >
                  ›
                </button>
              </div>

              <div className="date-picker-weekdays">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              <div className="date-picker-grid">
                {calendarDays.map((day) => {
                  const inCurrentMonth = isSameMonth(day, monthStart);
                  const selected = isSameDay(day, selectedDate);

                  return (
                    <button
                      type="button"
                      key={day.toISOString()}
                      className={[
                        'date-picker-day',
                        inCurrentMonth ? '' : 'date-picker-day--faded',
                        selected ? 'date-picker-day--selected' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => handleDateSelect(day)}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* View Mode Buttons */}
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => onViewModeChange('month')}
          >
            Month
          </button>
          <button
            className={`toggle-btn ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => onViewModeChange('week')}
          >
            Week
          </button>
          <button
            className={`toggle-btn ${viewMode === 'day' ? 'active' : ''}`}
            onClick={() => onViewModeChange('day')}
          >
            Day
          </button>
        </div>
      </div>

      {/* --- Schedule Grid --- */}
      <div className="schedule-container">
        <div className="schedule-header">
          <div className="time-column-header"></div>
          {courts.map((court) => (
            <div key={court.id || court._id} className="court-header">
              <div className="court-name">{court.name}</div>
              <div className="court-capacity">({court.capacity})</div>
            </div>
          ))}
        </div>

        <div className="schedule-grid">
          {timeSlots.map((time, slotIndex) => (
            <Fragment key={time}>
              <div className="time-slot">{time}</div>
              {courts.map((court) => {
                const courtId = court.id || court._id || '';

                const slotBooking = dayBookings.find((booking) => {
                  // For overnight bookings ending today, they start at slot 0
                  if (booking.isOvernightBooking && booking.endDate === currentDateStr) {
                    const e = getSlotIndex(booking.endTime);
                    return (
                      booking.courtId === courtId &&
                      slotIndex >= 0 &&
                      slotIndex < e
                    );
                  }
                  
                  // For regular bookings or bookings starting today
                  const s = getSlotIndex(booking.startTime);
                  let e = getSlotIndex(booking.endTime);
                  
                  if (e <= s) e += 48; // Overnight booking
                  
                  return (
                    booking.courtId === courtId &&
                    slotIndex >= s &&
                    slotIndex <= e
                  );
                });
                console.log(slotBooking ,"slotBooking");
                

                const isStart =
                  slotBooking &&
                  ((slotBooking.isOvernightBooking && slotBooking.endDate === currentDateStr && slotIndex === 0) ||
                   (getSlotIndex(slotBooking.startTime) === slotIndex));

                return (
                  <div
                    key={`${courtId}-${slotIndex}`}
                    className={`court-cell-half ${
                      slotBooking ? 'has-booking' : ''
                    } ${slotBooking?.color || ''}`}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(courtId, slotIndex)}
                  >
                    {isStart && slotBooking && (
                      <BookingCard
                        booking={slotBooking}
                        duration={getDisplayDuration(slotBooking)}
                        onDragStart={() => handleDragStart(slotBooking)}
                        onViewDetails={handleViewDetails}
                      />
                    )}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          booking={selectedBooking}
          courtName={courts.find(c => (c.id || c._id) === selectedBooking.courtId)?.name}
        />
      )}
    </div>
  );
};

export default React.memo(ScheduleView);
