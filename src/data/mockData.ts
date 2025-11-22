import type { Booking, Court } from '../types';

export const courts: Court[] = [
  { id: 'court1', name: 'Court 1', capacity: '2×2' },
  { id: 'court2', name: 'Court 2', capacity: '2×2' },
  { id: 'court3', name: 'Court 3', capacity: '2×2' },
  { id: 'court4', name: 'Court 4', capacity: '2×2' },
  { id: 'court5', name: 'Court 5', capacity: '2×2' },
  { id: 'court6', name: 'Court 6', capacity: '2×2' },
];

export const bookings: Booking[] = [
  {
    id: '1',
    courtId: 'court1',
    playerName: 'Aziz Alotaibi',
    startTime: '14:00',
    endTime: '15:30',
    date: '2025-11-21',
    color: 'green',
    status: '360 SAR'
  },
  {
    id: '2',
    courtId: 'court1',
    playerName: 'dani alsumiri',
    startTime: '15:30',
    endTime: '17:00',
    date: '2025-11-21',
    color: 'green',
    status: '360 SAR'
  },
  {
    id: '3',
    courtId: 'court2',
    playerName: 'abdullah alaraj',
    startTime: '16:00',
    endTime: '17:00',
    date: '2025-11-21',
    color: 'green',
    status: '240 SAR'
  },
  {
    id: '4',
    courtId: 'court1',
    playerName: 'Abdulaziz Al Habi',
    startTime: '17:00',
    endTime: '19:00',
    date: '2025-11-21',
    color: 'green',
    status: '480 SAR'
  },
  {
    id: '5',
    courtId: 'court2',
    playerName: 'Faisal Saleh',
    startTime: '17:30',
    endTime: '19:00',
    date: '2025-11-21',
    color: 'green',
    status: '360 SAR'
  },
  {
    id: '6',
    courtId: 'court3',
    playerName: 'Ahmed Samir',
    startTime: '13:00',
    endTime: '14:00',
    date: '2025-11-21',
    color: 'green',
    status: '240 SAR'
  },
  {
    id: '7',
    courtId: 'court6',
    playerName: 'Hadi',
    startTime: '15:00',
    endTime: '17:00',
    date: '2025-11-21',
    color: 'blue',
    status: '480 SAR'
  },
  {
    id: '8',
    courtId: 'court4',
    playerName: 'Sara Ahmed',
    startTime: '10:00',
    endTime: '11:30',
    date: '2025-11-21',
    color: 'green',
    status: '360 SAR'
  },
  {
    id: '9',
    courtId: 'court5',
    playerName: 'Mohammed Ali',
    startTime: '12:00',
    endTime: '13:00',
    date: '2025-11-21',
    color: 'blue',
    status: '240 SAR'
  },
  {
    id: '10',
    courtId: 'court3',
    playerName: 'Late Night Session',
    startTime: '23:00',
    endTime: '01:00',
    date: '2025-11-21',
    color: 'blue',
    status: '480 SAR'
  },
  {
    id: '11',
    courtId: 'court2',
    playerName: 'Omar Hassan',
    startTime: '09:00',
    endTime: '10:30',
    date: '2025-11-22',
    color: 'green',
    status: '360 SAR'
  },
  {
    id: '12',
    courtId: 'court4',
    playerName: 'Midnight Match',
    startTime: '23:00',
    endTime: '02:00',
    date: '2025-11-21',
    color: 'blue',
    status: '720 SAR'
  },
  // Next day continuation of booking 12
  {
    id: '12-continued',
    courtId: 'court4',
    playerName: 'Midnight Match',
    startTime: '00:00',
    endTime: '02:00',
    date: '2025-11-22',
    color: 'blue',
    status: '720 SAR'
  },
  // Week bookings for Nov 22-24
  {
    id: '13',
    courtId: 'court1',
    playerName: 'Ali Mohammed',
    startTime: '14:00',
    endTime: '15:30',
    date: '2025-11-22',
    color: 'green',
    status: '360 SAR'
  },
  {
    id: '14',
    courtId: 'court3',
    playerName: 'Khalid Ahmed',
    startTime: '16:00',
    endTime: '17:00',
    date: '2025-11-22',
    color: 'blue',
    status: '240 SAR'
  },
  {
    id: '15',
    courtId: 'court5',
    playerName: 'Nasser Ibrahim',
    startTime: '18:00',
    endTime: '19:30',
    date: '2025-11-22',
    color: 'green',
    status: '360 SAR'
  },
  {
    id: '16',
    courtId: 'court2',
    playerName: 'Yousef Fahad',
    startTime: '10:00',
    endTime: '12:00',
    date: '2025-11-23',
    color: 'blue',
    status: '480 SAR'
  },
  {
    id: '17',
    courtId: 'court4',
    playerName: 'Faisal Hamad',
    startTime: '13:00',
    endTime: '14:00',
    date: '2025-11-23',
    color: 'green',
    status: '240 SAR'
  },
  {
    id: '18',
    courtId: 'court6',
    playerName: 'Saud Majed',
    startTime: '15:30',
    endTime: '17:00',
    date: '2025-11-23',
    color: 'blue',
    status: '360 SAR'
  },
  {
    id: '19',
    courtId: 'court1',
    playerName: 'Turki Saad',
    startTime: '11:00',
    endTime: '12:30',
    date: '2025-11-24',
    color: 'green',
    status: '360 SAR'
  },
  {
    id: '20',
    courtId: 'court3',
    playerName: 'Bandar Fawaz',
    startTime: '14:00',
    endTime: '16:00',
    date: '2025-11-24',
    color: 'blue',
    status: '480 SAR'
  },
  {
    id: '21',
    courtId: 'court5',
    playerName: 'Rakan Saleh',
    startTime: '17:00',
    endTime: '18:00',
    date: '2025-11-24',
    color: 'green',
    status: '240 SAR'
  },
  // Next week bookings for Nov 25-27
  {
    id: '22',
    courtId: 'court2',
    playerName: 'Majed Zaid',
    startTime: '09:00',
    endTime: '10:30',
    date: '2025-11-25',
    color: 'blue',
    status: '360 SAR'
  },
  {
    id: '23',
    courtId: 'court4',
    playerName: 'Sultan Nayef',
    startTime: '12:00',
    endTime: '13:30',
    date: '2025-11-25',
    color: 'green',
    status: '360 SAR'
  },
  {
    id: '24',
    courtId: 'court1',
    playerName: 'Waleed Rashid',
    startTime: '16:00',
    endTime: '17:00',
    date: '2025-11-26',
    color: 'blue',
    status: '240 SAR'
  },
  {
    id: '25',
    courtId: 'court6',
    playerName: 'Nawaf Talal',
    startTime: '19:00',
    endTime: '20:30',
    date: '2025-11-26',
    color: 'green',
    status: '360 SAR'
  },
  {
    id: '26',
    courtId: 'court3',
    playerName: 'Abdulrahman Said',
    startTime: '10:00',
    endTime: '11:00',
    date: '2025-11-27',
    color: 'blue',
    status: '240 SAR'
  },
  {
    id: '27',
    courtId: 'court5',
    playerName: 'Fahad Mubarak',
    startTime: '13:00',
    endTime: '15:00',
    date: '2025-11-27',
    color: 'green',
    status: '480 SAR'
  },
  {
    id: '28',
    courtId: 'court2',
    playerName: 'Late Night Championship',
    startTime: '23:30',
    endTime: '03:00',
    date: '2025-11-22',
    color: 'blue',
    status: '840 SAR'
  },
  // Next day continuation of booking 28
  {
    id: '28-continued',
    courtId: 'court2',
    playerName: 'Late Night Championship',
    startTime: '00:00',
    endTime: '03:00',
    date: '2025-11-23',
    color: 'blue',
    status: '840 SAR'
  }
];

export const timeSlots = [
  '1:00 PM',
  '1:30 PM',
  '2:00 PM',
  '2:30 PM',
  '3:00 PM',
  '3:30 PM',
  '4:00 PM',
  '4:30 PM',
  '5:00 PM',
  '5:30 PM',
  '6:00 PM',
  '6:30 PM',
];
