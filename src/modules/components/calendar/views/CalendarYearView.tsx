/**
 * Calendar Year View Component
 * 
 * Shows a yearly overview with 12 month grids
 */

import { motion } from "framer-motion";
import { getYear, startOfMonth } from "date-fns";
import { useCalendarContext } from "../CalendarProvider";
import { getEventsForDate } from "../helpers";
import type { IEvent } from "../../../calendar/interfaces";
import { staggerContainer, transition } from "../animations";

interface CalendarYearViewProps {
  singleDayEvents: IEvent[];
  multiDayEvents: IEvent[];
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function CalendarYearView(_props: CalendarYearViewProps) {
  const { selectedDate, setSelectedDate, filteredEvents } = useCalendarContext();
  const currentYear = getYear(selectedDate);
  const allEvents = filteredEvents;

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4">
      {/* Year header */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{currentYear}</h2>
      </motion.div>

      {/* Year grid */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      >
        {MONTHS.map((month, monthIndex) => {
          const monthDate = new Date(currentYear, monthIndex, 1);
          
          return (
            <motion.div
              key={month}
              className="flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: monthIndex * 0.05, ...transition }}
            >
              {/* Month header */}
              <div
                className="px-3 py-2 text-center font-semibold text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setSelectedDate(startOfMonth(monthDate))}
              >
                <span className="text-gray-900 dark:text-white">{month}</span>
              </div>

              {/* Simple month indicator */}
              <div className="p-3">
                <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  {getEventsForDate(allEvents, monthDate).length > 0 ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                      {allEvents.filter(event => 
                        new Date(event.startDate).getMonth() === monthIndex &&
                        new Date(event.startDate).getFullYear() === currentYear
                      ).length} events
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">No events</span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}