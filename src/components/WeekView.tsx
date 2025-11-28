import React from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
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
import type { Booking, Court, ViewMode } from '../types';

interface WeekViewProps {
  courts: Court[];
  bookings: Booking[];
  selectedDate: Date;
  viewMode: ViewMode;
  onDateChange: (date: Date) => void;
  onViewModeChange: (mode: ViewMode) => void;
}

/**
 * A "piece" of a booking that belongs to a single calendar day.
 * We only use this to decide which day the card appears on.
 * The LABEL still uses the original start/end times so
 * Week/Day/Month always show matching times.
 */
type BookingSegment = {
  booking: Booking;
  dayStr: string; // 'yyyy-MM-dd'
};

// helper: HH:mm -> half-hour slot index (for ordering only)
const getSlotIndex = (time: string): number => {
  if (!time || typeof time !== 'string') return 0;
  const [hStr, mStr = '0'] = time.split(':');
  const hours = parseInt(hStr, 10);
  const minutes = parseInt(mStr, 10);
  if (Number.isNaN(hours)) return 0;
  return hours * 2 + (minutes === 30 ? 1 : 0);
};

// 24h -> 12h with AM/PM (same style as Day view)
const formatTime = (time: string): string => {
  const [hoursRaw, minutesRaw] = time.split(':').map(Number);
  const hours = isNaN(hoursRaw) ? 0 : hoursRaw;
  const minutes = isNaN(minutesRaw) ? 0 : minutesRaw;

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour =
    hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Decide on which days an overnight booking should appear.
 * - Normal booking → one segment on its own date
 * - Overnight booking (isOvernightBooking=true) → one segment on start date AND one on end date
 *
 * IMPORTANT: we DO NOT change the times; labels still use booking.startTime / endTime.
 */
const createSegments = (booking: Booking): BookingSegment[] => {
  const baseDayStr = booking.date; // Already in YYYY-MM-DD format

  // Check if it's an overnight booking
  if (booking.isOvernightBooking && booking.endDate) {
    // Show on both start day and end day
    return [
      { booking, dayStr: baseDayStr },
      { booking, dayStr: booking.endDate },
    ];
  }

  // Same-day booking: show only on start date
  return [{ booking, dayStr: baseDayStr }];
};

const WeekView = ({ courts, bookings, selectedDate, viewMode, onDateChange, onViewModeChange }: WeekViewProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'ar' ? ar : enUS;

  const handlePrevious = () => {
    const newDate = addDays(selectedDate, -7);
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = addDays(selectedDate, 7);
    onDateChange(newDate);
  };

  // Week days (Sun..Sat)
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(weekStart, i),
  );

  // Create all segments once from raw bookings
  const allSegments: BookingSegment[] = bookings.flatMap(createSegments);

  // All segments for a given (day, court) cell
  const getSegmentsForDayAndCourt = (
    date: Date,
    courtId: string,
  ): BookingSegment[] => {
    const dateStr = format(date, 'yyyy-MM-dd');

    return allSegments
      .filter(
        (seg) =>
          seg.dayStr === dateStr &&
          seg.booking.courtId === courtId,
      )
      .sort(
        (a, b) =>
          getSlotIndex(a.booking.startTime) -
          getSlotIndex(b.booking.startTime),
      );
  };

  // Calculate grid style for week view
  const getGridStyle = () => {
    return { gridTemplateColumns: `120px repeat(7, minmax(140px, 1fr))` };
  };

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
              <span className="font-medium">{format(selectedDate, 'EEEE MMM dd', { locale })}</span>
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

      {/* Week Grid */}
      <div className="flex-1 overflow-hidden p-4">
        <Card className="h-full overflow-hidden border shadow-sm">
          <ScrollArea className="h-full">
            <div style={{ minWidth: '1100px' }}>
              {/* Header with days */}
              <div className="sticky top-0 z-20 bg-card border-b-2 border-border">
                <div className="grid" style={getGridStyle()}>
                  <div className="p-3 bg-muted/50 border-r border-border flex items-center justify-center">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Courts</span>
                  </div>
                  {weekDays.map((day, index) => {
                    const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                    const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                    return (
                      <div
                        key={index}
                        className={cn(
                          "p-3 text-center border-r border-border last:border-r-0",
                          isSelected && "bg-primary/10",
                          isToday && "bg-accent/20"
                        )}
                      >
                        <div className="font-semibold text-sm text-foreground">
                          {format(day, 'EEE', { locale })}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {format(day, 'MMM dd', { locale })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Court rows */}
              <div>
                {courts.map((court) => (
                  <div key={court.id || court._id} className="grid" style={getGridStyle()}>
                    <div className="p-3 bg-muted/30 border-r border-b border-border flex flex-col items-center justify-center">
                      <div className="font-semibold text-sm text-foreground">{court.name}</div>
                      <div className="text-xs text-muted-foreground">({court.capacity})</div>
                    </div>

                    {weekDays.map((day, dayIndex) => {
                      const cellSegments = getSegmentsForDayAndCourt(day, court.id || court._id || '');
                      const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

                      return (
                        <div
                          key={dayIndex}
                          className={cn(
                            "min-h-[100px] p-1 border-r border-b border-border last:border-r-0 bg-card",
                            isSelected && "bg-primary/5"
                          )}
                        >
                          <div className="flex flex-col gap-1">
                            {cellSegments.map((seg) => (
                              <div
                                key={`${seg.booking.id}-${seg.dayStr}`}
                                className={cn(
                                  "p-2 rounded-md text-white text-xs shadow-sm cursor-pointer hover:opacity-90 transition-opacity",
                                  seg.booking.color === 'blue' ? "bg-blue-600" : "bg-green-600"
                                )}
                                title={`${seg.booking.playerName} - ${formatTime(seg.booking.startTime)} to ${formatTime(seg.booking.endTime)}`}
                              >
                                <div className="font-medium truncate">
                                  {formatTime(seg.booking.startTime)} – {formatTime(seg.booking.endTime)}
                                </div>
                                <div className="truncate opacity-90">{seg.booking.playerName}</div>
                              </div>
                            ))}
                          </div>
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
    </div>
  );
};

export default React.memo(WeekView);
