/**
 * Calendar Month View Component
 * 
 * Shows a monthly calendar grid with events
 */

import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { useCalendarContext } from "../CalendarProvider";
import { getEventsForDate } from "../helpers";
import type { IEvent } from "../../../calendar/interfaces";
import { staggerContainer, transition } from "../animations";
import { cn } from "../../../../lib/utils";

interface CalendarMonthViewProps {
  singleDayEvents: IEvent[];
  multiDayEvents: IEvent[];
}

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarMonthView(_props: CalendarMonthViewProps) {
  const { selectedDate, filteredEvents } = useCalendarContext();
  
  // Use filtered events instead of raw props
  const allEvents = filteredEvents;
  
  // Get calendar grid dates
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  return (
    <motion.div 
      className="flex flex-col h-full p-4"
      initial="initial" 
      animate="animate" 
      variants={staggerContainer}
    >
      {/* Header with day names */}
      <div className="grid grid-cols-7 mb-4">
        {WEEK_DAYS.map((day, index) => (
          <motion.div
            key={day}
            className="flex items-center justify-center py-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, ...transition }}
          >
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{day}</span>
          </motion.div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDate(allEvents, day);
          const isCurrentMonth = isSameMonth(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const hasEvents = dayEvents.length > 0;
          
          return (
            <motion.div
              key={day.toISOString()}
              className={cn(
                "flex flex-col p-2 border border-gray-200 dark:border-gray-700 rounded-lg min-h-[120px]",
                !isCurrentMonth && "opacity-50 bg-gray-50 dark:bg-gray-800",
                isToday && "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700",
                hasEvents && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01, ...transition }}
            >
              {/* Day number */}
              <div className={cn(
                "text-sm font-medium mb-2",
                isToday && "text-blue-600 dark:text-blue-400",
                !isCurrentMonth && "text-gray-400 dark:text-gray-600"
              )}>
                {format(day, 'd')}
              </div>
              
              {/* Events */}
              <div className="flex flex-col gap-1 overflow-hidden">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "text-xs px-2 py-1 rounded truncate",
                      {
                        'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100': event.color === 'blue',
                        'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100': event.color === 'green',
                        'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100': event.color === 'red',
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100': event.color === 'yellow',
                        'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100': event.color === 'purple',
                        'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100': event.color === 'orange',
                        'bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-100': event.color === 'pink',
                        'bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-100': event.color === 'teal',
                      }
                    )}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}