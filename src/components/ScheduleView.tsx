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

  // --- Grid Logic (Same as before) ---
  const currentDateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayBookings = allBookings.filter(booking => booking.date === currentDateStr);

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  });

  const getSlotIndex = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 2 + (minutes === 30 ? 1 : 0);
  };

  const getTimeFromSlot = (slotIndex: number): string => {
    const hour = Math.floor(slotIndex / 2) % 24;
    const minutes = slotIndex % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  };

  const getDuration = (startTime: string, endTime: string): number => {
    const start = getSlotIndex(startTime);
    let end = getSlotIndex(endTime);
    if (end <= start) end += 48;
    return end - start;
  };

  const handleDragStart = (booking: Booking) => {
    setDraggedBooking(booking);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (courtId: string, slotIndex: number) => {
    if (!draggedBooking) return;
    const duration = getDuration(draggedBooking.startTime, draggedBooking.endTime);
    const newStartTime = getTimeFromSlot(slotIndex);
    const newEndTime = getTimeFromSlot(slotIndex + duration);

    const updatedBookings = allBookings.map((booking) =>
      booking.id === draggedBooking.id
        ? { ...booking, courtId, startTime: newStartTime, endTime: newEndTime, date: currentDateStr }
        : booking
    );
    setAllBookings(updatedBookings);
    setDraggedBooking(null);
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

        {/* Date Display */}
        <div className="date-display-wrapper">
          <span>{format(selectedDate, 'EEEE, MMM dd')}</span>
          <ChevronDown size={16} />
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
            <div key={court.id} className="court-header">
              <div className="court-name">{court.name}</div>
              <div className="court-capacity">({court.capacity})</div>
            </div>
          ))}
        </div>

        <div className="schedule-grid">
          {timeSlots.map((time, hourIndex) => (
            <>
              <div key={`time-${time}`} className="time-slot">{time}</div>
              {courts.map((court) => {
                const firstHalfSlot = hourIndex * 2;
                const secondHalfSlot = hourIndex * 2 + 1;

                const firstHalfBooking = dayBookings.find((booking) => {
                  const s = getSlotIndex(booking.startTime);
                  let e = getSlotIndex(booking.endTime);
                  if (e <= s) e += 48;
                  return booking.courtId === court.id && firstHalfSlot >= s && firstHalfSlot < Math.min(e, 48);
                });

                const secondHalfBooking = dayBookings.find((booking) => {
                  const s = getSlotIndex(booking.startTime);
                  let e = getSlotIndex(booking.endTime);
                  if (e <= s) e += 48;
                  return booking.courtId === court.id && secondHalfSlot >= s && secondHalfSlot < Math.min(e, 48);
                });

                const isStartFirst = firstHalfBooking && getSlotIndex(firstHalfBooking.startTime) === firstHalfSlot;
                const isStartSecond = secondHalfBooking && getSlotIndex(secondHalfBooking.startTime) === secondHalfSlot && firstHalfBooking?.id !== secondHalfBooking?.id;

                const getDisplayDuration = (booking: Booking) => {
                  const s = getSlotIndex(booking.startTime);
                  let e = getSlotIndex(booking.endTime);
                  if (e <= s) return 48 - s;
                  return e - s;
                };

                return (
                  <div key={`${court.id}-${time}`} className="court-cell-container" onDragOver={handleDragOver}>
                    <div 
                      className={`court-cell-half first-half ${firstHalfBooking ? 'has-booking' : ''} ${firstHalfBooking?.color || ''}`}
                      onDrop={() => handleDrop(court.id, firstHalfSlot)}
                    >
                      {isStartFirst && (
                        <BookingCard
                          booking={firstHalfBooking}
                          duration={getDisplayDuration(firstHalfBooking)}
                          onDragStart={() => handleDragStart(firstHalfBooking)}
                        />
                      )}
                    </div>
                    <div 
                      className={`court-cell-half second-half ${secondHalfBooking ? 'has-booking' : ''} ${secondHalfBooking?.color || ''}`}
                      onDrop={() => handleDrop(court.id, secondHalfSlot)}
                    >
                      {isStartSecond && (
                        <BookingCard
                          booking={secondHalfBooking}
                          duration={getDisplayDuration(secondHalfBooking)}
                          onDragStart={() => handleDragStart(secondHalfBooking)}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;