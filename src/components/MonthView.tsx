import React from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  isSameMonth,
} from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { enUS, ar } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Booking, ViewMode } from '../types';

interface MonthViewProps {
  bookings: Booking[];
  selectedDate: Date;
  viewMode: ViewMode;
  onDateChange: (date: Date) => void;
  onViewModeChange: (mode: ViewMode) => void;
}

const MonthView = ({ bookings, selectedDate, viewMode, onDateChange, onViewModeChange }: MonthViewProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'ar' ? ar : enUS;

  const handlePrevious = () => {
    const newDate = addMonths(selectedDate, -1);
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = addMonths(selectedDate, 1);
    onDateChange(newDate);
  };

  // ---------- helpers ----------

  // Match Day/Week: 24h "HH:mm" -> "h:mm AM/PM"
  const formatTime = (time: string): string => {
    const [hoursRaw, minutesRaw] = time.split(':').map(Number);
    const hours = isNaN(hoursRaw) ? 0 : hoursRaw;
    const minutes = isNaN(minutesRaw) ? 0 : minutesRaw;

    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour =
      hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // ---------- build calendar range ----------

  // Get all days to show in calendar (including padding days from prev/next month)
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let currentDay = calendarStart;
  while (currentDay <= calendarEnd) {
    days.push(currentDay);
    currentDay = addDays(currentDay, 1);
  }

  const getBookingsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    // Include bookings that:
    // 1. Start on this date
    // 2. Are overnight bookings that end on this date
    return bookings.filter((b) => {
      const startsOnDate = b.date === dateStr;
      const endsOnDate = b.isOvernightBooking && b.endDate === dateStr;
      return startsOnDate || endsOnDate;
    });
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(calendarStart, i);
    return format(day, 'EEE', { locale });
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-card border-b border-border">
        {/* Previous / Next Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">{t('previous')}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext}>
            <span className="hidden sm:inline">{t('next')}</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Date Display */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 min-w-[180px]">
              <span className="font-medium">{format(selectedDate, 'MMMM yyyy', { locale })}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="p-2">
            <div className="text-sm text-muted-foreground">Calendar picker coming soon</div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Mode Buttons */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === 'month' ? "default" : "ghost"}
            size="sm"
            className={cn("px-4", viewMode === 'month' && "bg-primary text-primary-foreground shadow-sm")}
            onClick={() => onViewModeChange('month')}
          >
            {t('month')}
          </Button>
          <Button
            variant={viewMode === 'week' ? "default" : "ghost"}
            size="sm"
            className={cn("px-4", viewMode === 'week' && "bg-primary text-primary-foreground shadow-sm")}
            onClick={() => onViewModeChange('week')}
          >
            {t('week')}
          </Button>
          <Button
            variant={viewMode === 'day' ? "default" : "ghost"}
            size="sm"
            className={cn("px-4", viewMode === 'day' && "bg-primary text-primary-foreground shadow-sm")}
            onClick={() => onViewModeChange('day')}
          >
            {t('day')}
          </Button>
        </div>
      </div>

      {/* Month Grid */}
      <div className="flex-1 overflow-hidden p-4">
        <Card className="h-full overflow-hidden border shadow-sm">
          <ScrollArea className="h-full">
            <div className="p-4">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day, index) => (
                  <div key={index} className="p-2 text-center text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const dayBookings = getBookingsForDay(day);
                  const isCurrentMonth = isSameMonth(day, selectedDate);
                  const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                  const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

                  return (
                    <div
                      key={index}
                      className={cn(
                        "min-h-[100px] p-2 border border-border rounded-md bg-card",
                        !isCurrentMonth && "opacity-50 bg-muted/30",
                        isToday && "ring-2 ring-primary",
                        isSelected && "bg-primary/10"
                      )}
                    >
                      <div className={cn(
                        "text-sm font-medium mb-1",
                        isToday && "text-primary font-bold"
                      )}>
                        {format(day, 'd')}
                      </div>
                      <div className="flex flex-col gap-1">
                        {dayBookings.slice(0, 3).map((booking) => (
                          <div
                            key={booking.id}
                            className={cn(
                              "px-2 py-1 rounded text-xs text-white truncate cursor-pointer hover:opacity-90",
                              booking.color === 'blue' ? "bg-blue-600" : "bg-green-600"
                            )}
                            title={`${booking.playerName} - ${formatTime(booking.startTime)} to ${formatTime(booking.endTime)}`}
                          >
                            {booking.playerName}
                          </div>
                        ))}
                        {dayBookings.length > 3 && (
                          <div className="text-xs text-muted-foreground font-medium">
                            +{dayBookings.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
};

export default React.memo(MonthView);
