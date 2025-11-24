# Booking Tabs Integration - Implementation Summary

## Overview
Successfully integrated Fixed Bookings and Coach Bookings tabs into the main BookingModal component with full API integration.

## Changes Made

### 1. BookingModal Component (`src/components/BookingModal.tsx`)
- **Tab Navigation**: The modal now supports 4 tabs:
  - Single Bookings (default)
  - Fixed Bookings
  - Coach Bookings
  - Close Stadium (placeholder)

- **Dynamic Form Fields**: The form adapts based on the selected tab:
  - **Common fields** (all tabs): Booking Name, Phone Number, Duration, Starting Time, Starting Date, Court Selection, Booking Price, Total Received, Paid at Stadium
  
  - **Fixed Booking specific**:
    - End Date (required)
    - Repeated Day (Sunday-Saturday)
    - Payment Method (Cash/Card/Bank Transfer)
    - Additional Notes
  
  - **Coach Booking specific**:
    - Coach Selection (required)
    - Additional Notes

- **Smart Validation**: Tab-specific validation ensures all required fields are filled based on booking type

### 2. API Service (`src/services/api.ts`)
Added new endpoints:

```typescript
// Fixed booking creation
createFixedBooking: async (clubId: string, data: any)

// Coach booking creation
createCoachBooking: async (clubId: string, data: any)

// Coach management
getCoaches: async (clubId: string)
createCoach: async (clubId: string, data: any)
updateCoach: async (coachId: string, data: any)
```

### 3. TypeScript Types (`src/types/index.ts`)
Added new interfaces:

```typescript
// For fixed bookings
interface CreateFixedBookingRequest {
  courtId: string;
  customerId?: string;
  bookingName: string;
  phone: string;
  bookingType: 'SINGLE' | 'TEAM' | 'TOURNAMENT';
  startTime: string;
  duration: number;
  startDate: string;
  endDate: string;
  repeatedDay: string;
  price: number;
  paymentMethod: string;
  bookingCategoryId?: string;
  notes?: string;
}

// For coach bookings
interface CreateCoachBookingRequest {
  courtId: string;
  coachId: string;
  customerId?: string;
  bookingName: string;
  phone: string;
  startDateTime: string;
  endDateTime: string;
  price: number;
  bookingCategoryId?: string;
  notes?: string;
}

// Coach entity
interface Coach {
  _id: string;
  clubId: string;
  name: string;
  phone?: string;
  email?: string;
  specialization?: string;
  isActive: boolean;
}
```

## API Endpoints Expected

Your backend should implement these endpoints:

### Single & Coach Bookings (Same Endpoint)
```
POST /clubs/:clubId/bookings
```

**Request Body for Single Booking:**
```json
{
  "courtId": "673e1234567890abcdef1111",
  "customerId": "string (optional)",
  "bookingName": "Ahmed Al-Rashid",
  "phone": "+966501234567",
  "bookingType": "SINGLE",
  "startDateTime": "2025-11-25T14:00:00.000Z",
  "endDateTime": "2025-11-25T16:00:00.000Z",
  "price": 200,
  "bookingCategoryId": "string (optional)",
  "notes": "string (optional)"
}
```

**Request Body for Coach Booking:**
```json
{
  "courtId": "673e1234567890abcdef1111",
  "coachId": "673e1234567890abcdef2222",
  "customerId": "string (optional)",
  "bookingName": "Ahmed Al-Rashid",
  "phone": "+966501234567",
  "bookingType": "COACH",
  "startDateTime": "2025-11-25T14:00:00.000Z",
  "endDateTime": "2025-11-25T16:00:00.000Z",
  "price": 200,
  "bookingCategoryId": "string (optional)",
  "notes": "Private coaching session"
}
```

### Fixed Bookings
```
POST /clubs/:clubId/bookings/fixed
```

**Request Body:**
```json
{
  "courtId": "string",
  "customerId": "string (optional)",
  "bookingName": "string",
  "phone": "string",
  "bookingType": "SINGLE|TEAM|TOURNAMENT",
  "startTime": "HH:mm",
  "duration": 60,
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "repeatedDay": "Monday|Tuesday|...",
  "price": 200,
  "paymentMethod": "Cash|Card|Bank Transfer",
  "bookingCategoryId": "string (optional)",
  "notes": "string (optional)"
}
```

### Coach Management
```
GET    /clubs/:clubId/coaches
POST   /clubs/:clubId/coaches
PATCH  /coaches/:coachId
```

## How It Works

### User Flow:

1. **User clicks "Add Booking"** on the dashboard
2. **BookingModal opens** with Single Bookings tab active by default
3. **User can switch tabs** to Fixed Bookings or Coach Bookings
4. **Form fields adjust dynamically** based on selected tab
5. **On Submit:**
   - Form validates based on tab-specific requirements
   - Appropriate API endpoint is called (single/fixed/coach)
   - On success, modal closes and schedule refreshes
   - On error, error message is displayed

### State Management:

The component uses React state to manage:
- Active tab selection
- All form field values
- Loading and error states
- Coaches list (loaded when Coach tab is selected)
- Categories and customers (loaded on modal open)

### API Integration:

```typescript
// Single Booking
await apiService.createBooking(clubId, {
  courtId,
  bookingName,
  phone,
  bookingType: 'SINGLE',
  startDateTime,
  endDateTime,
  price
});

// Coach Booking (uses same endpoint with coachId and COACH type)
await apiService.createBooking(clubId, {
  courtId,
  coachId,
  bookingName,
  phone,
  bookingType: 'COACH',
  startDateTime,
  endDateTime,
  price,
  notes
});

// Fixed Booking (separate endpoint)
await apiService.createFixedBooking(clubId, {
  courtId,
  bookingName,
  phone,
  bookingType: 'SINGLE',
  startTime,
  duration,
  startDate,
  endDate,
  repeatedDay,
  price,
  paymentMethod
});
```

## Testing Checklist

- [ ] Single booking creation works
- [ ] Fixed booking form shows correct fields (End Date, Repeated Day, Payment Method)
- [ ] Coach booking form shows correct fields (Coach selection)
- [ ] Tab switching preserves common field values
- [ ] Validation works for each booking type
- [ ] Coaches are loaded when Coach Bookings tab is selected
- [ ] All bookings appear in the schedule after creation
- [ ] Error messages display correctly
- [ ] Loading state shows during API calls

## Next Steps

1. **Backend Implementation**: Ensure your backend has the required endpoints
2. **Testing**: Test with actual backend to verify data flow
3. **Error Handling**: Add more specific error messages if needed
4. **Close Stadium Tab**: Implement if required
5. **Payment Integration**: Implement payment recording when totalReceived is provided

## Notes

- The old `FixedBookingModal.tsx` and `CoachBookingModal.tsx` files are now redundant but kept for reference
- All booking types now go through a single, unified modal interface
- The modal automatically refreshes the schedule after successful booking creation
- Form fields are reset after successful submission
