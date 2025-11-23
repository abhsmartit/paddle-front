// BookingCard.tsx
import React from 'react';
import type { Booking } from '../types';
import { Camera } from 'lucide-react';

interface BookingCardProps {
  booking: Booking;
  duration: number;
  onDragStart: (booking: Booking) => void;
}

// helper to show 01:00 PM style from "13:00"
const formatTimeTo12Hour = (time: string) => {
  const [hStr, mStr] = time.split(':');
  const h = Number(hStr);
  const m = Number(mStr || '0');
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  const minute = m.toString().padStart(2, '0');
  return `${displayHour}:${minute} ${period}`;
};

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  duration,
  onDragStart,
}) => {
  // 80px per hour => 40px per half hour (matches your grid)
  const heightPerHalfHour = 40;
  const cardHeight = duration * heightPerHalfHour;

  // ✅ safely handle missing price, default to 300
  const priceToShow = booking.price ?? 300;

  return (
    <div
      className={`booking-card ${booking.color || ''}`}
      style={{ height: `${cardHeight}px` }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(booking);
      }}
    >
      {/* LEFT STRIP: icon top, price bottom */}
      <div className="booking-card-left">
        <div className="booking-card-icon">
          <Camera size={16} />
        </div>
        <div className="booking-card-price">
          {priceToShow} SAR
        </div>
      </div>

      {/* MAIN AREA: name + time (NO DATE) */}
      <div className="booking-card-main">
        <div className="booking-card-name">{booking.playerName}</div>
        <div className="booking-card-time">
          {formatTimeTo12Hour(booking.startTime)} –{' '}
          {formatTimeTo12Hour(booking.endTime)}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
