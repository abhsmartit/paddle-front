/**
 * Calendar Day View Component - Court-based Layout
 * 
 * Shows a court-based day view similar to the existing ScheduleView
 * with courts as columns and time slots as rows
 */

import React, { useMemo, useCallback, useState } from 'react';
import { format } from 'date-fns';
import { useCalendarContext } from './CalendarProvider';
import { useDndContext } from './DndProvider';
import type { IEvent } from '../../calendar/interfaces';
import { getEventsForDate } from './helpers';
import { cn } from '../../../lib/utils';

interface Court {
  id: string;
  _id: string;
  name: string;
  capacity: string;
  courtType?: string;
  defaultPricePerHour?: number;
  isActive?: boolean;
}

interface CalendarDayViewProps {
  selectedDate?: Date;
  className?: string;
  courts?: Court[];
  onEventClick?: (event: IEvent) => void;
  onTimeSlotClick?: (date: Date, courtId: string, slotIndex: number) => void;
}



export function CalendarDayView({ 
  selectedDate,
  className,
  courts: propCourts,
  onEventClick,
  onTimeSlotClick 
}: CalendarDayViewProps) {
  const { 
    selectedDate: contextDate, 
    events,
    filteredEvents,
    filters
  } = useCalendarContext();

  const { startDrag, handleDrop } = useDndContext();
  const [draggedEvent, setDraggedEvent] = useState<IEvent | null>(null);

  const displayDate = selectedDate || contextDate;

  // Use courts from props if available, otherwise fallback to extracting from events
  const courts = useMemo(() => {
    if (propCourts && propCourts.length > 0) {
      let availableCourts = propCourts.filter(court => court.isActive !== false);
      
      // Apply court filters if any selected
      if (filters.selectedCourts.length > 0) {
        availableCourts = availableCourts.filter(court => 
          filters.selectedCourts.includes(court.id)
        );
      }
      
      return availableCourts;
    }
    
    // Fallback: Get courts from events metadata
    const courtMap = new Map();
    events.forEach(event => {
      if (event.metadata?.courtId && event.metadata?.courtName) {
        courtMap.set(event.metadata.courtId, {
          id: event.metadata.courtId,
          name: event.metadata.courtName,
          capacity: 'Artificial Grass' // Default from image
        });
      }
    });
    return Array.from(courtMap.values());
  }, [propCourts, events, filters.selectedCourts]);

  // Get filtered events for the selected date
  const dayEvents = useMemo(() => {
    return getEventsForDate(filteredEvents, displayDate);
  }, [filteredEvents, displayDate]);

  // Generate time slots (48 half-hour slots from 00:00 to 23:30)
  const timeSlots = useMemo(() => {
    return Array.from({ length: 48 }, (_, i) => {
      const hour = Math.floor(i / 2);
      const minutes = i % 2 === 0 ? '00' : '30';
      const period = hour < 12 ? 'AM' : 'PM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${period}`;
    });
  }, []);

  // Helper functions from ScheduleView
  const getSlotIndex = useCallback((time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 2 + (minutes >= 30 ? 1 : 0);
  }, []);

  const getDuration = useCallback((startTime: string, endTime: string): number => {
    const start = getSlotIndex(startTime);
    let end = getSlotIndex(endTime);
    if (end <= start) end += 48; // Handle overnight bookings
    return end - start;
  }, [getSlotIndex]);



  // Event handlers
  const handleDragStart = useCallback((event: IEvent) => {
    setDraggedEvent(event);
    const eventDate = new Date(event.startDate);
    startDrag(event, eventDate);
  }, [startDrag]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDropEvent = useCallback(async (courtId: string, slotIndex: number) => {
    if (!draggedEvent) return;

    const targetDate = new Date(displayDate);
    targetDate.setHours(Math.floor(slotIndex / 2), (slotIndex % 2) * 30, 0, 0);
    
    // Calculate end time based on original duration
    const originalStart = new Date(draggedEvent.startDate);
    const originalEnd = new Date(draggedEvent.endDate);
    const durationMs = originalEnd.getTime() - originalStart.getTime();
    const targetEndDate = new Date(targetDate.getTime() + durationMs);
    
    // Check if court changed
    const newCourtId = courtId !== draggedEvent.metadata?.courtId ? courtId : undefined;
    
    // Use custom event drop handler if provided (from TestCalendarIntegration)
    if (typeof (window as any).handleEventDrop === 'function') {
      (window as any).handleEventDrop(draggedEvent, targetDate, targetEndDate, newCourtId);
    } else {
      // Fallback to context handler
      const timeString = format(targetDate, 'HH:mm');
      handleDrop(targetDate, timeString);
    }
    
    setDraggedEvent(null);
  }, [draggedEvent, displayDate, handleDrop]);

  const handleSlotClick = useCallback((courtId: string, slotIndex: number) => {
    onTimeSlotClick?.(displayDate, courtId, slotIndex);
  }, [displayDate, onTimeSlotClick]);



  return (
    <div className={cn('flex flex-col h-full bg-white dark:bg-gray-900', className)}>
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-[80px_repeat(6,1fr)] gap-0">
          <div className="p-3 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"></div>
          {courts.map((court) => (
            <div key={court.id} className="p-3 border-r border-gray-200 dark:border-gray-700 text-center bg-gray-50 dark:bg-gray-800 last:border-r-0">
              <div className="font-semibold text-gray-900 dark:text-white text-sm">{court.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">({court.capacity})</div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="flex-1 overflow-y-auto">
        {timeSlots.map((time, slotIndex) => (
          <div key={time} className="grid grid-cols-[80px_repeat(6,1fr)] gap-0 border-b border-gray-100 dark:border-gray-800">
            {/* Time label */}
            <div className="p-2 text-xs text-gray-600 dark:text-gray-400 text-right border-r border-gray-200 dark:border-gray-700 flex items-center justify-end min-h-[32px] bg-gray-50 dark:bg-gray-800">
              {time}
            </div>
            
            {/* Court cells for this time slot */}
            {courts.map((court, courtIndex) => {
              const courtId = court.id;

              const slotEvent = dayEvents.find((event) => {
                const eventStartTime = format(new Date(event.startDate), 'HH:mm');
                const eventEndTime = format(new Date(event.endDate), 'HH:mm');
                const s = getSlotIndex(eventStartTime);
                let e = getSlotIndex(eventEndTime);
                
                if (e <= s) e += 48; // Handle overnight bookings
                
                return (
                  event.metadata?.courtId === courtId &&
                  slotIndex >= s &&
                  slotIndex < e
                );
              });

              const isEventStart = slotEvent && getSlotIndex(format(new Date(slotEvent.startDate), 'HH:mm')) === slotIndex;

              return (
                <div
                  key={`${courtId}-${slotIndex}`}
                  className={cn(
                    'relative border-r border-gray-200 dark:border-gray-700 min-h-[32px] cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors',
                    courtIndex === courts.length - 1 && 'border-r-0',
                    slotEvent && slotEvent.color === 'green' && 'bg-green-100 dark:bg-green-900/20',
                    slotEvent && slotEvent.color === 'blue' && 'bg-blue-100 dark:bg-blue-900/20',
                    slotEvent && slotEvent.color === 'red' && 'bg-red-100 dark:bg-red-900/20',
                    slotEvent && slotEvent.color === 'yellow' && 'bg-yellow-100 dark:bg-yellow-900/20',
                    slotEvent && slotEvent.color === 'purple' && 'bg-purple-100 dark:bg-purple-900/20',
                    slotEvent && slotEvent.color === 'orange' && 'bg-orange-100 dark:bg-orange-900/20',
                    slotEvent && slotEvent.color === 'pink' && 'bg-pink-100 dark:bg-pink-900/20',
                    slotEvent && slotEvent.color === 'teal' && 'bg-teal-100 dark:bg-teal-900/20'
                  )}
                  onDragOver={handleDragOver}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDropEvent(courtId, slotIndex);
                  }}
                  onClick={() => handleSlotClick(courtId, slotIndex)}
                >
                  {isEventStart && slotEvent && (
                    <div
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move';
                        handleDragStart(slotEvent);
                      }}
                      className={cn(
                        'absolute inset-x-0 rounded px-2 py-1 text-xs cursor-move shadow-sm border-l-2 overflow-hidden',
                        {
                          'bg-green-500 text-white border-green-600': slotEvent.color === 'green',
                          'bg-blue-500 text-white border-blue-600': slotEvent.color === 'blue',
                          'bg-red-500 text-white border-red-600': slotEvent.color === 'red',
                          'bg-yellow-500 text-black border-yellow-600': slotEvent.color === 'yellow',
                          'bg-purple-500 text-white border-purple-600': slotEvent.color === 'purple',
                          'bg-orange-500 text-white border-orange-600': slotEvent.color === 'orange',
                          'bg-pink-500 text-white border-pink-600': slotEvent.color === 'pink',
                          'bg-teal-500 text-white border-teal-600': slotEvent.color === 'teal',
                        }
                      )}
                      style={{ 
                        height: `${getDuration(
                          format(new Date(slotEvent.startDate), 'HH:mm'),
                          format(new Date(slotEvent.endDate), 'HH:mm')
                        ) * 32}px`,
                        zIndex: 10
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(slotEvent);
                      }}
                    >
                      <div className="font-medium truncate text-xs leading-tight">{slotEvent.title}</div>
                      <div className="text-xs opacity-75 truncate leading-tight">
                        {format(new Date(slotEvent.startDate), 'HH:mm')} - {format(new Date(slotEvent.endDate), 'HH:mm')}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}