export interface Court {
  id: string;
  name: string;
  capacity: string;
}

export interface Booking {
  id: string;
  courtId: string;
  playerName: string;
  startTime: string;
  endTime: string;
  date: string; // Format: YYYY-MM-DD
  color: 'green' | 'blue';
  status?: string;
}

export type ViewMode = 'day' | 'week' | 'month';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
}
