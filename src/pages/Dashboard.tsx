import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ScheduleView from '../components/ScheduleView';
import WeekView from '../components/WeekView';
import MonthView from '../components/MonthView';
import BookingModal from '../components/BookingModal';
import { apiService } from '../services/api';
import type { ViewMode, Court, Booking, ApiCourt, ApiScheduleCourtBooking } from '../types';
import '../App.css';
import { format } from 'date-fns';

export default function Dashboard() {
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

    // Only reload data when date changes or on initial mount
    const dateChanged = prevDateRef.current.toDateString() !== selectedDate.toDateString();
    
    if (isInitialMount.current || dateChanged) {
      loadData();
      isInitialMount.current = false;
      prevDateRef.current = selectedDate;
    }
    
    // Update refs without triggering reload
    prevViewModeRef.current = viewMode;
  }, [clubId, selectedDate]);

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
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      const scheduleResponse: ApiScheduleCourtBooking[] = await apiService.getDaySchedule(clubId, dateStr);
      
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
            bookingType: booking.bookingType
          };
        })
      );
      
      // Filter bookings that match the selected date
      // Include bookings that:
      // 1. Start on the selected date
      // 2. Are overnight bookings that end on the selected date
      const filteredBookings = allBookings.filter(booking => {
        const startsOnDate = booking.date === dateStr;
        const endsOnDate = booking.isOvernightBooking && booking.endDate === dateStr;
        return startsOnDate || endsOnDate;
      });
      
      setBookings(filteredBookings);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [clubId, selectedDate]);

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
      setError(error.response?.data?.message || 'Failed to move booking');
      // Reload on error to revert changes
      await loadData();
    }
  }, [clubId, loadData, selectedDate]);

  const handleModalClose = useCallback(() => {
    setIsBookingModalOpen(false);
    loadData();
  }, [loadData]);



  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#ef4444',
        gap: '16px'
      }}>
        <div>Error: {error}</div>
        <button 
          onClick={loadData}
          style={{
            padding: '8px 16px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // if (!clubId) {
  //   return (
  //     <div style={{
  //       display: 'flex',
  //       alignItems: 'center',
  //       justifyContent: 'center',
  //       minHeight: '100vh',
  //       fontSize: '18px',
  //       color: '#ef4444'
  //     }}>
  //       No club selected. Please login again.
  //     </div>
  //   );
  // }

  return (
    <div className="app">
      <Sidebar activeItem={activeMenuItem} onItemClick={handleMenuItemClick} />
      <div className="main-content">
        <Header
          selectedCourt={courts.length > 0 ? `${courts.length} Courts Available` : 'No Courts'}
          onAddBooking={() => setIsBookingModalOpen(true)}
        />
        {viewMode === 'day' && (
          <ScheduleView 
            courts={courts} 
            bookings={bookings} 
            selectedDate={selectedDate}
            viewMode={viewMode}
            onDateChange={setSelectedDate}
            onViewModeChange={setViewMode}
            onBookingDragDrop={handleBookingDragDrop}
          />
        )}
        {viewMode === 'week' && (
          <WeekView 
            courts={courts} 
            bookings={bookings} 
            selectedDate={selectedDate}
            viewMode={viewMode}
            onDateChange={setSelectedDate}
            onViewModeChange={setViewMode}
          />
        )}
        {viewMode === 'month' && (
          <MonthView 
            bookings={bookings} 
            selectedDate={selectedDate}
            viewMode={viewMode}
            onDateChange={setSelectedDate}
            onViewModeChange={setViewMode}
          />
        )}
      </div>
      {isBookingModalOpen && clubId && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={handleModalClose}
          courts={courts}
          selectedDate={selectedDate}
          clubId={clubId}
          onBookingCreated={loadData}
        />
      )}
    </div>
  );
}
