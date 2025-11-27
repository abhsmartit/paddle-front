/**
 * Calendar Provider Context
 * Adapted from Next.js to work with Vite/React
 */

import React, { createContext, useContext, useCallback, useMemo, useReducer } from 'react';
import type { IEvent, IUser } from '../../calendar/interfaces';
import type { TCalendarView } from './types';
import { useLocalStorage } from './hooks';
import { 
  type ICalendarFilters, 
  type FilterAction, 
  type FilterOptions,
  filterReducer, 
  defaultFilters,
  applyFiltersToEvents,
  getActiveFilterCount
} from './filters';

interface ICourt {
  id: string;
  _id: string;
  name: string;
  capacity: string;
  courtType?: string;
  defaultPricePerHour?: number;
  isActive?: boolean;
}

interface ICalendarContext {
  // View state
  currentView: TCalendarView;
  setCurrentView: (view: TCalendarView) => void;
  
  // Date navigation
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  
  // Events data
  events: IEvent[];
  setEvents: (events: IEvent[]) => void;
  
  // Users data for rendering
  users: IUser[];
  setUsers: (users: IUser[]) => void;
  
  // Courts data
  courts: ICourt[];
  setCourts: (courts: ICourt[]) => void;
  
  // Filter state and actions
  filters: ICalendarFilters;
  dispatchFilter: React.Dispatch<FilterAction>;
  filteredEvents: IEvent[];
  activeFilterCount: number;
  filterOptions: FilterOptions;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Event operations
  addEvent: (event: IEvent) => void;
  updateEvent: (eventId: number, updates: Partial<IEvent>) => void;
  removeEvent: (eventId: number) => void;
  
  // View preferences
  showWeekends: boolean;
  setShowWeekends: (show: boolean) => void;
  timeFormat24h: boolean;
  setTimeFormat24h: (format24h: boolean) => void;
}

const CalendarContext = createContext<ICalendarContext | null>(null);

interface CalendarProviderProps {
  children: React.ReactNode;
  initialEvents?: IEvent[];
  initialUsers?: IUser[];
  initialCourts?: ICourt[];
}

export function CalendarProvider({ 
  children, 
  initialEvents = [],
  initialUsers = [],
  initialCourts = []
}: CalendarProviderProps) {
  // Persistent preferences
  const [currentView, setCurrentView] = useLocalStorage<TCalendarView>('calendar-view', 'month');
  const [showWeekends, setShowWeekends] = useLocalStorage('calendar-show-weekends', true);
  const [timeFormat24h, setTimeFormat24h] = useLocalStorage('calendar-time-format-24h', true);
  
  // Session state
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [events, setEvents] = React.useState<IEvent[]>(initialEvents);
  const [users, setUsers] = React.useState<IUser[]>(initialUsers);
  const [courts, setCourts] = React.useState<ICourt[]>(initialCourts);
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Filter state
  const [filters, dispatchFilter] = useReducer(filterReducer, defaultFilters);

  // Event operations
  const addEvent = useCallback((event: IEvent) => {
    setEvents(prev => [...prev, event]);
  }, []);

  const updateEvent = useCallback((eventId: number, updates: Partial<IEvent>) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { ...event, ...updates }
          : event
      )
    );
  }, []);

  const removeEvent = useCallback((eventId: number) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  }, []);

  // Computed filter values
  const filteredEvents = useMemo(() => {
    return applyFiltersToEvents(events, filters, undefined, selectedDate);
  }, [events, filters, selectedDate]);

  const activeFilterCount = useMemo(() => {
    return getActiveFilterCount(filters);
  }, [filters]);

  const filterOptions = useMemo((): FilterOptions => ({
    courts: courts.map(court => ({ id: court.id, name: court.name })),
    customers: users.map(user => ({ id: user.id.toString(), name: user.name })),
    coaches: [], // We'll populate this when we have coach data structure
    availableStatuses: ['confirmed', 'pending', 'cancelled', 'completed', 'no-show'],
    availableTypes: ['regular', 'lesson', 'tournament', 'maintenance', 'blocked']
  }), [courts, users]);

  // Memoized context value
  const contextValue = useMemo<ICalendarContext>(() => ({
    // View state
    currentView,
    setCurrentView,
    
    // Date navigation
    selectedDate,
    setSelectedDate,
    
    // Events data
    events,
    setEvents,
    
    // Users data
    users,
    setUsers,
    
    // Courts data
    courts,
    setCourts,
    
    // Filter state and actions
    filters,
    dispatchFilter,
    filteredEvents,
    activeFilterCount,
    filterOptions,
    
    // Loading states
    isLoading,
    setIsLoading,
    
    // Event operations
    addEvent,
    updateEvent,
    removeEvent,
    
    // View preferences
    showWeekends,
    setShowWeekends,
    timeFormat24h,
    setTimeFormat24h,
  }), [
    currentView, setCurrentView,
    selectedDate, setSelectedDate,
    events, setEvents,
    users, setUsers,
    courts, setCourts,
    filters, dispatchFilter, filteredEvents, activeFilterCount, filterOptions,
    isLoading, setIsLoading,
    addEvent, updateEvent, removeEvent,
    showWeekends, setShowWeekends,
    timeFormat24h, setTimeFormat24h,
  ]);

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendarContext(): ICalendarContext {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendarContext must be used within a CalendarProvider');
  }
  return context;
}