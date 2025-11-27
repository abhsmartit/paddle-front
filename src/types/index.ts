export const BookingType = {
  SINGLE: 'SINGLE',
  FIXED: 'FIXED',
  COACH: 'COACH',
} as const;

export type BookingType = typeof BookingType[keyof typeof BookingType];

export interface Court {
  id?: string;
  _id?: string;
  name: string;
  capacity?: string;
  courtType?: string;
  defaultPricePerHour?: number;
  isActive?: boolean;
}

export interface Booking {
  id: string;
  courtId: string;
  playerName: string;
  startTime: string;
  endTime: string;
  date: string; // Format: YYYY-MM-DD (start date)
  endDate?: string; // Format: YYYY-MM-DD (end date if overnight booking)
  isOvernightBooking?: boolean; // True if booking spans midnight
  color: 'green' | 'blue';
  status?: string;
  price?: number;
  phone?: string;
  paymentStatus?: 'PENDING' | 'PARTIAL' | 'PAID';
  categoryName?: string;
  bookingType?: 'SINGLE' | 'TEAM' | 'TOURNAMENT' | 'COACH' | 'FIXED';
  bookingSource?: 'SCHEDULED' | 'ONLINE' | 'FIXED';
  repeatedDaysOfWeek?: string[]; // For fixed bookings
  recurrenceEndDate?: string; // For fixed bookings
}

export type ViewMode = 'day' | 'week' | 'month';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
}

// API Types
export interface ApiCourt {
  _id: string;
  name: string;
  clubId: string;
  surfaceType?: string;
  courtType?: string;
  defaultPricePerHour: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiBookingCategory {
  _id: string;
  clubId: string;
  name: string;
  colorHex: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiBooking {
  _id?: string;
  bookingId?: string;
  clubId: string;
  courtId: string;
  customerId?: string;
  coachId?: string;
  bookingName: string;
  phone: string;
  bookingType: 'SINGLE' | 'TEAM' | 'TOURNAMENT' | 'COACH';
  bookingSource: 'SCHEDULED' | 'ONLINE' | 'FIXED';
  startDateTime: string;
  endDateTime: string;
  price: number;
  categoryId?: string;
  categoryName?: string;
  categoryColor?: string;
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID';
  notes?: string;
  repeatedDayOfWeek?: string; // Old format - single day
  repeatedDaysOfWeek?: string[]; // New format - multiple days
  recurrenceEndDate?: string; // For fixed bookings
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiScheduleCourtBooking {
  courtId: string;
  courtName: string;
  bookings: ApiBooking[];
}

export interface ApiDaySchedule {
  date: string;
  courts: ApiScheduleCourtBooking[];
}

export interface CreateBookingRequest {
  courtId: string;
  customerId?: string;
  coachId?: string;
  bookingName: string;
  phone: string;
  bookingType: 'SINGLE' | 'TEAM' | 'TOURNAMENT' | 'COACH';
  startDateTime: string;
  endDateTime: string;
  price: number;
  bookingCategoryId?: string;
  notes?: string;
}

export interface CreateFixedBookingRequest {
  courtId: string;
  customerId?: string;
  bookingName: string;
  phone: string;
  bookingType: 'SINGLE' | 'TEAM' | 'TOURNAMENT' | 'COACH' | 'FIXED';
  startDateTime: string; // ISO format
  durationMinutes: number;
  repeatedDaysOfWeek: string[]; // ['MONDAY', 'WEDNESDAY', 'FRIDAY']
  recurrenceEndDate: string; // YYYY-MM-DD format
  price: number;
  bookingCategoryId?: string;
  notes?: string;
}

export interface Customer {
  _id: string;
  clubId: string;
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coach {
  _id: string;
  id?: string;
  clubId: string;
  name: string;
  fullName?: string;
  phone?: string;
  email?: string;
  specialization?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClosedDate {
  _id: string;
  clubId: string;
  closedDate: string; // YYYY-MM-DD format
  reason: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClosedDateRequest {
  closedDate: string; // YYYY-MM-DD format
  reason: string;
}
