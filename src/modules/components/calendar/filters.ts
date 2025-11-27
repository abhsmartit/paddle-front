/**
 * Calendar Filter Types and Interfaces
 * 
 * Comprehensive filtering system for calendar views
 */

export interface ICalendarFilters {
  // Court filters
  selectedCourts: string[]; // Court IDs to show, empty = show all
  
  // Booking status filters
  bookingStatuses: BookingStatusFilter[];
  
  // Time filters
  timeRange: TimeRangeFilter;
  
  // Customer/Coach filters
  selectedCustomers: string[]; // Customer IDs
  selectedCoaches: string[]; // Coach IDs
  
  // Booking type filters
  bookingTypes: BookingTypeFilter[];
  
  // Date range filter (for agenda view)
  dateRange?: {
    start: Date;
    end: Date;
  };
  
  // Date navigation filters
  dateNavigation: {
    enabled: boolean;
    filterFutureDays: number; // Show next X days from current date
    filterPastDays: number; // Show past X days from current date
    filterWeekends: boolean; // Hide weekend events
    filterHolidays: boolean; // Hide holiday events
  };
  
  // Search/text filter
  searchText: string;
  
  // Show only specific user's bookings
  showMyBookingsOnly: boolean;
}

export type BookingStatusFilter = 
  | 'confirmed' 
  | 'pending' 
  | 'cancelled' 
  | 'completed'
  | 'no-show';

export type BookingTypeFilter = 
  | 'regular' 
  | 'lesson' 
  | 'tournament' 
  | 'maintenance' 
  | 'blocked';

export interface TimeRangeFilter {
  enabled: boolean;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
}

export interface FilterOptions {
  courts: Array<{ id: string; name: string; }>;
  customers: Array<{ id: string; name: string; }>;
  coaches: Array<{ id: string; name: string; }>;
  availableStatuses: BookingStatusFilter[];
  availableTypes: BookingTypeFilter[];
}

// Default filter state
export const defaultFilters: ICalendarFilters = {
  selectedCourts: [],
  bookingStatuses: ['confirmed', 'pending'],
  timeRange: {
    enabled: false,
    startTime: '06:00',
    endTime: '23:00'
  },
  selectedCustomers: [],
  selectedCoaches: [],
  bookingTypes: ['regular', 'lesson'],
  dateNavigation: {
    enabled: false,
    filterFutureDays: 30,
    filterPastDays: 7,
    filterWeekends: false,
    filterHolidays: false
  },
  searchText: '',
  showMyBookingsOnly: false
};

// Filter actions
export type FilterAction = 
  | { type: 'SET_SELECTED_COURTS'; payload: string[] }
  | { type: 'TOGGLE_COURT'; payload: string }
  | { type: 'SET_BOOKING_STATUSES'; payload: BookingStatusFilter[] }
  | { type: 'TOGGLE_BOOKING_STATUS'; payload: BookingStatusFilter }
  | { type: 'SET_TIME_RANGE'; payload: TimeRangeFilter }
  | { type: 'SET_SELECTED_CUSTOMERS'; payload: string[] }
  | { type: 'TOGGLE_CUSTOMER'; payload: string }
  | { type: 'SET_SELECTED_COACHES'; payload: string[] }
  | { type: 'TOGGLE_COACH'; payload: string }
  | { type: 'SET_BOOKING_TYPES'; payload: BookingTypeFilter[] }
  | { type: 'TOGGLE_BOOKING_TYPE'; payload: BookingTypeFilter }
  | { type: 'SET_DATE_RANGE'; payload: { start: Date; end: Date } | undefined }
  | { type: 'SET_DATE_NAVIGATION'; payload: ICalendarFilters['dateNavigation'] }
  | { type: 'SET_SEARCH_TEXT'; payload: string }
  | { type: 'SET_SHOW_MY_BOOKINGS_ONLY'; payload: boolean }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_ALL_FILTERS'; payload: ICalendarFilters };

// Filter reducer
export function filterReducer(state: ICalendarFilters, action: FilterAction): ICalendarFilters {
  switch (action.type) {
    case 'SET_SELECTED_COURTS':
      return { ...state, selectedCourts: action.payload };
    
    case 'TOGGLE_COURT':
      const courtExists = state.selectedCourts.includes(action.payload);
      return {
        ...state,
        selectedCourts: courtExists
          ? state.selectedCourts.filter(id => id !== action.payload)
          : [...state.selectedCourts, action.payload]
      };
    
    case 'SET_BOOKING_STATUSES':
      return { ...state, bookingStatuses: action.payload };
    
    case 'TOGGLE_BOOKING_STATUS':
      const statusExists = state.bookingStatuses.includes(action.payload);
      return {
        ...state,
        bookingStatuses: statusExists
          ? state.bookingStatuses.filter(status => status !== action.payload)
          : [...state.bookingStatuses, action.payload]
      };
    
    case 'SET_TIME_RANGE':
      return { ...state, timeRange: action.payload };
    
    case 'SET_SELECTED_CUSTOMERS':
      return { ...state, selectedCustomers: action.payload };
    
    case 'TOGGLE_CUSTOMER':
      const customerExists = state.selectedCustomers.includes(action.payload);
      return {
        ...state,
        selectedCustomers: customerExists
          ? state.selectedCustomers.filter(id => id !== action.payload)
          : [...state.selectedCustomers, action.payload]
      };
    
    case 'SET_SELECTED_COACHES':
      return { ...state, selectedCoaches: action.payload };
    
    case 'TOGGLE_COACH':
      const coachExists = state.selectedCoaches.includes(action.payload);
      return {
        ...state,
        selectedCoaches: coachExists
          ? state.selectedCoaches.filter(id => id !== action.payload)
          : [...state.selectedCoaches, action.payload]
      };
    
    case 'SET_BOOKING_TYPES':
      return { ...state, bookingTypes: action.payload };
    
    case 'TOGGLE_BOOKING_TYPE':
      const typeExists = state.bookingTypes.includes(action.payload);
      return {
        ...state,
        bookingTypes: typeExists
          ? state.bookingTypes.filter(type => type !== action.payload)
          : [...state.bookingTypes, action.payload]
      };
    
    case 'SET_DATE_RANGE':
      return { ...state, dateRange: action.payload };
    
    case 'SET_DATE_NAVIGATION':
      return { ...state, dateNavigation: action.payload };
    
    case 'SET_SEARCH_TEXT':
      return { ...state, searchText: action.payload };
    
    case 'SET_SHOW_MY_BOOKINGS_ONLY':
      return { ...state, showMyBookingsOnly: action.payload };
    
    case 'RESET_FILTERS':
      return { ...defaultFilters };
    
    case 'SET_ALL_FILTERS':
      return { ...action.payload };
    
    default:
      return state;
  }
}

// Filter utility functions
export function applyFiltersToEvents(events: any[], filters: ICalendarFilters, currentUserId?: string, currentDate?: Date) {
  const today = currentDate || new Date();
  
  return events.filter(event => {
    const eventStart = new Date(event.startDate);
    
    // Date navigation filter
    if (filters.dateNavigation.enabled) {
      const daysDiff = Math.floor((eventStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Filter by future days
      if (daysDiff > filters.dateNavigation.filterFutureDays) {
        return false;
      }
      
      // Filter by past days
      if (daysDiff < -filters.dateNavigation.filterPastDays) {
        return false;
      }
      
      // Filter weekends
      if (filters.dateNavigation.filterWeekends) {
        const dayOfWeek = eventStart.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
          return false;
        }
      }
    }
    
    // Court filter
    if (filters.selectedCourts.length > 0 && event.metadata?.courtId) {
      if (!filters.selectedCourts.includes(event.metadata.courtId)) {
        return false;
      }
    }
    
    // Booking status filter
    if (filters.bookingStatuses.length > 0 && event.metadata?.status) {
      if (!filters.bookingStatuses.includes(event.metadata.status)) {
        return false;
      }
    }
    
    // Time range filter
    if (filters.timeRange.enabled) {
      const eventTime = `${eventStart.getHours().toString().padStart(2, '0')}:${eventStart.getMinutes().toString().padStart(2, '0')}`;
      
      if (eventTime < filters.timeRange.startTime || eventTime > filters.timeRange.endTime) {
        return false;
      }
    }
    
    // Customer filter
    if (filters.selectedCustomers.length > 0 && event.metadata?.customerId) {
      if (!filters.selectedCustomers.includes(event.metadata.customerId)) {
        return false;
      }
    }
    
    // Coach filter
    if (filters.selectedCoaches.length > 0 && event.metadata?.coachId) {
      if (!filters.selectedCoaches.includes(event.metadata.coachId)) {
        return false;
      }
    }
    
    // Booking type filter
    if (filters.bookingTypes.length > 0 && event.metadata?.bookingType) {
      if (!filters.bookingTypes.includes(event.metadata.bookingType)) {
        return false;
      }
    }
    
    // Search text filter
    if (filters.searchText.trim()) {
      const searchLower = filters.searchText.toLowerCase();
      const titleMatch = event.title?.toLowerCase().includes(searchLower);
      const customerMatch = event.metadata?.customerName?.toLowerCase().includes(searchLower);
      const coachMatch = event.metadata?.coachName?.toLowerCase().includes(searchLower);
      
      if (!titleMatch && !customerMatch && !coachMatch) {
        return false;
      }
    }
    
    // Show my bookings only
    if (filters.showMyBookingsOnly && currentUserId) {
      const isMyBooking = 
        event.metadata?.customerId === currentUserId ||
        event.metadata?.coachId === currentUserId ||
        event.metadata?.createdBy === currentUserId;
      
      if (!isMyBooking) {
        return false;
      }
    }
    
    return true;
  });
}

export function getActiveFilterCount(filters: ICalendarFilters): number {
  let count = 0;
  
  if (filters.selectedCourts.length > 0) count++;
  if (filters.bookingStatuses.length !== defaultFilters.bookingStatuses.length) count++;
  if (filters.timeRange.enabled) count++;
  if (filters.selectedCustomers.length > 0) count++;
  if (filters.selectedCoaches.length > 0) count++;
  if (filters.bookingTypes.length !== defaultFilters.bookingTypes.length) count++;
  if (filters.dateNavigation.enabled) count++;
  if (filters.searchText.trim()) count++;
  if (filters.showMyBookingsOnly) count++;
  if (filters.dateRange) count++;
  
  return count;
}