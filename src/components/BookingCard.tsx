// BookingCard.tsx
import React from 'react';
import type { Booking } from '../types';
import { Camera, Eye } from 'lucide-react';

interface BookingCardProps {
  booking: Booking;
  duration: number;
  onDragStart: (booking: Booking) => void;
  onViewDetails?: (booking: Booking) => void;
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
  onViewDetails,
}) => {
  // 40px per half hour slot - card should fill the full space
  console.log(duration ,"from BookingCard");
  
  const heightPerHalfHour = duration === 120 ? 50 : 40;
  const cardHeight = duration * heightPerHalfHour;

  // ✅ safely handle missing price, default to 300
  const priceToShow = booking.price ?? 300;
  
  // Determine if card is too small for full content
  const isCompact = cardHeight < 60; // Less than 1.5 hours

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(booking);
    }
  };

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
          <Camera size={isCompact ? 14 : 16} />
        </div>
        {!isCompact && (
          <div className="booking-card-price">
            {priceToShow} SAR
          </div>
        )}
      </div>

      {/* MAIN AREA: name + time */}
      <div className="booking-card-main">
        <div className="booking-card-name" style={{ fontSize: isCompact ? '10px' : '12px' }}>
          {booking.playerName}
          {booking.isOvernightBooking && !isCompact && (
            <span style={{
              marginLeft: '6px',
              fontSize: '9px',
              background: 'rgba(0,0,0,0.15)',
              padding: '2px 4px',
              borderRadius: '3px',
              fontWeight: '600'
            }}>
              🌙
            </span>
          )}
        </div>
        <div className="booking-card-time" style={{ fontSize: isCompact ? '9px' : '10px' }}>
          {formatTimeTo12Hour(booking.startTime)} – {formatTimeTo12Hour(booking.endTime)}
          {booking.isOvernightBooking && booking.endDate && !isCompact && (
            <span style={{
              fontSize: '9px',
              marginLeft: '4px',
              opacity: 0.8
            }}>
              (→ {booking.endDate})
            </span>
          )}
        </div>
        {isCompact && (
          <div className="booking-card-price" style={{ fontSize: '8px', opacity: 0.9 }}>
            {priceToShow} SAR
          </div>
        )}
      </div>

      {/* VIEW DETAILS BUTTON */}
      {onViewDetails && (
        <button
          className="booking-card-view-btn"
          onClick={handleViewClick}
          title="View Details"
        >
          <Eye size={14} />
        </button>
      )}
    </div>
  );
};

export default BookingCard;
