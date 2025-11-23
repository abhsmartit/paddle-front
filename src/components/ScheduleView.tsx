import { useState } from 'react';
import { format } from 'date-fns';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Booking, Court, ViewMode } from '../types';
import BookingCard from './BookingCard';
import './ScheduleView.css';

interface ScheduleViewProps {
  courts: Court[];
  bookings: Booking[];
  selectedDate: Date;
  viewMode: ViewMode;
  onDateChange: (date: Date) => void;
  onViewModeChange: (mode: ViewMode) => void;
}

const ScheduleView = ({
  courts,
  bookings,
  selectedDate,
  viewMode,
  onDateChange,
  onViewModeChange,
}: ScheduleViewProps) => {
  const [allBookings, setAllBookings] = useState<Booking[]>(bookings);
  const [draggedBooking, setDraggedBooking] = useState<Booking | null>(null);

  // -------- Date navigation --------
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

  // -------- Time slot helpers (30-minute slots) --------
  // 48 slots: 00:00, 00:30, 01:00, 01:30, ... 23:30
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);        // 0–23
    const minutes = i % 2 === 0 ? '00' : '30';
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${minutes} ${period}`;
  });

  // "13:30" -> slot index 27
  const getSlotIndex = (time: string): number => {
    const [hStr, mStr] = time.split(':');
    const hour = Number(hStr);
    const minutes = Number(mStr || 0);
    return hour * 2 + (minutes >= 30 ? 1 : 0); // each slot is 30 min
  };

  // slot index -> "HH:mm" 24-hour format
  const getTimeFromSlot = (slotIndex: number): string => {
    const idx = ((slotIndex % 48) + 48) % 48; // keep in 0..47
    const hour = Math.floor(idx / 2);
    const minutes = idx % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  };

  // number of 30-minute slots between start and end (supports cross-midnight)
  const getDurationSlots = (startTime: string, endTime: string): number => {
    const start = getSlotIndex(startTime);
    let end = getSlotIndex(endTime);
    if (end <= start) end += 48;
    return end - start;
  };

  const getDisplayDuration = (booking: Booking): number => {
    const s = getSlotIndex(booking.startTime);
    let e = getSlotIndex(booking.endTime);
    if (e <= s) e += 48;
    return Math.min(e, 48) - s; // don’t draw past midnight
  };

  // -------- Drag & drop --------
  const handleDragStart = (booking: Booking) => {
    setDraggedBooking(booking);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (courtId: string, slotIndex: number) => {
    if (!draggedBooking) return;

    const duration = getDurationSlots(
      draggedBooking.startTime,
      draggedBooking.endTime
    );

    const newStartTime = getTimeFromSlot(slotIndex);
    const newEndTime = getTimeFromSlot(slotIndex + duration);
    const currentDateStr = format(selectedDate, 'yyyy-MM-dd');

    const updated = allBookings.map((b) =>
      b.id === draggedBooking.id
        ? {
            ...b,
            courtId,
            startTime: newStartTime,
            endTime: newEndTime,
            date: currentDateStr,
          }
        : b
    );

    setAllBookings(updated);
    setDraggedBooking(null);
  };

  // -------- Filter bookings for current day --------
  const currentDateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayBookings = allBookings.filter((b) => b.date === currentDateStr);

  return (
    <div className="schedule-view">
      {/* -------- Controls header -------- */}
      <div className="schedule-controls-header">
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

        <div className="date-display-container">
          <button type="button" className="date-display-wrapper">
            <span>{format(selectedDate, 'EEEE, MMM dd')}</span>
            <ChevronDown size={16} />
          </button>
        </div>

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

      {/* -------- Schedule grid -------- */}
      <div className="schedule-container">
        {/* sticky header with courts */}
        <div className="schedule-header">
          <div className="time-column-header" />
          {courts.map((court) => (
            <div key={court.id} className="court-header">
              <div className="court-name">{court.name}</div>
              <div className="court-capacity">({court.capacity})</div>
            </div>
          ))}
        </div>

        <div className="schedule-grid">
          {timeSlots.map((label, slotIndex) => (
            <div key={slotIndex} className="schedule-row">
              {/* left time label */}
              <div className="time-slot">{label}</div>

              {/* one cell per court */}
              {courts.map((court) => {
                const bookingStartingHere = dayBookings.find(
                  (booking) =>
                    booking.courtId === court.id &&
                    getSlotIndex(booking.startTime) === slotIndex
                );

                return (
                  <div
                    key={`${court.id}-${slotIndex}`}
                    className="court-cell"
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(court.id, slotIndex)}
                  >
                    {bookingStartingHere && (
                      <BookingCard
                        booking={bookingStartingHere}
                        duration={getDisplayDuration(bookingStartingHere)}
                        onDragStart={handleDragStart}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;
