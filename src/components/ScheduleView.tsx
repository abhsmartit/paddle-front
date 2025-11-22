import { useState } from 'react';
import { format } from 'date-fns';
import type { Booking, Court } from '../types';
import BookingCard from './BookingCard';
import './ScheduleView.css';

interface ScheduleViewProps {
  courts: Court[];
  bookings: Booking[];
  selectedDate: Date;
}

const ScheduleView = ({ courts, bookings, selectedDate }: ScheduleViewProps) => {
  const [allBookings, setAllBookings] = useState<Booking[]>(bookings);
  const [draggedBooking, setDraggedBooking] = useState<Booking | null>(null);

  // Date string for current day
  const currentDateStr = format(selectedDate, 'yyyy-MM-dd');

  // Only bookings for this day
  const dayBookings = allBookings.filter((booking) => booking.date === currentDateStr);

  // 24 time labels (hourly) for the left column
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  });

  // Convert "HH:mm" → half-hour slot index (0–47)
  const getSlotIndex = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 2 + (minutes === 30 ? 1 : 0);
  };

  // Convert slot index → "HH:mm"
  const getTimeFromSlot = (slotIndex: number): string => {
    const hour = Math.floor(slotIndex / 2) % 24;
    const minutes = slotIndex % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  };

  // Duration in half-hour slots (supports past-midnight)
  const getDuration = (startTime: string, endTime: string): number => {
    const start = getSlotIndex(startTime);
    let end = getSlotIndex(endTime);

    if (end <= start) {
      // crosses midnight
      end += 48;
    }

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
        ? {
            ...booking, // ✅ fixed spread here
            courtId,
            startTime: newStartTime,
            endTime: newEndTime,
            date: currentDateStr,
          }
        : booking
    );

    setAllBookings(updatedBookings);
    setDraggedBooking(null);
  };

  return (
    <div className="schedule-view">
      <div className="schedule-container">
        {/* Header row with court names */}
        <div className="schedule-header">
          <div className="time-column-header"></div>
          {courts.map((court) => (
            <div key={court.id} className="court-header">
              <div className="court-name">{court.name}</div>
              <div className="court-capacity">({court.capacity})</div>
            </div>
          ))}
        </div>

        {/* Time slots + court columns */}
        <div className="schedule-grid">
          {timeSlots.map((time, hourIndex) => (
            <div key={`row-${time}`} className="schedule-row">
              <div className="time-slot">{time}</div>

              {courts.map((court) => {
                const firstHalfSlot = hourIndex * 2;
                const secondHalfSlot = hourIndex * 2 + 1;

                const firstHalfBooking = dayBookings.find((booking) => {
                  const startIndex = getSlotIndex(booking.startTime);
                  let endIndex = getSlotIndex(booking.endTime);
                  if (endIndex <= startIndex) endIndex += 48;

                  const isOccupied =
                    firstHalfSlot >= startIndex &&
                    firstHalfSlot < Math.min(endIndex, 48);

                  return booking.courtId === court.id && isOccupied;
                });

                const secondHalfBooking = dayBookings.find((booking) => {
                  const startIndex = getSlotIndex(booking.startTime);
                  let endIndex = getSlotIndex(booking.endTime);
                  if (endIndex <= startIndex) endIndex += 48;

                  const isOccupied =
                    secondHalfSlot >= startIndex &&
                    secondHalfSlot < Math.min(endIndex, 48);

                  return booking.courtId === court.id && isOccupied;
                });

                const isBookingStartFirstHalf =
                  firstHalfBooking &&
                  getSlotIndex(firstHalfBooking.startTime) === firstHalfSlot;

                const isBookingStartSecondHalf =
                  secondHalfBooking &&
                  getSlotIndex(secondHalfBooking.startTime) === secondHalfSlot &&
                  firstHalfBooking?.id !== secondHalfBooking?.id;

                const getDisplayDuration = (booking: Booking): number => {
                  const startIndex = getSlotIndex(booking.startTime);
                  const endIndex = getSlotIndex(booking.endTime);
                  if (endIndex <= startIndex) {
                    return 48 - startIndex;
                  }
                  return endIndex - startIndex;
                };

                const hasFirstHalf = !!firstHalfBooking;
                const hasSecondHalf = !!secondHalfBooking;

                return (
                  <div
                    key={`${court.id}-${time}`}
                    className="court-cell-container"
                    onDragOver={handleDragOver}
                  >
                    <div
                      className={`court-cell-half first-half ${
                        hasFirstHalf ? 'has-booking' : ''
                      } ${firstHalfBooking?.color || ''}`}
                      onDrop={() => handleDrop(court.id, firstHalfSlot)}
                    >
                      {isBookingStartFirstHalf && firstHalfBooking && (
                        <BookingCard
                          booking={firstHalfBooking}
                          duration={getDisplayDuration(firstHalfBooking)}
                          onDragStart={() => handleDragStart(firstHalfBooking)}
                        />
                      )}
                    </div>
                    <div
                      className={`court-cell-half second-half ${
                        hasSecondHalf ? 'has-booking' : ''
                      } ${secondHalfBooking?.color || ''}`}
                      onDrop={() => handleDrop(court.id, secondHalfSlot)}
                    >
                      {isBookingStartSecondHalf && secondHalfBooking && (
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;
