/**
 * Test Calendar Integration Component
 * 
 * Full calendar integration using real API data from the Padel booking system
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Calendar } from '../modules/components/calendar/Calendar';
import { CalendarHeader } from '../modules/components/calendar/CalendarHeader';
import { CalendarBody } from '../modules/components/calendar/CalendarBody';
import type { ViewMode, Court, Booking, ApiCourt, ApiScheduleCourtBooking } from '../types';
import type { IEvent } from '../modules/calendar/interfaces';

export function TestCalendarIntegration() {
  const { clubId, logout } = useAuth();
  const [activeMenuItem, setActiveMenuItem] = useState('schedule');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [courts, setCourts] = useState<Court[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use ref to track if initial load is done
  const isInitialMount = useRef(true);
  const prevDateRef = useRef(selectedDate);
  const prevViewModeRef = useRef(viewMode);

  useEffect(() => {
    if (!clubId) return;

    // Reload data when date changes, view mode changes, or on initial mount
    const dateChanged = prevDateRef.current.toDateString() !== selectedDate.toDateString();
    const viewModeChanged = prevViewModeRef.current !== viewMode;
    
    if (isInitialMount.current || dateChanged || viewModeChanged) {
      loadData();
      isInitialMount.current = false;
      prevDateRef.current = selectedDate;
      prevViewModeRef.current = viewMode;
    }
  }, [clubId, selectedDate, viewMode]);

  const loadData = useCallback(async () => {
    if (!clubId) return;

    setLoading(true);
    setError(null);
    try {
      // Fetch courts
      const courtsData: ApiCourt[] = await apiService.getCourts(clubId);
      
      // Transform courts to match component expectations
      const transformedCourts: Court[] = courtsData.map((court) => ({
        id: court._id,
        _id: court._id,
        name: court.name,
        capacity: court.surfaceType || court.courtType || 'Standard',
        courtType: court.courtType,
        defaultPricePerHour: court.defaultPricePerHour,
        isActive: court.isActive
      }));
      setCourts(transformedCourts);

      // Fetch bookings based on view mode
      let scheduleResponse: ApiScheduleCourtBooking[];
      
      if (viewMode === 'day') {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        scheduleResponse = await apiService.getDaySchedule(clubId, dateStr);
      } else if (viewMode === 'week') {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        scheduleResponse = await apiService.getWeekSchedule(clubId, dateStr);
      } else {
        // month view
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth() + 1; // getMonth() returns 0-11
        scheduleResponse = await apiService.getMonthSchedule(clubId, year, month);
      }
      
      // Transform API data to match component expectations
      const allBookings: Booking[] = (scheduleResponse || []).flatMap((courtSchedule) => 
        courtSchedule.bookings.map((booking) => {
          // Parse UTC datetime strings
          const startDate = new Date(booking.startDateTime);
          const endDate = new Date(booking.endDateTime);

          // Get the booking dates in local timezone
          const bookingStartDateStr = startDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
          const bookingEndDateStr = endDate.toLocaleDateString('en-CA');
          
          // Check if booking spans midnight (overnight booking)
          const isOvernightBooking = bookingStartDateStr !== bookingEndDateStr;
          
          // Determine color based on category color or default
          let color: 'green' | 'blue' = 'green';
          if (booking.categoryColor) {
            color = booking.categoryColor === '#3B82F6' ? 'blue' : 'green';
          }
          
          return {
            id: booking.bookingId || booking._id || '',
            courtId: courtSchedule.courtId,
            playerName: booking.bookingName,
            phone: booking.phone,
            // Extract time in local timezone (HH:mm format)
            startTime: `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`,
            endTime: `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`,
            date: bookingStartDateStr, // Primary date (when it starts)
            endDate: isOvernightBooking ? bookingEndDateStr : undefined, // End date if overnight
            isOvernightBooking,
            color,
            status: booking.paymentStatus?.toLowerCase() || 'pending',
            price: booking.price,
            paymentStatus: booking?.paymentStatus,
            categoryName: booking.categoryName,
            bookingType: booking.bookingType,
            bookingSource: booking.bookingSource,
            repeatedDaysOfWeek: booking.repeatedDaysOfWeek || (booking.repeatedDayOfWeek ? [booking.repeatedDayOfWeek] : undefined),
            recurrenceEndDate: booking.recurrenceEndDate ? new Date(booking.recurrenceEndDate).toLocaleDateString('en-CA') : undefined
          };
        })
      );
      
      // Filter bookings based on view mode
      let filteredBookings: Booking[];
      
      if (viewMode === 'day') {
        // For day view: filter bookings that match the selected date
        // Include bookings that:
        // 1. Start on the selected date
        // 2. Are overnight bookings that end on the selected date
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        filteredBookings = allBookings.filter(booking => {
          const startsOnDate = booking.date === dateStr;
          const endsOnDate = booking.isOvernightBooking && booking.endDate === dateStr;
          return startsOnDate || endsOnDate;
        });
      } else {
        // For week and month views: use all bookings from API
        // The API already returns filtered data for the appropriate range
        filteredBookings = allBookings;
      }
      
      setBookings(filteredBookings);

      // Merge closedDates from schedule response into courts
      const courtsWithClosedDates = transformedCourts.map(court => {
        const courtSchedule = scheduleResponse.find(cs => cs.courtId === court.id);
        return {
          ...court,
          closedDates: courtSchedule?.closedDates || []
        };
      });
      setCourts(courtsWithClosedDates);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [clubId, selectedDate, viewMode]);

  const handleMenuItemClick = useCallback(async (item: string) => {
    if (item === 'logout') {
      await logout();
      window.location.href = '/login';
    } else {
      setActiveMenuItem(item);
    }
  }, [logout]);

  const handleBookingDragDrop = useCallback(async (
    bookingId: string,
    newCourtId: string,
    newStartTime: string,
    newEndTime: string,
    date: string
  ) => {
    if (!clubId) return;

    try {
      // Parse the time and date to create ISO datetime strings in local timezone
      const [startHours, startMinutes] = newStartTime.split(':').map(Number);
      const [endHours, endMinutes] = newEndTime.split(':').map(Number);
      
      // Create dates in local timezone
      const startDateTime = new Date(date);
      startDateTime.setHours(startHours, startMinutes, 0, 0);
      
      const endDateTime = new Date(date);
      endDateTime.setHours(endHours, endMinutes, 0, 0);
      
      // Calculate duration in minutes to properly detect overnight bookings
      const startMinutesTotal = startHours * 60 + startMinutes;
      const endMinutesTotal = endHours * 60 + endMinutes;
      
      // Handle overnight bookings - if end time is less than or equal to start time
      // OR if the time difference suggests it crosses midnight
      if (endMinutesTotal <= startMinutesTotal) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }

      const dragDropData = {
        startDateTime: startDateTime.toISOString(), // Converts local time to UTC
        endDateTime: endDateTime.toISOString(), // Converts local time to UTC
        courtId: newCourtId
      };

      console.log('Drag-drop booking:', {
        bookingId,
        originalDate: date,
        newStartTime,
        newEndTime,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        isOvernight: endMinutesTotal <= startMinutesTotal
      });

      await apiService.dragDropBooking(clubId, bookingId, dragDropData);
      
      // Check if this creates an overnight booking or moves to different date
      const newStartDateStr = startDateTime.toLocaleDateString('en-CA');
      const newEndDateStr = endDateTime.toLocaleDateString('en-CA');
      const currentDateStr = format(selectedDate, 'yyyy-MM-dd');
      const isNewOvernightBooking = newStartDateStr !== newEndDateStr;
      
      // If booking moved to a different day or became overnight, reload data
      // This ensures proper display across date boundaries
      const bookingMovedToOtherDay = newStartDateStr !== currentDateStr && newEndDateStr !== currentDateStr;
      
      if (isNewOvernightBooking || bookingMovedToOtherDay) {
        // Full reload needed to handle date changes
        await loadData();
      } else {
        // Simple update for same-day time changes
        setBookings(prevBookings => {
          // Check if booking should still appear on current date
          const shouldRemove = newStartDateStr !== currentDateStr && 
                               (!isNewOvernightBooking || newEndDateStr !== currentDateStr);
          
          if (shouldRemove) {
            // Remove from current view
            return prevBookings.filter(b => b.id !== bookingId);
          }
          
          // Update booking details
          return prevBookings.map(booking => {
            if (booking.id === bookingId) {
              const newStart = new Date(dragDropData.startDateTime);
              const newEnd = new Date(dragDropData.endDateTime);
              return {
                ...booking,
                courtId: newCourtId,
                startTime: `${newStart.getHours().toString().padStart(2, '0')}:${newStart.getMinutes().toString().padStart(2, '0')}`,
                endTime: `${newEnd.getHours().toString().padStart(2, '0')}:${newEnd.getMinutes().toString().padStart(2, '0')}`,
                date: newStartDateStr,
                endDate: isNewOvernightBooking ? newEndDateStr : undefined,
                isOvernightBooking: isNewOvernightBooking
              };
            }
            return booking;
          });
        });
      }
    } catch (error: any) {
      console.error('Failed to drag-drop booking:', error);
      const errorMessage = error.response?.data?.message || 'Failed to move booking';
      setError(errorMessage);
      toast.error(errorMessage);
      // Reload on error to revert changes
      await loadData();
    }
  }, [clubId, loadData, selectedDate]);

  const handleModalClose = useCallback(() => {
    setIsBookingModalOpen(false);
    loadData();
  }, [loadData]);

  const handleEventDrop = (event: IEvent, newStartDate: Date, newEndDate: Date, newCourtId?: string) => {
    console.log('Event dropped:', event, 'New time:', newStartDate, '->', newEndDate, 'New court:', newCourtId);
    
    // Convert the event drop to the format expected by handleBookingDragDrop
    if (event.metadata?.bookingId && event.metadata?.courtId) {
      const dateStr = format(newStartDate, 'yyyy-MM-dd');
      const startTime = format(newStartDate, 'HH:mm');
      const endTime = format(newEndDate, 'HH:mm');
      const courtId = newCourtId || event.metadata.courtId; // Use new court if provided, otherwise keep original
      
      // Show immediate feedback
      const courtName = courts.find(c => c.id && c.id.toString() === courtId)?.name || `Court ${courtId}`;
      const timeRange = `${startTime} - ${endTime}`;
      const moveId = `move-${event.metadata.bookingId}`;
      
      toast.loading(`Moving booking to ${courtName} at ${timeRange}...`, {
        id: moveId,
        duration: 2000
      });
      
      handleBookingDragDrop(event.metadata.bookingId, courtId, startTime, endTime, dateStr)
        .then(() => {
          toast.success(`Booking moved to ${courtName} at ${timeRange}`, {
            id: moveId,
            duration: 3000
          });
        })
        .catch((error) => {
          toast.error(`Failed to move booking: ${error.message}`, {
            id: moveId,
            duration: 4000
          });
        });
    }
  };

  // Make handleEventDrop available globally for CalendarDayView
  useEffect(() => {
    (window as any).handleEventDrop = handleEventDrop;
    return () => {
      delete (window as any).handleEventDrop;
    };
  }, [handleEventDrop]);

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Error Loading Calendar Data
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button 
            onClick={loadData}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
            Loading calendar data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Full Calendar Integration Test
      </h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-[700px] flex flex-col">
        <Calendar
          bookings={bookings}
          courts={courts}
          customers={[]} // We don't have separate customer data in this API format
          coaches={[]}   // We don't have separate coach data in this API format
          onEventDrop={handleEventDrop}
          className="h-full flex flex-col"
        >
          <div className="h-full flex flex-col">
            <CalendarHeader />
            <CalendarBody />
          </div>
        </Calendar>
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Court-Based Calendar Features:</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <li>• Real Padel booking API integration</li>
          <li>• Court-column layout (like image provided)</li>
          <li>• Current date: {format(selectedDate, 'yyyy-MM-dd')}</li>
          <li>• View mode: {viewMode}</li>
          <li>• Courts loaded: {courts.length}</li>
          <li>• Bookings loaded: {bookings.length}</li>
          <li>• Drag-drop between courts and time slots</li>
          <li>• Multiple calendar views (Day/Week/Month/Year/Agenda)</li>
          <li>• Click events to view details, click slots to create bookings</li>
        </ul>
      </div>
    </div>
  );
}