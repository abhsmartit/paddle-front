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
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Booking, Court, ViewMode } from '../types';
import BookingCard from './BookingCard';
import BookingDetailsModal from './BookingDetailsModal';

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

  // Calculate grid template columns based on court count
  const getGridStyle = () => {
    if (courts.length === 0) return { gridTemplateColumns: '1fr' };
    const courtColumns = courts.map(() => 'minmax(150px, 1fr)').join(' ');
    return { gridTemplateColumns: `100px ${courtColumns}` };
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-card border-b border-border">
        {/* Previous / Next Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext}>
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Date Display + Calendar */}
        <div className="relative">
          <DropdownMenu open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 min-w-[180px]">
                <span className="font-medium">{format(selectedDate, 'EEEE, MMM dd')}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="center">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDateChange(subMonths(selectedDate, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="font-semibold">{format(selectedDate, 'MMMM yyyy')}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDateChange(addMonths(selectedDate, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day) => {
                    const inCurrentMonth = isSameMonth(day, monthStart);
                    const selected = isSameDay(day, selectedDate);

                    return (
                      <Button
                        key={day.toISOString()}
                        variant={selected ? "default" : "ghost"}
                        size="sm"
                        className={cn(
                          "h-8 w-8 p-0 font-normal",
                          !inCurrentMonth && "text-muted-foreground opacity-50",
                          selected && "bg-primary text-primary-foreground"
                        )}
                        onClick={() => handleDateSelect(day)}
                      >
                        {format(day, 'd')}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* View Mode Buttons */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === 'month' ? "default" : "ghost"}
            size="sm"
            className={cn("px-4", viewMode === 'month' && "bg-primary text-primary-foreground shadow-sm")}
            onClick={() => onViewModeChange('month')}
          >
            Month
          </Button>
          <Button
            variant={viewMode === 'week' ? "default" : "ghost"}
            size="sm"
            className={cn("px-4", viewMode === 'week' && "bg-primary text-primary-foreground shadow-sm")}
            onClick={() => onViewModeChange('week')}
          >
            Week
          </Button>
          <Button
            variant={viewMode === 'day' ? "default" : "ghost"}
            size="sm"
            className={cn("px-4", viewMode === 'day' && "bg-primary text-primary-foreground shadow-sm")}
            onClick={() => onViewModeChange('day')}
          >
            Day
          </Button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="flex-1 overflow-hidden p-4">
        <Card className="h-full overflow-hidden border shadow-sm">
          <ScrollArea className="h-full">
            <div style={{ minWidth: courts.length > 3 ? `${100 + courts.length * 150}px` : 'auto' }}>
              {/* Header */}
              <div className="sticky top-0 z-20 bg-card border-b-2 border-border">
                <div className="grid" style={getGridStyle()}>
                  <div className="p-3 bg-muted/50 border-r border-border flex items-center justify-center">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Time</span>
                  </div>
                  {courts.map((court) => (
                    <div key={court.id || court._id} className="p-3 bg-muted/30 text-center border-r border-border last:border-r-0">
                      <div className="font-semibold text-sm text-foreground">{court.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">({court.capacity})</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time slots and courts grid */}
              <div>
                {timeSlots.map((time, slotIndex) => (
                  <div key={time} className="grid" style={getGridStyle()}>
                    <div className="h-12 px-2 bg-card text-xs text-muted-foreground flex items-center justify-center border-r border-b border-border font-medium">
                      {time}
                    </div>
                    {courts.map((court) => {
                      const courtId = court.id || court._id || '';

                      const slotBooking = dayBookings.find((booking) => {
                        if (booking.isOvernightBooking && booking.endDate === currentDateStr) {
                          const e = getSlotIndex(booking.endTime);
                          return (
                            booking.courtId === courtId &&
                            slotIndex >= 0 &&
                            slotIndex < e
                          );
                        }
                        
                        const s = getSlotIndex(booking.startTime);
                        let e = getSlotIndex(booking.endTime);
                        
                        if (e <= s) e += 48;
                        
                        // Use < e instead of <= e because end time slot is exclusive
                        // e.g., 13:00-14:30 = slots 26,27,28 (not 29)
                        return (
                          booking.courtId === courtId &&
                          slotIndex >= s &&
                          slotIndex <= e
                        );
                      });

                      const isStart =
                        slotBooking &&
                        ((slotBooking.isOvernightBooking && slotBooking.endDate === currentDateStr && slotIndex === 0) ||
                         (getSlotIndex(slotBooking.startTime) === slotIndex));

                      return (
                        <div
                          key={`${courtId}-${slotIndex}`}
                          className={cn(
                            "h-12 bg-card border-r border-b border-border relative overflow-visible",
                            "last:border-r-0 hover:bg-accent/10 transition-colors",
                            slotBooking && "bg-transparent hover:bg-transparent"
                          )}
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
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </Card>
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
