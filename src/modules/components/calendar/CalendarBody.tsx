/**
 * Calendar Body Component
 * 
 * Main calendar view router that renders different calendar views
 * based on the current view mode (day, week, month, year, agenda)
 */

import { isSameDay, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { fadeIn, transition } from "./animations";
import { useCalendarContext } from "./CalendarProvider";
import { CalendarDayView } from "./CalendarDayView";
import { CalendarWeekView } from "./views/CalendarWeekView";
import { CalendarMonthView } from "./views/CalendarMonthView";
import { CalendarYearView } from "./views/CalendarYearView";
import { AgendaView } from "./views/AgendaView";

export function CalendarBody() {
  const { currentView, events, courts } = useCalendarContext();

  const singleDayEvents = events.filter((event) => {
    const startDate = parseISO(event.startDate);
    const endDate = parseISO(event.endDate);
    return isSameDay(startDate, endDate);
  });

  const multiDayEvents = events.filter((event) => {
    const startDate = parseISO(event.startDate);
    const endDate = parseISO(event.endDate);
    return !isSameDay(startDate, endDate);
  });

  return (
    <div className="w-full h-full overflow-scroll relative">
      <motion.div
        key={currentView}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={fadeIn}
        transition={transition}
      >
        {currentView === "month" && (
          <CalendarMonthView
            singleDayEvents={singleDayEvents}
            multiDayEvents={multiDayEvents}
          />
        )}
        {currentView === "week" && (
          <CalendarWeekView
            singleDayEvents={singleDayEvents}
            multiDayEvents={multiDayEvents}
          />
        )}
        {currentView === "day" && (
          <CalendarDayView className="h-full" courts={courts} />
        )}
        {currentView === "year" && (
          <CalendarYearView
            singleDayEvents={singleDayEvents}
            multiDayEvents={multiDayEvents}
          />
        )}
        {currentView === "agenda" && (
          <motion.div
            key="agenda"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeIn}
            transition={transition}
          >
            <AgendaView events={events} />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}