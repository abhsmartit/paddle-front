/**
 * Calendar Helper Functions
 */

import { format, parseISO, isSameDay } from 'date-fns';
import type { IEvent } from '../../calendar/interfaces';
import type { IGroupedEvents } from './types';

/**
 * Group events by time slot for rendering
 */
export function groupEvents(events: IEvent[]): IGroupedEvents {
  const grouped: IGroupedEvents = {};
  
  events.forEach((event) => {
    const startTime = format(parseISO(event.startDate), 'HH:mm');
    const key = `${format(parseISO(event.startDate), 'yyyy-MM-dd')}-${startTime}`;
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(event);
  });
  
  return grouped;
}

/**
 * Check if event is happening now
 */
export function isEventHappeningNow(event: IEvent): boolean {
  const now = new Date();
  const start = parseISO(event.startDate);
  const end = parseISO(event.endDate);
  
  return now >= start && now <= end;
}

/**
 * Get events for a specific date
 */
export function getEventsForDate(events: IEvent[], date: Date): IEvent[] {
  return events.filter(event => {
    const eventStart = parseISO(event.startDate);
    return isSameDay(eventStart, date);
  });
}

/**
 * Calculate event position and height for day/week view rendering
 */
export function calculateEventLayout(event: IEvent, hourHeight: number = 96) {
  const start = parseISO(event.startDate);
  const end = parseISO(event.endDate);
  
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const duration = endMinutes - startMinutes;
  
  return {
    top: (startMinutes / 60) * hourHeight,
    height: Math.max((duration / 60) * hourHeight, 30), // Minimum 30px height
  };
}

/**
 * Split events into single-day and multi-day events
 */
export function splitEventsByDuration(events: IEvent[]) {
  const singleDayEvents: IEvent[] = [];
  const multiDayEvents: IEvent[] = [];
  
  events.forEach(event => {
    const start = parseISO(event.startDate);
    const end = parseISO(event.endDate);
    
    if (isSameDay(start, end)) {
      singleDayEvents.push(event);
    } else {
      multiDayEvents.push(event);
    }
  });
  
  return { singleDayEvents, multiDayEvents };
}