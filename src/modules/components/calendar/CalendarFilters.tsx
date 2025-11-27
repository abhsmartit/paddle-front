/**
 * Calendar Filters Component
 * 
 * Comprehensive filtering UI for calendar events
 */

import React, { useState, useCallback } from 'react';
import { useCalendarContext } from './CalendarProvider';
import { cn } from '../../../lib/utils';
import type { BookingStatusFilter, BookingTypeFilter } from './filters';

interface CalendarFiltersProps {
  className?: string;
  onClose?: () => void;
}

export function CalendarFilters({ className, onClose }: CalendarFiltersProps) {
  const { 
    filters, 
    dispatchFilter, 
    filterOptions, 
    activeFilterCount 
  } = useCalendarContext();
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    courts: true,
    status: false,
    time: false,
    people: false,
    types: false,
    search: false
  });

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const handleCourtToggle = useCallback((courtId: string) => {
    dispatchFilter({ type: 'TOGGLE_COURT', payload: courtId });
  }, [dispatchFilter]);

  const handleSelectAllCourts = useCallback(() => {
    const allCourtIds = filterOptions.courts.map(court => court.id);
    dispatchFilter({ type: 'SET_SELECTED_COURTS', payload: allCourtIds });
  }, [dispatchFilter, filterOptions.courts]);

  const handleDeselectAllCourts = useCallback(() => {
    dispatchFilter({ type: 'SET_SELECTED_COURTS', payload: [] });
  }, [dispatchFilter]);

  const handleStatusToggle = useCallback((status: BookingStatusFilter) => {
    dispatchFilter({ type: 'TOGGLE_BOOKING_STATUS', payload: status });
  }, [dispatchFilter]);

  const handleTypeToggle = useCallback((type: BookingTypeFilter) => {
    dispatchFilter({ type: 'TOGGLE_BOOKING_TYPE', payload: type });
  }, [dispatchFilter]);

  const handleTimeRangeToggle = useCallback(() => {
    dispatchFilter({ 
      type: 'SET_TIME_RANGE', 
      payload: { 
        ...filters.timeRange, 
        enabled: !filters.timeRange.enabled 
      }
    });
  }, [dispatchFilter, filters.timeRange]);

  const handleTimeRangeChange = useCallback((field: 'startTime' | 'endTime', value: string) => {
    dispatchFilter({ 
      type: 'SET_TIME_RANGE', 
      payload: { 
        ...filters.timeRange, 
        [field]: value 
      }
    });
  }, [dispatchFilter, filters.timeRange]);

  const handleSearchChange = useCallback((value: string) => {
    dispatchFilter({ type: 'SET_SEARCH_TEXT', payload: value });
  }, [dispatchFilter]);

  const handleMyBookingsToggle = useCallback(() => {
    dispatchFilter({ 
      type: 'SET_SHOW_MY_BOOKINGS_ONLY', 
      payload: !filters.showMyBookingsOnly 
    });
  }, [dispatchFilter, filters.showMyBookingsOnly]);

  const handleDateNavigationToggle = useCallback(() => {
    dispatchFilter({
      type: 'SET_DATE_NAVIGATION',
      payload: {
        ...filters.dateNavigation,
        enabled: !filters.dateNavigation.enabled
      }
    });
  }, [dispatchFilter, filters.dateNavigation]);

  const handleDateNavigationChange = useCallback((field: keyof typeof filters.dateNavigation, value: any) => {
    dispatchFilter({
      type: 'SET_DATE_NAVIGATION',
      payload: {
        ...filters.dateNavigation,
        [field]: value
      }
    });
  }, [dispatchFilter, filters.dateNavigation]);

  const handleResetFilters = useCallback(() => {
    dispatchFilter({ type: 'RESET_FILTERS' });
  }, [dispatchFilter]);

  const getStatusLabel = (status: BookingStatusFilter) => {
    const labels = {
      confirmed: 'Confirmed',
      pending: 'Pending',
      cancelled: 'Cancelled', 
      completed: 'Completed',
      'no-show': 'No Show'
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type: BookingTypeFilter) => {
    const labels = {
      regular: 'Regular',
      lesson: 'Lesson',
      tournament: 'Tournament',
      maintenance: 'Maintenance',
      blocked: 'Blocked'
    };
    return labels[type] || type;
  };

  const FilterSection = ({ 
    title, 
    section, 
    children 
  }: { 
    title: string; 
    section: string; 
    children: React.ReactNode; 
  }) => (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <button
        onClick={() => toggleSection(section)}
        className="w-full px-4 py-3 text-left font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between"
      >
        {title}
        <svg
          className={cn(
            'w-5 h-5 transition-transform',
            expandedSections[section] ? 'rotate-180' : 'rotate-0'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expandedSections[section] && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className={cn('bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg', className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Filters {activeFilterCount > 0 && (
            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Reset
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <FilterSection title="Search" section="search">
        <input
          type="text"
          placeholder="Search bookings..."
          value={filters.searchText}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        />
      </FilterSection>

      {/* Courts */}
      <FilterSection title="Courts" section="courts">
        <div className="space-y-2">
          <div className="flex gap-2 mb-3">
            <button
              onClick={handleSelectAllCourts}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAllCourts}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Deselect All
            </button>
          </div>
          {filterOptions.courts.map((court) => (
            <label key={court.id} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.selectedCourts.length === 0 || filters.selectedCourts.includes(court.id)}
                onChange={() => handleCourtToggle(court.id)}
                className="mr-2 rounded text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{court.name}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Booking Status */}
      <FilterSection title="Booking Status" section="status">
        <div className="space-y-2">
          {filterOptions.availableStatuses.map((status) => (
            <label key={status} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.bookingStatuses.includes(status)}
                onChange={() => handleStatusToggle(status)}
                className="mr-2 rounded text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{getStatusLabel(status)}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Booking Types */}
      <FilterSection title="Booking Types" section="types">
        <div className="space-y-2">
          {filterOptions.availableTypes.map((type) => (
            <label key={type} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.bookingTypes.includes(type)}
                onChange={() => handleTypeToggle(type)}
                className="mr-2 rounded text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{getTypeLabel(type)}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Time Range */}
      <FilterSection title="Time Range" section="time">
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.timeRange.enabled}
              onChange={handleTimeRangeToggle}
              className="mr-2 rounded text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Filter by time range</span>
          </label>
          
          {filters.timeRange.enabled && (
            <div className="grid grid-cols-2 gap-3 ml-6">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Start Time</label>
                <input
                  type="time"
                  value={filters.timeRange.startTime}
                  onChange={(e) => handleTimeRangeChange('startTime', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">End Time</label>
                <input
                  type="time"
                  value={filters.timeRange.endTime}
                  onChange={(e) => handleTimeRangeChange('endTime', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>
      </FilterSection>

      {/* Date Navigation Filters */}
      <FilterSection title="Date Range" section="dateRange">
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.dateNavigation.enabled}
              onChange={handleDateNavigationToggle}
              className="mr-2 rounded text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Filter by date range</span>
          </label>
          
          {filters.dateNavigation.enabled && (
            <div className="ml-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Future Days</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={filters.dateNavigation.filterFutureDays}
                    onChange={(e) => handleDateNavigationChange('filterFutureDays', parseInt(e.target.value) || 30)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Past Days</label>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={filters.dateNavigation.filterPastDays}
                    onChange={(e) => handleDateNavigationChange('filterPastDays', parseInt(e.target.value) || 7)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.dateNavigation.filterWeekends}
                    onChange={(e) => handleDateNavigationChange('filterWeekends', e.target.checked)}
                    className="mr-2 rounded text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                  <span className="text-xs text-gray-700 dark:text-gray-300">Hide weekend events</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.dateNavigation.filterHolidays}
                    onChange={(e) => handleDateNavigationChange('filterHolidays', e.target.checked)}
                    className="mr-2 rounded text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                  <span className="text-xs text-gray-700 dark:text-gray-300">Hide holiday events</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </FilterSection>

      {/* Personal Filters */}
      <FilterSection title="Personal" section="people">
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.showMyBookingsOnly}
              onChange={handleMyBookingsToggle}
              className="mr-2 rounded text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show only my bookings</span>
          </label>
        </div>
      </FilterSection>
    </div>
  );
}