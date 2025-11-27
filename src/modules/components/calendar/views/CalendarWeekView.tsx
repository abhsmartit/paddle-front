/**
 * Calendar Week View Component
 * 
 * Shows a weekly view of calendar events
 */

import { motion } from "framer-motion";
import { format, startOfWeek, addDays } from "date-fns";
import { useCalendarContext } from "../CalendarProvider";
import { CalendarDayView } from "../CalendarDayView";
import type { IEvent } from "../../../calendar/interfaces";
import { staggerContainer, transition } from "../animations";

interface CalendarWeekViewProps {
  singleDayEvents: IEvent[];
  multiDayEvents: IEvent[];
}

export function CalendarWeekView(_props: CalendarWeekViewProps) {
  const { selectedDate, filteredEvents } = useCalendarContext();
  
  const weekStart = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <motion.div 
      className="flex flex-col h-full"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Week header */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {weekDays.map((day, index) => (
          <motion.div
            key={day.toISOString()}
            className="flex-1 p-4 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, ...transition }}
          >
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {format(day, 'EEE')}
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {format(day, 'd')}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Week content */}
      <div className="flex flex-1 overflow-hidden">
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="flex-1 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
            <CalendarDayView
              selectedDate={day}
              className="h-full"
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}