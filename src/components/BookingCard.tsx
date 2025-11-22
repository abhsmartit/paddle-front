import type { Booking } from '../types';
import './BookingCard.css';

interface BookingCardProps {
  booking: Booking;
  duration: number;        // in half-hour slots
  onDragStart: () => void;
}

const BookingCard = ({ booking, duration, onDragStart }: BookingCardProps) => {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // small day number for the calendar icon
  let dayLabel = '';
  try {
    const d = new Date(booking.date);
    if (!isNaN(d.getTime())) dayLabel = d.getDate().toString();
  } catch {
    dayLabel = '';
  }

  return (
    <div
      className={`booking-card ${booking.color}`}
      style={{
        // vertical height = duration * 40px (half of the 80px hour)
        height: `${duration * 40 - 4}px`,
      }}
      draggable
      onDragStart={onDragStart}
    >
      <div className="booking-icon">
        <span className="booking-icon-day">{dayLabel}</span>
      </div>

      <div className="booking-content">
        <div className="booking-name">{booking.playerName}</div>
        <div className="booking-time">
          {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
        </div>
        {booking.status && (
          <div className="booking-status">{booking.status}</div>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
