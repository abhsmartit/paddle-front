import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ScheduleView from '../components/ScheduleView';
import WeekView from '../components/WeekView';
import MonthView from '../components/MonthView';
import BookingModal from '../components/BookingModal';
import ClosedDates from '../components/ClosedDates';
import { apiService } from '../services/api';
import type { ViewMode, Court, Booking, ApiCourt, ApiScheduleCourtBooking } from '../types';

import { format, startOfWeek } from 'date-fns';

export default function Dashboard() {
  const { clubId, logout } = useAuth();
  const [activeMenuItem, setActiveMenuItem] = useState('schedule');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [courts, setCourts] = useState<Court[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
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
        // Get the start of the week (Sunday) for the selected date
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
        const dateStr = format(weekStart, 'yyyy-MM-dd');
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
          
          // Determine color based on booking type and source
          let color: 'green' | 'blue' | 'orange' = 'green';
          if (booking.bookingType === 'COACH') {
            color = 'orange';
          } else if (booking.bookingType === 'FIXED') {
            color = 'blue';
          } else if (booking.categoryColor) {
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
    } catch (error: any) {
      console.error('Failed to load data:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load data';
      setError(errorMessage);
      toast.error(errorMessage);
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



  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-lg text-destructive font-medium">Error: {error}</div>
        <button 
          onClick={loadData}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
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

  // Render different content based on active menu item
  const renderMainContent = () => {
    if (activeMenuItem === 'closed-dates') {
      return <ClosedDates />;
    }

    // Default schedule view content
    return (
      <>
        <Header
          selectedCourt={courts.length > 0 ? `${courts.length} Courts Available` : 'No Courts'}
          onAddBooking={() => setIsBookingModalOpen(true)}
          onToggleSidebar={() => {
            // On mobile, toggle mobile sidebar; on desktop, toggle desktop sidebar
            if (window.innerWidth < 768) {
              setIsMobileSidebarOpen(!isMobileSidebarOpen);
            } else {
              setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
            }
          }}
          isSidebarOpen={isDesktopSidebarOpen}
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
      </>
    );
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      {isDesktopSidebarOpen && (
        <Sidebar 
          activeItem={activeMenuItem} 
          onItemClick={handleMenuItemClick} 
          isMobile={false}
        />
      )}
      
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" 
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-60 z-50 md:hidden shadow-xl">
            <Sidebar 
              activeItem={activeMenuItem} 
              onItemClick={(item) => {
                handleMenuItemClick(item);
                setIsMobileSidebarOpen(false);
              }} 
              isMobile={true}
              onClose={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </>
      )}
      
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {renderMainContent()}
      </main>
    </div>
  );
}
