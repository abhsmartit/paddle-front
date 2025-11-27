/**
 * Main Calendar Component
 * Adapted from Next.js to work with Vite/React
 * 
 * This is the main calendar component that integrates with the Padel booking system
 */

import React, { useEffect, useCallback } from 'react';
import { CalendarProvider, useCalendarContext } from './CalendarProvider';
import { DndProvider } from './DndProvider';
import type { IEvent, IUser } from '../../calendar/interfaces';
import type { Booking, Customer, Coach, Court } from '../../../types';
import { bookingsToEvents, customerToUser, coachToUser } from '../../calendar/calendar-adapters';

interface CalendarProps {
  // Data from Padel booking system
  bookings: Booking[];
  customers?: Customer[];
  coaches?: Coach[];
  courts: Court[];
  
  // Event handlers
  onEventUpdate?: (eventId: number, updates: Partial<IEvent>) => void;
  onEventDrop?: (event: IEvent, newStartDate: Date, newEndDate: Date) => void;
  onDateSelect?: (date: Date) => void;
  
  // Configuration
  className?: string;
  children?: React.ReactNode;
}

// Helper functions to transform data
function transformBookingsToEvents(bookings: Booking[], courts: Court[], users?: IUser[]): IEvent[] {
  // Create user map if provided
  const userMap = users ? new Map(users.map(user => [user.id, user])) : undefined;
  return bookingsToEvents(bookings, courts, userMap);
}

function transformUsersToCalendarUsers(customers: Customer[] = [], coaches: Coach[] = []): IUser[] {
  const users: IUser[] = [];
  
  // Add customers
  customers.forEach(customer => {
    users.push(customerToUser(customer));
  });
  
  // Add coaches
  coaches.forEach(coach => {
    users.push(coachToUser(coach));
  });
  
  return users;
}

// Transform courts to calendar courts format
function transformCourtsToCalendarCourts(courts: Court[]) {
  return courts.map(court => ({
    id: court.id?.toString() || court._id || '',
    _id: court._id || '',
    name: court.name || 'Unknown Court',
    capacity: court.capacity || court.courtType || 'Standard',
    courtType: court.courtType,
    defaultPricePerHour: court.defaultPricePerHour,
    isActive: court.isActive !== false
  }));
}

function CalendarInner({ 
  bookings, 
  customers = [],
  coaches = [],
  courts,
  onEventDrop,
  className,
  children 
}: CalendarProps) {
  const {
    setEvents,
    setUsers: setCalendarUsers,
    setCourts: setCalendarCourts,
  } = useCalendarContext();

  // Transform Padel bookings into calendar events
  useEffect(() => {
    const calendarUsers = transformUsersToCalendarUsers(customers, coaches);
    const calendarEvents = transformBookingsToEvents(bookings, courts, calendarUsers);
    setEvents(calendarEvents);
  }, [bookings, courts, customers, coaches, setEvents]);

  // Transform Padel users into calendar users
  useEffect(() => {
    const calendarUsers = transformUsersToCalendarUsers(customers, coaches);
    setCalendarUsers(calendarUsers);
  }, [customers, coaches, setCalendarUsers]);

  // Transform Padel courts into calendar courts
  useEffect(() => {
    const calendarCourts = transformCourtsToCalendarCourts(courts);
    setCalendarCourts(calendarCourts);
  }, [courts, setCalendarCourts]);

  // Handle drag and drop
  const handleDrop = useCallback((
    event: IEvent, 
    _sourceDate: Date, 
    targetDate: Date, 
    targetTime?: string
  ) => {
    if (!targetTime) {
      // If no specific time, use the original time but on the new date
      const originalStart = new Date(event.startDate);
      const originalEnd = new Date(event.endDate);
      
      const newStart = new Date(targetDate);
      newStart.setHours(originalStart.getHours(), originalStart.getMinutes());
      
      const newEnd = new Date(targetDate);
      newEnd.setHours(originalEnd.getHours(), originalEnd.getMinutes());
      
      onEventDrop?.(event, newStart, newEnd);
    } else {
      // Parse target time and create new dates
      const [hours, minutes] = targetTime.split(':').map(Number);
      const duration = new Date(event.endDate).getTime() - new Date(event.startDate).getTime();
      
      const newStart = new Date(targetDate);
      newStart.setHours(hours, minutes);
      
      const newEnd = new Date(newStart.getTime() + duration);
      
      onEventDrop?.(event, newStart, newEnd);
    }
  }, [onEventDrop]);

  return (
    <DndProvider
      onDrop={handleDrop}
    >
      <div className={className}>
        {children}
      </div>
    </DndProvider>
  );
}

export function Calendar(props: CalendarProps) {
  const { bookings, customers = [], coaches = [], courts } = props;
  
  // Create initial calendar events, users, and courts
  const initialUsers = transformUsersToCalendarUsers(customers, coaches);
  const initialEvents = transformBookingsToEvents(bookings, courts, initialUsers);
  const initialCourts = transformCourtsToCalendarCourts(courts);

  return (
    <CalendarProvider 
      initialEvents={initialEvents}
      initialUsers={initialUsers}
      initialCourts={initialCourts}
    >
      <CalendarInner {...props} />
    </CalendarProvider>
  );
}

export { useCalendarContext } from './CalendarProvider';
export { useDndContext } from './DndProvider';