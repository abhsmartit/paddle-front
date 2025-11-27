/**
 * Calendar Types
 * Additional types for calendar functionality
 */

export type TCalendarView = "day" | "week" | "month" | "year" | "agenda";

export type TEventColor =
  | "blue"
  | "green"
  | "red"
  | "yellow"
  | "purple"
  | "orange"
  | "pink"
  | "teal";

export interface ITimeSlot {
  hour: number;
  minute: number;
}

export interface IGroupedEvents {
  [key: string]: import('./interfaces').IEvent[];
}