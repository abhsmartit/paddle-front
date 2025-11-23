# Padel Club Admin Dashboard - API Integration

## Overview
This document describes the complete integration of the Padel Club API with the React frontend admin dashboard.

## API Base URL
```
http://localhost:3000
```

## Authentication
The app uses JWT authentication with automatic token refresh. Tokens are stored in localStorage:
- `admin_access_token` - JWT access token (1 hour expiry)
- `admin_refresh_token` - Refresh token
- `admin_user` - User profile data
- `admin_club_id` - Selected club ID

## Features Implemented

### 1. Authentication (Login/Logout)
- **Login**: POST `/auth/login`
  - Email: admin@padelclub.com
  - Password: Admin@123
- **Auto Token Refresh**: Automatically refreshes token before expiry
- **Logout**: Clears all tokens and redirects to login

### 2. Dashboard - Courts Display
- **Get Courts**: GET `/clubs/{clubId}/courts`
- Displays all courts with their:
  - Name
  - Surface type/Court type
  - Default price per hour
  - Active status

### 3. Dashboard - Bookings Display
- **Get Day Schedule**: GET `/clubs/{clubId}/schedule/day?date=YYYY-MM-DD`
- Shows bookings in a visual grid:
  - 30-minute time slots from 12 AM to 11:30 PM
  - Color-coded bookings (green/blue based on category)
  - Booking details: player name, time, price, status
- **Date Navigation**: Previous/Next day buttons
- **View Modes**: Day, Week, Month views

### 4. Create Booking
- **Create Booking**: POST `/clubs/{clubId}/bookings`
- Form fields:
  - Booking Name (required)
  - Phone Number (required) - with customer search
  - Duration (30, 60, 90, 120 minutes)
  - Start Time (24-hour format)
  - Start Date
  - Court Selection (required)
  - Booking Type (SINGLE, TEAM, TOURNAMENT)
  - Category (optional - loaded from API)
  - Price (auto-calculated based on court rate and duration)
  - Total Received (for payments)
  - Paid at Stadium checkbox

### 5. Booking Categories
- **Get Categories**: GET `/clubs/{clubId}/booking-categories`
- Displayed in booking modal dropdown
- Used for color-coding bookings

### 6. Customer Search
- **Search Customers**: GET `/clubs/{clubId}/customers?search={query}`
- Auto-fill booking name when customer found
- Links booking to existing customer

## Data Transformation

### Courts API → Component
```typescript
// API Response
{
  _id: "674187c2...",
  name: "Court 1",
  surfaceType: "Artificial Grass",
  defaultPricePerHour: 240,
  isActive: true
}

// Transformed for Component
{
  id: "674187c2...",
  name: "Court 1",
  capacity: "Artificial Grass",
  defaultPricePerHour: 240,
  isActive: true
}
```

### Bookings API → Component
```typescript
// API Response (from /schedule/day)
{
  courtId: "674187c2...",
  courtName: "Court 1",
  bookings: [
    {
      bookingId: "674187c3...",
      bookingName: "Ahmed Ali",
      phone: "+966501234567",
      startDateTime: "2025-11-23T10:00:00.000Z",
      endDateTime: "2025-11-23T12:00:00.000Z",
      price: 480,
      paymentStatus: "PAID",
      categoryName: "Coach Session",
      categoryColor: "#3B82F6"
    }
  ]
}

// Transformed for Component
{
  id: "674187c3...",
  courtId: "674187c2...",
  playerName: "Ahmed Ali",
  phone: "+966501234567",
  startTime: "10:00",
  endTime: "12:00",
  date: "2025-11-23",
  color: "blue",  // based on categoryColor
  status: "paid",
  price: 480,
  paymentStatus: "PAID",
  categoryName: "Coach Session"
}
```

## Component Structure

```
Dashboard.tsx (Main container)
├── AuthContext (Authentication state)
├── Sidebar (Navigation)
├── Header (Top bar with "Add Booking" button)
├── ScheduleView (Day view grid)
│   └── BookingCard (Individual booking display)
├── WeekView (Week calendar)
└── BookingModal (Create booking form)
    ├── Load categories from API
    ├── Auto-calculate prices
    └── Customer search integration
```

## Error Handling

### API Errors
- 401 Unauthorized → Auto token refresh or redirect to login
- 409 Conflict → Booking overlap error shown to user
- 400 Bad Request → Validation errors displayed in modal
- Network errors → Retry button shown

### Loading States
- Dashboard shows "Loading dashboard..." while fetching data
- BookingModal shows "Creating..." during submission
- Disabled form buttons during API calls

## Usage Flow

### 1. Login
1. User enters credentials on `/login`
2. API returns access token, refresh token, and user data
3. App fetches club ID and stores in localStorage
4. Redirects to dashboard

### 2. View Bookings
1. Dashboard loads courts from API
2. Dashboard loads day schedule for selected date
3. Bookings displayed in time-slot grid
4. Use navigation to change dates

### 3. Create Booking
1. Click "Add Booking" button
2. Modal opens with form
3. Select court → Price auto-calculates
4. Fill in required fields
5. Optional: Search customer by phone
6. Optional: Select category
7. Submit → API creates booking
8. Dashboard refreshes to show new booking

## Testing Checklist

- [x] Login with admin credentials
- [x] View courts in dashboard
- [x] View bookings for today
- [x] Navigate to previous/next day
- [x] Open booking modal
- [x] Select court and see price calculation
- [x] Create a new booking
- [x] See new booking appear in schedule
- [x] Search for existing customer
- [x] Select booking category
- [ ] Edit existing booking (TODO)
- [ ] Delete booking (TODO)
- [ ] Handle booking conflicts (TODO)
- [ ] Week view integration (TODO)
- [ ] Month view integration (TODO)

## API Service Methods

All API calls are in `src/services/api.ts`:

```typescript
// Authentication
apiService.login(email, password)
apiService.logout()
apiService.refreshToken(refreshToken)

// Clubs
apiService.getClubs()
apiService.getClub(clubId)

// Courts
apiService.getCourts(clubId)
apiService.createCourt(clubId, data)
apiService.updateCourt(courtId, data)
apiService.deleteCourt(courtId)

// Schedule
apiService.getDaySchedule(clubId, date)
apiService.getWeekSchedule(clubId, startDate)
apiService.getMonthSchedule(clubId, year, month)

// Bookings
apiService.createBooking(clubId, data)
apiService.updateBooking(clubId, bookingId, data)
apiService.deleteBooking(clubId, bookingId)
apiService.getBooking(clubId, bookingId)

// Customers
apiService.getCustomers(clubId, search?)
apiService.createCustomer(clubId, data)
apiService.updateCustomer(customerId, data)

// Categories
apiService.getBookingCategories(clubId)
apiService.createBookingCategory(clubId, data)
apiService.updateBookingCategory(categoryId, data)
apiService.deleteBookingCategory(categoryId)

// Payments
apiService.getClubPayments(clubId, startDate?, endDate?)
apiService.createPayment(clubId, data)
```

## Environment Setup

1. **Backend API**: Must be running on `http://localhost:3000`
2. **Database**: Seeded with initial data (courts, categories, sample bookings)
3. **Admin User**: admin@padelclub.com / Admin@123

## Next Steps

### High Priority
1. **Edit Booking**: Add ability to modify existing bookings
2. **Delete Booking**: Add delete/cancel booking functionality
3. **Booking Conflicts**: Prevent overlapping bookings
4. **Payment Integration**: Record payments for bookings

### Medium Priority
5. **Week View**: Integrate week schedule API
6. **Month View**: Integrate month schedule API
7. **Customer Management**: Full CRUD for customers
8. **Court Management**: Add/edit/deactivate courts

### Low Priority
9. **Reports**: Add financial and booking reports
10. **Real-time Updates**: WebSocket integration for live updates
11. **Mobile Responsive**: Optimize for mobile devices
12. **Drag & Drop**: Re-enable drag-and-drop booking moves

## Troubleshooting

### Issue: "No club selected"
- Solution: Ensure API `/clubs` endpoint returns at least one club
- Check localStorage for `admin_club_id`

### Issue: Bookings not showing
- Solution: Verify date format is YYYY-MM-DD
- Check API response structure matches expected format
- Ensure courtId in bookings matches court._id

### Issue: Price not calculating
- Solution: Ensure court has `defaultPricePerHour` set
- Check duration is parsed as integer

### Issue: 401 Unauthorized
- Solution: Clear localStorage and login again
- Check token expiry and refresh mechanism

## Contact
For API issues or questions, refer to the main API documentation or backend team.
