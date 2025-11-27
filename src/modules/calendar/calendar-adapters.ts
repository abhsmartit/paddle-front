/**
 * Calendar Adapters
 * 
 * Transform Padel booking data into Full Calendar event format.
 * Maintains separation between booking domain and calendar presentation.
 */

import type { Booking, ApiBooking, Court, Customer, Coach, ClosedDate } from '../../types';
import type { IEvent, IUser, TEventColor } from './interfaces';

/**
 * Map booking payment status or category to event color
 */
function getEventColor(booking: Booking | ApiBooking): TEventColor {
  // Priority 1: Use existing color if available
  if ('color' in booking) {
    if (booking.color === 'green') return 'green';
    if (booking.color === 'blue') return 'blue';
  }
  
  // Priority 2: Map payment status
  if (booking.paymentStatus === 'PAID') return 'green';
  if (booking.paymentStatus === 'PARTIAL') return 'orange';
  if (booking.paymentStatus === 'PENDING') return 'red';
  
  // Priority 3: Map booking type
  if (booking.bookingType === 'COACH') return 'purple';
  if (booking.bookingType === 'TOURNAMENT') return 'blue';
  if (booking.bookingType === 'TEAM') return 'teal';
  if (booking.bookingType === 'FIXED') return 'pink';
  
  // Default
  return 'blue';
}

/**
 * Convert booking to event title
 */
function getEventTitle(booking: Booking | ApiBooking, courtName?: string): string {
  const court = courtName ? `${courtName} - ` : '';
  const name = 'playerName' in booking ? booking.playerName : booking.bookingName;
  
  if (booking.bookingType === 'COACH') {
    return `${court}Coach: ${name}`;
  }
  
  return `${court}${name}`;
}

/**
 * Convert booking to event description
 */
function getEventDescription(booking: Booking | ApiBooking): string {
  const parts: string[] = [];
  
  // Add booking type
  if (booking.bookingType) {
    parts.push(`Type: ${booking.bookingType}`);
  }
  
  // Add category
  if (booking.categoryName) {
    parts.push(`Category: ${booking.categoryName}`);
  }
  
  // Add phone
  const phone = 'phone' in booking ? booking.phone : undefined;
  if (phone) {
    parts.push(`Phone: ${phone}`);
  }
  
  // Add payment info
  if (booking.paymentStatus) {
    const price = booking.price ? ` ($${booking.price})` : '';
    parts.push(`Payment: ${booking.paymentStatus}${price}`);
  }
  
  // Add notes
  if ('notes' in booking && booking.notes) {
    parts.push(`Notes: ${booking.notes}`);
  }
  
  return parts.join('\n');
}

/**
 * Convert customer or coach to IUser
 */
export function customerToUser(customer: Customer): IUser {
  return {
    id: customer._id,
    name: customer.fullName,
    picturePath: null,
  };
}

export function coachToUser(coach: Coach): IUser {
  return {
    id: coach._id || coach.id || '',
    name: coach.name || coach.fullName || '',
    picturePath: null,
  };
}

/**
 * Convert a booking to a calendar event
 */
export function bookingToEvent(
  booking: Booking | ApiBooking,
  courtName: string,
  user?: IUser
): IEvent {
  // Generate unique numeric ID from string ID
  const bookingId = 'id' in booking ? booking.id : (booking._id || booking.bookingId || '0');
  const numericId = parseInt(bookingId, 36);
  
  // Determine start and end dates
  let startDate: string;
  let endDate: string;
  
  if ('startDateTime' in booking && 'endDateTime' in booking) {
    // ApiBooking format
    startDate = booking.startDateTime;
    endDate = booking.endDateTime;
  } else {
    // Booking format - combine date with time
    const date = booking.date;
    const endDateStr = booking.endDate || booking.date;
    startDate = `${date}T${booking.startTime}:00.000Z`;
    endDate = `${endDateStr}T${booking.endTime}:00.000Z`;
  }
  
  // Create default user if not provided
  const eventUser: IUser = user || {
    id: 'playerName' in booking ? booking.playerName : booking.bookingName,
    name: 'playerName' in booking ? booking.playerName : booking.bookingName,
    picturePath: null,
  };
  
  const event: IEvent = {
    id: numericId,
    startDate,
    endDate,
    title: getEventTitle(booking, courtName),
    color: getEventColor(booking),
    description: getEventDescription(booking),
    user: eventUser,
    metadata: {
      bookingId: bookingId,
      courtId: booking.courtId,
      courtName,
      bookingType: booking.bookingType || 'SINGLE',
      paymentStatus: booking.paymentStatus,
      categoryName: booking.categoryName,
      phone: 'phone' in booking ? booking.phone : undefined,
      price: booking.price,
      isClosedDate: false,
    },
  };
  
  return event;
}

/**
 * Convert multiple bookings to events
 */
export function bookingsToEvents(
  bookings: (Booking | ApiBooking)[],
  courts: Court[],
  userMap?: Map<string, IUser>
): IEvent[] {
  const events: IEvent[] = [];
  
  for (const booking of bookings) {
    // Find court name
    const court = courts.find(c => (c.id || c._id) === booking.courtId);
    const courtName = court?.name || 'Unknown Court';
    
    // Find user
    let user: IUser | undefined;
    if (userMap) {
      const customerId = 'customerId' in booking ? booking.customerId : undefined;
      const coachId = 'coachId' in booking ? booking.coachId : undefined;
      const userId = coachId || customerId;
      if (userId) {
        user = userMap.get(userId);
      }
    }
    
    events.push(bookingToEvent(booking, courtName, user));
  }
  
  return events;
}

/**
 * Convert closed dates to special calendar events
 */
export function closedDateToEvent(closedDate: ClosedDate, courtName: string): IEvent {
  // Generate numeric ID from string
  const numericId = parseInt(closedDate.closedDateId, 36);
  
  // Closed dates are all-day events
  const date = new Date(closedDate.closedDate);
  const startDate = new Date(date.setHours(0, 0, 0, 0)).toISOString();
  const endDate = new Date(date.setHours(23, 59, 59, 999)).toISOString();
  
  const event: IEvent = {
    id: numericId,
    startDate,
    endDate,
    title: `🚫 ${courtName} - CLOSED`,
    color: 'red',
    description: `Reason: ${closedDate.reason}`,
    user: {
      id: 'system',
      name: 'System',
      picturePath: null,
    },
    metadata: {
      bookingId: closedDate.closedDateId,
      courtId: '',
      courtName,
      bookingType: 'CLOSED',
      isClosedDate: true,
    },
  };
  
  return event;
}

/**
 * Convert all court closed dates to events
 */
export function closedDatesToEvents(courts: Court[]): IEvent[] {
  const events: IEvent[] = [];
  
  for (const court of courts) {
    if (court.closedDates && court.closedDates.length > 0) {
      for (const closedDate of court.closedDates) {
        events.push(closedDateToEvent(closedDate, court.name));
      }
    }
  }
  
  return events;
}

/**
 * Convert calendar event back to booking update data
 * Used for drag-and-drop / resize operations
 */
export interface IEventUpdate {
  bookingId: string;
  startDateTime: string;
  endDateTime: string;
  courtId?: string;
}

export function eventToBookingUpdate(event: IEvent): IEventUpdate | null {
  if (!event.metadata || event.metadata.isClosedDate) {
    return null; // Can't update closed dates
  }
  
  return {
    bookingId: event.metadata.bookingId,
    startDateTime: event.startDate,
    endDateTime: event.endDate,
    courtId: event.metadata.courtId,
  };
}
