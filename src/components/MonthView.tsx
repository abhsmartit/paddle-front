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
import type { Booking, ViewMode } from '../types';
import './MonthView.css';

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
    return bookings.filter((b) => b.date === dateStr);
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(calendarStart, i);
    return format(day, 'EEE', { locale });
  });

  return (
    <div className="month-view">
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
          <span>{format(selectedDate, 'MMMM yyyy', { locale })}</span>
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

      <div className="month-container">
        <div className="month-header">
          <div className="month-title">
            {format(selectedDate, 'MMMM yyyy', { locale })}
          </div>
        </div>

        <div className="month-calendar">
          {/* Weekday headers */}
          <div className="weekday-headers">
            {weekDays.map((day, index) => (
              <div key={index} className="weekday-header">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="calendar-grid">
            {days.map((day, index) => {
              const dayBookings = getBookingsForDay(day);
              const isCurrentMonth = isSameMonth(day, selectedDate);
              const isToday =
                format(day, 'yyyy-MM-dd') ===
                format(new Date(), 'yyyy-MM-dd');
              const isSelected =
                format(day, 'yyyy-MM-dd') ===
                format(selectedDate, 'yyyy-MM-dd');

              return (
                <div
                  key={index}
                  className={`calendar-day ${
                    !isCurrentMonth ? 'other-month' : ''
                  } ${isToday ? 'today' : ''} ${
                    isSelected ? 'selected' : ''
                  }`}
                >
                  <div className="day-number">
                    {format(day, 'd')}
                  </div>
                  <div className="day-bookings">
                    {dayBookings.slice(0, 3).map((booking) => (
                      <div
                        key={booking.id}
                        className={`month-booking ${booking.color}`}
                        title={`${booking.playerName} - ${formatTime(
                          booking.startTime,
                        )} to ${formatTime(booking.endTime)}`}
                      >
                        <span className="booking-dot"></span>
                        <span className="booking-text">
                          {booking.playerName}
                        </span>
                      </div>
                    ))}
                    {dayBookings.length > 3 && (
                      <div className="more-bookings">
                        +{dayBookings.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MonthView);
