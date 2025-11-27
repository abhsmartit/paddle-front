/**
 * Calendar Header Component
 * 
 * Header with navigation controls, view toggles, and actions
 */

import { motion } from "framer-motion";
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, addYears, subYears } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar, Grid, List, Plus, Filter } from "lucide-react";
import { slideFromLeft, slideFromRight, transition } from "./animations";
import { useCalendarContext } from "./CalendarProvider";
import { CalendarFilters } from "./CalendarFilters";
import type { TCalendarView } from "./types";
import { useState, useCallback } from "react";

export function CalendarHeader() {
  const { 
    currentView, 
    setCurrentView, 
    selectedDate, 
    setSelectedDate,
    events,
    activeFilterCount,
    filters,
    dispatchFilter
  } = useCalendarContext();
  
  const [showFilters, setShowFilters] = useState(false);

  const handleQuickDateFilter = useCallback((days: number, direction: 'past' | 'future') => {
    if (direction === 'future') {
      dispatchFilter({
        type: 'SET_DATE_NAVIGATION',
        payload: {
          ...filters.dateNavigation,
          enabled: true,
          filterFutureDays: days,
          filterPastDays: 0
        }
      });
    } else {
      dispatchFilter({
        type: 'SET_DATE_NAVIGATION',
        payload: {
          ...filters.dateNavigation,
          enabled: true,
          filterFutureDays: 0,
          filterPastDays: days
        }
      });
    }
  }, [filters.dateNavigation, dispatchFilter]);

  const navigatePrevious = () => {
    switch (currentView) {
      case 'day':
        setSelectedDate(subDays(selectedDate, 1));
        break;
      case 'week':
        setSelectedDate(subWeeks(selectedDate, 1));
        break;
      case 'month':
        setSelectedDate(subMonths(selectedDate, 1));
        break;
      case 'year':
        setSelectedDate(subYears(selectedDate, 1));
        break;
    }
  };

  const navigateNext = () => {
    switch (currentView) {
      case 'day':
        setSelectedDate(addDays(selectedDate, 1));
        break;
      case 'week':
        setSelectedDate(addWeeks(selectedDate, 1));
        break;
      case 'month':
        setSelectedDate(addMonths(selectedDate, 1));
        break;
      case 'year':
        setSelectedDate(addYears(selectedDate, 1));
        break;
    }
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getDateDisplayText = () => {
    switch (currentView) {
      case 'day':
        return format(selectedDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        return format(selectedDate, 'MMMM yyyy');
      case 'month':
        return format(selectedDate, 'MMMM yyyy');
      case 'year':
        return format(selectedDate, 'yyyy');
      case 'agenda':
        return 'Upcoming Events';
      default:
        return format(selectedDate, 'MMMM yyyy');
    }
  };

  const viewButtons: Array<{ value: TCalendarView; label: string; icon: any }> = [
    { value: 'day', label: 'Day', icon: Calendar },
    { value: 'week', label: 'Week', icon: Grid },
    { value: 'month', label: 'Month', icon: Grid },
    { value: 'year', label: 'Year', icon: Grid },
    { value: 'agenda', label: 'Agenda', icon: List },
  ];

  return (
    <div className="relative flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 p-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Left side - Navigation */}
      <motion.div
        className="flex items-center gap-3"
        variants={slideFromLeft}
        initial="initial"
        animate="animate"
        transition={transition}
      >
        {/* Today button */}
        <button
          onClick={goToToday}
          className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Today
        </button>

        {/* Navigation arrows */}
        <div className="flex items-center gap-1">
          <div className="relative group">
            <button
              onClick={navigatePrevious}
              onContextMenu={(e) => {
                e.preventDefault();
                handleQuickDateFilter(7, 'past');
              }}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              title="Previous (Right-click: Show past 7 days)"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {/* Quick filter indicator */}
            {filters.dateNavigation.enabled && filters.dateNavigation.filterPastDays > 0 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
          
          <div className="relative group">
            <button
              onClick={navigateNext}
              onContextMenu={(e) => {
                e.preventDefault();
                handleQuickDateFilter(7, 'future');
              }}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              title="Next (Right-click: Show next 7 days)"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            
            {/* Quick filter indicator */}
            {filters.dateNavigation.enabled && filters.dateNavigation.filterFutureDays > 0 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
        </div>

        {/* Date display */}
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {getDateDisplayText()}
          </h2>
          
          {/* Quick date filter buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleQuickDateFilter(1, 'future')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                filters.dateNavigation.enabled && filters.dateNavigation.filterFutureDays === 1
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800'
              }`}
              title="Show today only"
            >
              Today
            </button>
            
            <button
              onClick={() => handleQuickDateFilter(7, 'future')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                filters.dateNavigation.enabled && filters.dateNavigation.filterFutureDays === 7
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800'
              }`}
              title="Show next 7 days"
            >
              7D
            </button>
            
            <button
              onClick={() => handleQuickDateFilter(30, 'future')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                filters.dateNavigation.enabled && filters.dateNavigation.filterFutureDays === 30
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800'
              }`}
              title="Show next 30 days"
            >
              30D
            </button>
          </div>
        </div>
      </motion.div>

      {/* Right side - Views and actions */}
      <motion.div
        className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-2"
        variants={slideFromRight}
        initial="initial"
        animate="animate"
        transition={transition}
      >
        {/* View toggles */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {viewButtons.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setCurrentView(value)}
              className={`
                flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${currentView === value 
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Filter button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors relative
            ${showFilters 
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }
          `}
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Event count */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {events.length} event{events.length !== 1 ? 's' : ''}
        </div>
      </motion.div>
      
      {/* Filter Panel */}
      {showFilters && (
        <div className="absolute top-full right-0 mt-2 w-80 z-50">
          <CalendarFilters onClose={() => setShowFilters(false)} />
        </div>
      )}
    </div>
  );
}