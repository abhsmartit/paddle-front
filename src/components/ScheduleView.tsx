import React, { useState } from 'react';
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

// Utility function for conditional classNames
const cn = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

interface ScheduleViewProps {
  courts: Court[];
  bookings: Booking[];
  selectedDate: Date;
  viewMode: ViewMode;
  onDateChange: (date: Date) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onBookingDragDrop?: (bookingId: string, newCourtId: string, newStartTime: string, newEndTime: string, date: string) => Promise<void>;
  onEventClick?: (event: any) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  color: 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'orange' | 'pink' | 'teal';
  metadata?: {
    courtId: string;
    status?: string;
    bookingType?: string;
    phone?: string;
    price?: number;
  };
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

  const handleDragStart = (booking: Booking | CalendarEvent) => {
    if ('playerName' in booking) {
      // It's a Booking
      setDraggedBooking(booking);
    } else {
      // It's a CalendarEvent - convert to booking for compatibility
      const convertedBooking: Booking = {
        id: booking.id,
        courtId: booking.metadata?.courtId || '',
        playerName: booking.title,
        phone: booking.metadata?.phone || '',
        startTime: format(new Date(booking.startDate), 'HH:mm'),
        endTime: format(new Date(booking.endDate), 'HH:mm'),
        date: format(new Date(booking.startDate), 'yyyy-MM-dd'),
        color: booking.color as 'green' | 'blue',
        status: booking.metadata?.status || 'pending',
        price: booking.metadata?.price || 0,
        paymentStatus: (booking.metadata?.status as 'PENDING' | 'PARTIAL' | 'PAID') || 'PENDING',
        bookingType: 'SINGLE',
        bookingSource: 'ONLINE',
        isOvernightBooking: false
      };
      setDraggedBooking(convertedBooking);
    }
  };

  const handleSlotClick = (courtId: string, slotIndex: number) => {
    // Handle slot click - could open booking modal
    console.log('Slot clicked:', courtId, slotIndex);
  };

  const handleDropEvent = (courtId: string, slotIndex: number) => {
    handleDrop(courtId, slotIndex);
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

  // Convert bookings to events format for new grid
  const dayEvents: CalendarEvent[] = dayBookings.map(booking => ({
    id: booking.id,
    title: booking.playerName,
    startDate: `${booking.date}T${booking.startTime}:00`,
    endDate: `${booking.endDate || booking.date}T${booking.endTime}:00`,
    color: (booking.color === 'green' || booking.color === 'blue') ? booking.color : 'green',
    metadata: {
      courtId: booking.courtId,
      status: booking.status,
      bookingType: booking.bookingType,
      phone: booking.phone,
      price: booking.price
    }
  }));

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
        {/* Court Headers */}
        <div className="grid" style={{gridTemplateColumns: `80px repeat(${courts.length}, 1fr)`}}>
          <div className="p-2 text-xs text-gray-600 dark:text-gray-400 text-right border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"></div>
          {courts.map((court) => (
            <div key={court.id || court._id} className="p-2 text-center border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 last:border-r-0">
              <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{court.name}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">({court.capacity})</div>
            </div>
          ))}
        </div>

        {/* Time Slots Grid */}
        <div className="flex-1 overflow-y-auto">
          {timeSlots.map((time, slotIndex) => (
            <div key={time} className="grid gap-0 border-b border-gray-100 dark:border-gray-800" style={{gridTemplateColumns: `80px repeat(${courts.length}, 1fr)`}}>
              {/* Time label */}
              <div className="p-2 text-xs text-gray-600 dark:text-gray-400 text-right border-r border-gray-200 dark:border-gray-700 flex items-center justify-end min-h-[32px] bg-gray-50 dark:bg-gray-800">
                {time}
              </div>
              
              {/* Court cells for this time slot */}
              {courts.map((court, courtIndex) => {
                const courtId = court.id || court._id || '';

                const slotEvent = dayEvents.find((event) => {
                  const eventStartTime = format(new Date(event.startDate), 'HH:mm');
                  const eventEndTime = format(new Date(event.endDate), 'HH:mm');
                  const s = getSlotIndex(eventStartTime);
                  let e = getSlotIndex(eventEndTime);
                  
                  if (e <= s) e += 48; // Handle overnight bookings
                  
                  return (
                    event.metadata?.courtId === courtId &&
                    slotIndex >= s &&
                    slotIndex < e
                  );
                });

                const isEventStart = slotEvent && getSlotIndex(format(new Date(slotEvent.startDate), 'HH:mm')) === slotIndex;

                return (
                  <div
                    key={`${courtId}-${slotIndex}`}
                    className={cn(
                      'relative border-r border-gray-200 dark:border-gray-700 min-h-[32px] cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors',
                      courtIndex === courts.length - 1 && 'border-r-0',
                      slotEvent && slotEvent.color === 'green' && 'bg-green-100 dark:bg-green-900/20',
                      slotEvent && slotEvent.color === 'blue' && 'bg-blue-100 dark:bg-blue-900/20',
                      slotEvent && slotEvent.color === 'red' && 'bg-red-100 dark:bg-red-900/20',
                      slotEvent && slotEvent.color === 'yellow' && 'bg-yellow-100 dark:bg-yellow-900/20',
                      slotEvent && slotEvent.color === 'purple' && 'bg-purple-100 dark:bg-purple-900/20',
                      slotEvent && slotEvent.color === 'orange' && 'bg-orange-100 dark:bg-orange-900/20',
                      slotEvent && slotEvent.color === 'pink' && 'bg-pink-100 dark:bg-pink-900/20',
                      slotEvent && slotEvent.color === 'teal' && 'bg-teal-100 dark:bg-teal-900/20'
                    )}
                    onDragOver={handleDragOver}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDropEvent(courtId, slotIndex);
                    }}
                    onClick={() => handleSlotClick(courtId, slotIndex)}
                  >
                    {isEventStart && slotEvent && (
                      <div
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = 'move';
                          handleDragStart(slotEvent);
                        }}
                        className={cn(
                          'absolute inset-x-0 rounded px-2 py-1 text-xs cursor-move shadow-sm border-l-2 overflow-hidden',
                          slotEvent.color === 'green' && 'bg-green-500 text-white border-green-600',
                          slotEvent.color === 'blue' && 'bg-blue-500 text-white border-blue-600',
                          slotEvent.color === 'red' && 'bg-red-500 text-white border-red-600',
                          slotEvent.color === 'yellow' && 'bg-yellow-500 text-black border-yellow-600',
                          slotEvent.color === 'purple' && 'bg-purple-500 text-white border-purple-600',
                          slotEvent.color === 'orange' && 'bg-orange-500 text-white border-orange-600',
                          slotEvent.color === 'pink' && 'bg-pink-500 text-white border-pink-600',
                          slotEvent.color === 'teal' && 'bg-teal-500 text-white border-teal-600'
                        )}
                        style={{ 
                          height: `${getDuration(
                            format(new Date(slotEvent.startDate), 'HH:mm'),
                            format(new Date(slotEvent.endDate), 'HH:mm')
                          ) * 42}px`,
                          zIndex: 10,
                          marginTop: '2px'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Convert event back to booking for details modal
                          const booking = dayBookings.find(b => b.id === slotEvent.id);
                          if (booking) {
                            handleViewDetails(booking);
                          }
                        }}
                      >
                        <div className="font-medium truncate text-xs leading-tight">{slotEvent.title}</div>
                        <div className="text-xs opacity-75 truncate leading-tight">
                          {format(new Date(slotEvent.startDate), 'HH:mm')} - {format(new Date(slotEvent.endDate), 'HH:mm')}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
