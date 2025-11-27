/**
 * Agenda View Component
 * 
 * Shows events in a list format
 */

import { motion } from "framer-motion";
import { format, parseISO, isSameDay, addDays } from "date-fns";
import type { IEvent } from "../../../calendar/interfaces";
import { useCalendarContext } from "../CalendarProvider";
import { staggerContainer, transition } from "../animations";
import { cn } from "../../../../lib/utils";

interface AgendaViewProps {
  events: IEvent[];
}

export function AgendaView({ events }: AgendaViewProps) {
  // Use filtered events from context if available
  const { filteredEvents } = useCalendarContext();
  const displayEvents = filteredEvents || events;
  
  // Group events by date
  const today = new Date();
  const dates = [];
  
  // Show next 30 days
  for (let i = 0; i < 30; i++) {
    dates.push(addDays(today, i));
  }
  
  const eventsByDate = dates.map(date => ({
    date,
    events: displayEvents.filter(event => 
      isSameDay(parseISO(event.startDate), date)
    )
  }));

  return (
    <motion.div 
      className="p-4 h-full overflow-y-auto"
      initial="initial" 
      animate="animate" 
      variants={staggerContainer}
    >
      <div className="max-w-2xl mx-auto">
        {eventsByDate.map(({ date, events: dayEvents }, index) => (
          <motion.div
            key={date.toISOString()}
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, ...transition }}
          >
            {/* Date header */}
            <div className="flex items-center mb-3">
              <div className={cn(
                "text-lg font-semibold",
                isSameDay(date, today) && "text-blue-600 dark:text-blue-400"
              )}>
                {format(date, 'EEEE, MMMM d, yyyy')}
              </div>
              {isSameDay(date, today) && (
                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 rounded-full">
                  Today
                </span>
              )}
            </div>
            
            {/* Events for this date */}
            {dayEvents.length > 0 ? (
              <div className="space-y-2">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "p-3 rounded-lg border-l-4 bg-gray-50 dark:bg-gray-800",
                      {
                        'border-blue-500': event.color === 'blue',
                        'border-green-500': event.color === 'green',
                        'border-red-500': event.color === 'red',
                        'border-yellow-500': event.color === 'yellow',
                        'border-purple-500': event.color === 'purple',
                        'border-orange-500': event.color === 'orange',
                        'border-pink-500': event.color === 'pink',
                        'border-teal-500': event.color === 'teal',
                      }
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {format(parseISO(event.startDate), 'h:mm a')} - {format(parseISO(event.endDate), 'h:mm a')}
                        </div>
                        {event.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            {event.description}
                          </div>
                        )}
                      </div>
                      <div className={cn(
                        "px-2 py-1 text-xs rounded-full",
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
                      )}>
                        {event.metadata?.courtName || 'Court'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 text-sm italic">
                No events scheduled
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}