// src/App.tsx
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ScheduleView from './components/ScheduleView';
import WeekView from './components/WeekView';
import MonthView from './components/MonthView';
import BookingModal from './components/BookingModal';
import { courts, bookings } from './data/mockData';
import type { ViewMode } from './types';
import './App.css';

function App() {
  const [activeMenuItem, setActiveMenuItem] = useState('schedule');
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 10, 21)); // Nov 21, 2025
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <div className="app">
      <Sidebar activeItem={activeMenuItem} onItemClick={setActiveMenuItem} />

      <div className="main-content">
        <Header
          selectedCourt="Court 1"
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

      {/* Add Booking modal with tabs: Single / Fixed / Coach / Close */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        courts={courts}
        selectedDate={selectedDate}
      />
    </div>
  );
}

export default App;
