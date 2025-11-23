import React from 'react';
import { format, startOfWeek, addDays, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { enUS, ar } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import type { Booking, Court, ViewMode } from '../types';
import './WeekView.css';

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
 * - 23:00 → 02:00 → one segment on start date (23rd) AND one on next date (24th)
 *
 * IMPORTANT: we DO NOT change the times; labels still use booking.startTime / endTime.
 */
const createSegments = (booking: Booking): BookingSegment[] => {
  const bookingDate = parseISO(booking.date);
  const baseDayStr = format(bookingDate, 'yyyy-MM-dd');

  const startIndex = getSlotIndex(booking.startTime);
  const endIndex = getSlotIndex(booking.endTime);

  // same-day booking
  if (endIndex > startIndex) {
    return [{ booking, dayStr: baseDayStr }];
  }

  // overnight booking: show on start day + next day
  const nextDayStr = format(addDays(bookingDate, 1), 'yyyy-MM-dd');

  return [
    { booking, dayStr: baseDayStr },
    { booking, dayStr: nextDayStr },
  ];
};

const WeekView = ({ courts, bookings, selectedDate, viewMode, onDateChange, onViewModeChange }: WeekViewProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'ar' ? ar : enUS;

  const handlePrevious = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7); // Go back one week
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7); // Go forward one week
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

  return (
    <div className="week-view">
      <div className="schedule-controls">
        <div className="schedule-nav-left">
          <button className="schedule-nav-button" onClick={handlePrevious}>
            <ChevronLeft size={20} />
            <span>{t('previous')}</span>
          </button>
          <button className="schedule-nav-button" onClick={handleNext}>
            <span>{t('next')}</span>
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="schedule-date-display">
          <span>{format(selectedDate, 'EEEE MMM dd', { locale })}</span>
          <ChevronDown size={18} />
        </div>

        <div className="schedule-view-mode-selector">
          <button
            className={`schedule-view-mode-button ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => onViewModeChange('month')}
          >
            {t('month')}
          </button>
          <button
            className={`schedule-view-mode-button ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => onViewModeChange('week')}
          >
            {t('week')}
          </button>
          <button
            className={`schedule-view-mode-button ${viewMode === 'day' ? 'active' : ''}`}
            onClick={() => onViewModeChange('day')}
          >
            {t('day')}
          </button>
        </div>
      </div>

      <div className="week-container">
        {/* Header with days */}
        <div className="week-header">
          <div className="time-column-header">Courts</div>
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`day-header ${
                format(day, 'yyyy-MM-dd') ===
                format(selectedDate, 'yyyy-MM-dd')
                  ? 'active'
                  : ''
              }`}
            >
              <div className="day-name">
                {format(day, 'EEE', { locale })}
              </div>
              <div className="day-date">
                {format(day, 'MMM dd', { locale })}
              </div>
            </div>
          ))}
        </div>

        {/* Court rows */}
        <div className="week-courts">
          {courts.map((court) => (
            <div key={court.id} className="week-court-row">
              <div className="court-label">
                <div className="court-name">{court.name}</div>
                <div className="court-capacity">
                  ({court.capacity})
                </div>
              </div>

              {weekDays.map((day, dayIndex) => {
                const cellSegments = getSegmentsForDayAndCourt(
                  day,
                  court.id,
                );

                return (
                  <div
                    key={dayIndex}
                    className="week-day-cell"
                  >
                    {cellSegments.map((seg) => (
                      <div
                        key={`${seg.booking.id}-${seg.dayStr}`}
                        className={`week-booking ${seg.booking.color}`}
                        title={`${seg.booking.playerName} - ${formatTime(
                          seg.booking.startTime,
                        )} to ${formatTime(
                          seg.booking.endTime,
                        )}`}
                      >
                        {/* ✅ label uses original times -> matches Day & Month */}
                        <div className="week-booking-time">
                          {formatTime(
                            seg.booking.startTime,
                          )}{' '}
                          –{' '}
                          {formatTime(seg.booking.endTime)}
                        </div>
                        <div className="week-booking-name">
                          {seg.booking.playerName}
                        </div>
                      </div>
                    ))}

                    {cellSegments.length === 0 && (
                      <div className="empty-cell" />
                    )}
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

export default React.memo(WeekView);
