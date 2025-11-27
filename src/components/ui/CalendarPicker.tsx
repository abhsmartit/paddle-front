import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { enUS, ar } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export interface CalendarPickerProps {
  /**
   * The currently selected date
   */
  value: Date;
  
  /**
   * Callback when date changes
   */
  onChange: (date: Date) => void;
  
  /**
   * Optional minimum selectable date
   */
  minDate?: Date;
  
  /**
   * Optional maximum selectable date
   */
  maxDate?: Date;
  
  /**
   * Custom format string for the display button (default: 'EEEE, MMM dd')
   */
  displayFormat?: string;
  
  /**
   * Custom placeholder text when no date is selected
   */
  placeholder?: string;
  
  /**
   * Additional CSS classes for the trigger button
   */
  className?: string;
  
  /**
   * Show the calendar inline instead of as a dropdown
   */
  inline?: boolean;
  
  /**
   * Disable the date picker
   */
  disabled?: boolean;
  
  /**
   * Custom button variant
   */
  variant?: 'default' | 'outline' | 'ghost';
}

/**
 * CalendarPicker - A unified date picker component using shadcn/ui Calendar
 * 
 * Features:
 * - Integrates with existing date-fns and timezone logic
 * - Theme-aware (light/dark mode via CSS variables)
 * - i18n-aware (uses current i18next language)
 * - Dropdown or inline mode
 * - Compatible with existing date selection patterns
 * 
 * Usage:
 * ```tsx
 * <CalendarPicker
 *   value={selectedDate}
 *   onChange={(date) => onDateChange(date)}
 *   displayFormat="EEEE, MMM dd"
 * />
 * ```
 */
export const CalendarPicker = React.memo<CalendarPickerProps>(({
  value,
  onChange,
  minDate,
  maxDate,
  displayFormat = 'EEEE, MMM dd',
  placeholder = 'Select date',
  className,
  inline = false,
  disabled = false,
  variant = 'outline',
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  // Get locale from i18next
  const locale = React.useMemo(() => {
    return i18n.language === 'ar' ? ar : enUS;
  }, [i18n.language]);
  
  // Format the display text
  const displayText = React.useMemo(() => {
    if (!value) return placeholder;
    return format(value, displayFormat, { locale });
  }, [value, displayFormat, placeholder, locale]);
  
  // Handle date selection
  const handleSelect = React.useCallback((selectedDate: Date | undefined) => {
    if (selectedDate) {
      onChange(selectedDate);
      if (!inline) {
        setIsOpen(false);
      }
    }
  }, [onChange, inline]);
  
  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (!isOpen || inline) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, inline]);
  
  // Keyboard handling for accessibility
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
  }, [isOpen]);
  
  // If inline mode, just render the calendar
  if (inline) {
    return (
      <div className={cn('inline-block', className)}>
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          disabled={disabled ? () => true : (date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
          initialFocus
          locale={locale}
        />
      </div>
    );
  }
  
  // Dropdown mode
  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <Button
        variant={variant}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full justify-between font-normal',
          !value && 'text-text-muted'
        )}
        onKeyDown={handleKeyDown}
        type="button"
      >
        <span>{displayText}</span>
        <ChevronDown className={cn(
          'ml-2 h-4 w-4 transition-transform',
          isOpen && 'rotate-180'
        )} />
      </Button>
      
      {isOpen && (
        <div
          className={cn(
            'absolute top-full left-0 z-50 mt-2',
            'rounded-md border border-border-subtle',
            'bg-bg-elevated shadow-lg',
            'animate-in fade-in-0 zoom-in-95'
          )}
        >
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            disabled={disabled ? () => true : (date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            initialFocus
            locale={locale}
          />
        </div>
      )}
    </div>
  );
});

CalendarPicker.displayName = 'CalendarPicker';

/**
 * DateInput - A simpler variant for form inputs
 * Shows the calendar inline below the input
 */
export interface DateInputProps extends Omit<CalendarPickerProps, 'inline'> {
  label?: string;
  error?: string;
  required?: boolean;
}

export const DateInput = React.memo<DateInputProps>(({
  label,
  error,
  required,
  value,
  onChange,
  className,
  ...props
}) => {
  const [showCalendar, setShowCalendar] = React.useState(false);
  
  const handleSelect = React.useCallback((date: Date) => {
    onChange(date);
    setShowCalendar(false);
  }, [onChange]);
  
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium text-text-main">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        type="text"
        readOnly
        value={value ? format(value, 'yyyy-MM-dd') : ''}
        onClick={() => setShowCalendar(!showCalendar)}
        className={cn(
          'w-full px-3 py-2 rounded-md border border-border-subtle',
          'bg-background text-text-main',
          'focus:outline-none focus:ring-2 focus:ring-primary',
          'cursor-pointer',
          error && 'border-red-500'
        )}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      
      {showCalendar && (
        <div className="relative">
          <CalendarPicker
            value={value}
            onChange={handleSelect}
            inline
            {...props}
          />
        </div>
      )}
    </div>
  );
});

DateInput.displayName = 'DateInput';
