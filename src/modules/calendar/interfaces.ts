/**
 * Calendar Module Interfaces
 * 
 * These types define the data structures used by the Full Calendar module.
 * They are separate from the Padel booking types to maintain clean separation.
 */

export interface IUser {
  id: string;
  name: string;
  picturePath: string | null;
}

export type TEventColor =
  | "blue"
  | "green"
  | "red"
  | "yellow"
  | "purple"
  | "orange"
  | "pink"
  | "teal";

export interface IEvent {
  id: number;
  startDate: string; // ISO 8601
  endDate: string;   // ISO 8601
  title: string;
  color: TEventColor;
  description: string;
  user: IUser;
  
  // Extended properties for Padel-specific data
  metadata?: {
    bookingId: string;
    courtId: string;
    courtName: string;
    bookingType: string;
    paymentStatus?: string;
    categoryName?: string;
    phone?: string;
    price?: number;
    isClosedDate?: boolean; // Special flag for stadium closures
  };
}

export type TView = "day" | "week" | "month" | "year" | "agenda";

export interface ICalendarSettings {
  view: TView;
  selectedDate: Date;
  filteredUserIds: string[];
}
