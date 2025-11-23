// types.ts

export type ViewMode = 'month' | 'week' | 'day';

export interface Court {
  id: string;
  name: string;
  capacity: string | number;
}

export interface Booking {
  id: string;
  playerName: string;
  startTime: string; // "13:00"
  endTime: string;   // "14:30"
  courtId: string;
  date: string;      // "2025-11-25"
  color?: string;

  // ✅ NEW: optional price field
  price?: number;
}
