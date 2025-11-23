# Padel Club Admin Dashboard - Quick Start Guide

## Prerequisites
- Node.js installed
- Backend API running on `http://localhost:3000`
- Database seeded with initial data

## Setup Instructions

### 1. Install Dependencies
```powershell
cd c:\paddle-front-end\paddleFront_End
npm install
```

### 2. Start Development Server
```powershell
npm start
# or
npm run dev
```

The app will open at `http://localhost:5173` (or similar Vite port)

### 3. Login
Use the admin credentials:
- **Email**: admin@padelclub.com
- **Password**: Admin@123

## Quick Test Scenarios

### Test 1: View Today's Bookings
1. Login with admin credentials
2. Dashboard shows today's date by default
3. You should see courts listed horizontally
4. Bookings displayed in time slots (colored green or blue)
5. Navigate using "Previous" / "Next" buttons

### Test 2: Create a New Booking
1. Click "Add Booking" button in top-right
2. Fill in the form:
   - **Booking Name**: "Test Customer"
   - **Phone**: "+966501234567"
   - **Duration**: 60 minutes
   - **Start Time**: Select any available time (e.g., 14:00)
   - **Date**: Today's date (auto-filled)
   - **Court**: Select any court
   - **Booking Type**: Single
   - **Price**: Auto-calculated (e.g., 240 SAR)
3. Click "Add Booking"
4. Modal closes and dashboard refreshes
5. New booking appears in the schedule

### Test 3: Search Existing Customer
1. Click "Add Booking"
2. Enter phone number: "+966587654321" (existing customer)
3. Click search icon (🔍)
4. Name auto-fills if customer exists
5. Complete the booking

### Test 4: Navigate Dates
1. Click "Previous" to go to yesterday
2. Click "Next" to return to today
3. Click on the date display to open calendar picker
4. Select any date from the calendar
5. Schedule updates to show that date's bookings

## Common Scenarios

### Scenario: No Bookings Showing
**Check:**
- Is the API running? (`http://localhost:3000`)
- Are you logged in?
- Does the selected date have any bookings?
- Check browser console for errors

**Fix:**
- Restart the API server
- Clear localStorage and login again
- Try navigating to Nov 23-27, 2025 (seeded dates)

### Scenario: "No club selected" Error
**Check:**
- API `/clubs` endpoint returns data
- localStorage has `admin_club_id`

**Fix:**
```javascript
// Open browser console and run:
localStorage.clear();
// Then login again
```

### Scenario: Courts Not Displaying
**Check:**
- API `/clubs/{clubId}/courts` returns courts
- Club has at least one court

**Fix:**
- Check backend database has courts
- Run seeder script on backend if needed

### Scenario: Booking Creation Fails
**Check:**
- All required fields are filled
- Phone number format is correct
- Selected time slot is available
- Price is valid number

**Fix:**
- Check browser console for API error details
- Verify court ID is valid
- Ensure no booking overlap

## API Endpoints Being Used

### On Login
```
POST /auth/login
GET /clubs
```

### On Dashboard Load
```
GET /clubs/{clubId}/courts
GET /clubs/{clubId}/schedule/day?date=YYYY-MM-DD
```

### On Create Booking
```
GET /clubs/{clubId}/booking-categories
POST /clubs/{clubId}/bookings
```

### On Customer Search
```
GET /clubs/{clubId}/customers?search={query}
```

## Development Tips

### View API Requests
Open browser DevTools → Network tab to see all API calls

### Debug Auth Issues
```javascript
// Check tokens in browser console
console.log(localStorage.getItem('admin_access_token'));
console.log(localStorage.getItem('admin_club_id'));
```

### Force Logout
```javascript
localStorage.clear();
window.location.href = '/login';
```

### Test Different Dates
Use the seeded booking dates for testing:
- Nov 21, 2025
- Nov 22, 2025
- Nov 23, 2025 ← Has multiple bookings
- Nov 24, 2025
- Nov 25, 2025
- Nov 26, 2025
- Nov 27, 2025

## Next Features to Implement

1. **Edit Booking** - Click on booking card to edit
2. **Delete Booking** - Add delete button in booking card
3. **Booking Conflicts** - Visual indicator for overlaps
4. **Payment Status** - Better visual indicators
5. **Week/Month Views** - Full integration
6. **Customer Management** - CRUD operations
7. **Reports** - Financial and usage reports

## Troubleshooting Commands

### Clear all data and start fresh
```powershell
# In browser console
localStorage.clear();
```

### Check if API is running
```powershell
curl http://localhost:3000/clubs
# Should return 401 (needs auth) or club data
```

### Rebuild the app
```powershell
npm run build
```

### Check for TypeScript errors
```powershell
npx tsc --noEmit
```

## Support

For issues:
1. Check browser console for errors
2. Check Network tab for failed API calls
3. Verify API is running and accessible
4. Clear localStorage and try again
5. Restart development server

## File Structure Reference

```
src/
├── components/
│   ├── BookingModal.tsx        # Create booking form
│   ├── ScheduleView.tsx        # Day view grid
│   ├── BookingCard.tsx         # Individual booking
│   ├── Header.tsx              # Top bar
│   └── Sidebar.tsx             # Left navigation
├── contexts/
│   └── AuthContext.tsx         # Authentication state
├── pages/
│   ├── Dashboard.tsx           # Main dashboard
│   └── Login.tsx               # Login page
├── services/
│   └── api.ts                  # All API calls
└── types/
    └── index.ts                # TypeScript types
```

Happy coding! 🎾
