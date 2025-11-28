import React from 'react';
import type { Booking } from '../types';
import { Camera, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  // 48px per half hour slot (12*4 = 48px) - card should fill the full space
  const heightPerHalfHour = 48;
  const cardHeight = Math.max(duration * heightPerHalfHour - 4, 44); // Minimum height with proper spacing

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
      className={cn(
        "group absolute inset-x-1 top-1 flex items-stretch rounded-md overflow-hidden",
        "shadow-md cursor-grab transition-all hover:shadow-lg active:cursor-grabbing active:scale-[0.98]",
        "z-10 min-h-[36px]",
        booking.color === 'blue' ? "bg-blue-600" : "bg-green-600",
        "text-white"
      )}
      style={{ height: `${cardHeight}px` }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(booking);
      }}
    >
      {/* LEFT STRIP: icon top, price bottom */}
      <div className={cn(
        "flex flex-col items-center justify-center px-2 bg-black/10",
        isCompact ? "w-8 gap-0" : "w-10 gap-1"
      )}>
        <div className="flex items-center justify-center">
          <Camera size={isCompact ? 12 : 14} className="text-white" />
        </div>
        {!isCompact && (
          <div className="text-xs font-semibold text-center leading-tight">
            {priceToShow}
          </div>
        )}
      </div>

      {/* MAIN AREA: name + time */}
      <div className="flex-1 p-2 min-w-0 flex flex-col justify-center gap-0.5">
        <div className={cn(
          "font-bold text-white truncate leading-tight",
          isCompact ? "text-xs" : "text-sm"
        )}>
          {booking.playerName}
          {booking.isOvernightBooking && !isCompact && (
            <span className="ml-1 text-xs bg-black/20 px-1 rounded text-white font-semibold">
              🌙
            </span>
          )}
        </div>
        <div className={cn(
          "text-white/90 truncate leading-tight",
          isCompact ? "text-xs" : "text-xs"
        )}>
          {formatTimeTo12Hour(booking.startTime)}–{formatTimeTo12Hour(booking.endTime)}
          {booking.isOvernightBooking && booking.endDate && !isCompact && (
            <span className="text-xs ml-1 opacity-80">
              (→ {booking.endDate})
            </span>
          )}
        </div>
        {isCompact && (
          <div className="text-xs font-medium text-white/90 leading-tight">
            {priceToShow} SAR
          </div>
        )}
      </div>

      {/* VIEW DETAILS BUTTON */}
      {onViewDetails && !isCompact && (
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "absolute top-1 right-1 h-6 w-6 p-0 rounded-full",
            "bg-white/20 hover:bg-white/30 text-white opacity-0 group-hover:opacity-100",
            "transition-opacity"
          )}
          onClick={handleViewClick}
          title="View Details"
        >
          <Eye size={12} />
        </Button>
      )}
    </div>
  );
};

export default BookingCard;
