# Timezone Handling

## Overview
The application properly handles timezone conversion between the backend (UTC) and frontend (local timezone).

## How It Works

### Backend → Frontend (Displaying Bookings)

**API Returns (UTC):**
```json
{
  "bookingId": "6922ef09dd7afef3c408e394",
  "bookingName": "Yousef Fahad",
  "startDateTime": "2025-11-23T04:30:00.000Z",  // 4:30 AM UTC
  "endDateTime": "2025-11-23T06:30:00.000Z",    // 6:30 AM UTC
  "categoryColor": "#3B82F6"
}
```

**Frontend Displays (Local Time):**
- If you're in Saudi Arabia (UTC+3): Shows as **7:30 AM - 9:30 AM**
- If you're in New York (UTC-5): Shows as **11:30 PM - 1:30 AM**
- Automatically adjusts to user's browser timezone

### Conversion Code

```typescript
// Parse UTC datetime strings
const startDate = new Date(booking.startDateTime);
const endDate = new Date(booking.endDateTime);

// Extract time in local timezone (HH:mm format)
startTime: `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`,
endTime: `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`,

// Get booking date in local timezone
date: startDate.toLocaleDateString('en-CA') // YYYY-MM-DD format
```

### Frontend → Backend (Creating/Updating Bookings)

**User Selects (Local Time):**
- Date: 2025-11-23
- Time: 10:00 AM (local time)
- Duration: 90 minutes

**Frontend Sends (UTC):**
```json
{
  "startDateTime": "2025-11-23T07:00:00.000Z",  // Converted to UTC
  "endDateTime": "2025-11-23T08:30:00.000Z",
  "courtId": "..."
}
```

### Conversion Code (Create/Update)

```typescript
const startDateTime = new Date(startingDate);
startDateTime.setHours(hours, minutes, 0, 0); // Local timezone

// toISOString() automatically converts to UTC
startDateTime: startDateTime.toISOString()
```

## Date Filtering

The filtering logic ensures bookings are shown on the correct day in the user's local timezone:

```typescript
// Get booking date in local timezone
const bookingDateStr = startDate.toLocaleDateString('en-CA'); // YYYY-MM-DD

// Filter bookings for selected date
const filteredBookings = allBookings.filter(
  booking => booking.date === selectedDateStr
);
```

### Example Scenario

**API Returns:**
- Booking: 2025-11-23T22:00:00.000Z to 2025-11-24T00:00:00.000Z
- This is 10:00 PM UTC on Nov 23 to 12:00 AM UTC on Nov 24

**For User in UTC+3 (Saudi Arabia):**
- Displayed as: **Nov 24, 1:00 AM - 3:00 AM**
- Shows up in **Nov 24** schedule (correct!)

**For User in UTC-5 (New York):**
- Displayed as: **Nov 23, 5:00 PM - 7:00 PM**
- Shows up in **Nov 23** schedule (correct!)

## Drag & Drop Timezone Handling

When dragging a booking to a new time:

1. **User drags** to 2:00 PM local time slot
2. **Frontend calculates** new local datetime
3. **Frontend converts** to UTC using `toISOString()`
4. **Backend receives** UTC datetime
5. **Backend stores** in UTC
6. **Frontend displays** back in user's local timezone

```typescript
// Create local datetime
const startDateTime = new Date(date);
startDateTime.setHours(hours, minutes, 0, 0);

// Convert to UTC for API
startDateTime: startDateTime.toISOString()
```

## Overnight Bookings

Bookings that cross midnight are handled correctly:

**Example:**
- Start: 11:00 PM local time
- End: 1:00 AM local time (next day)

```typescript
// Handle overnight bookings
if (endDateTime <= startDateTime) {
  endDateTime.setDate(endDateTime.getDate() + 1);
}
```

## Benefits of This Approach

✅ **Automatic Timezone Detection** - Uses browser's timezone  
✅ **No Manual Configuration** - Works everywhere automatically  
✅ **Consistent Storage** - All times stored in UTC on backend  
✅ **Accurate Display** - Shows correct local time for each user  
✅ **Daylight Saving** - JavaScript handles DST automatically  
✅ **Global Support** - Works in any timezone worldwide  

## Testing Different Timezones

To test how the app behaves in different timezones:

### Chrome DevTools
1. Open DevTools (F12)
2. Press `Ctrl+Shift+P` (Command Palette)
3. Type "timezone"
4. Select "Show Sensors"
5. Change timezone in the dropdown

### Common Timezones to Test
- **Asia/Riyadh** (UTC+3) - Saudi Arabia
- **America/New_York** (UTC-5/-4) - New York
- **Europe/London** (UTC+0/+1) - London
- **Asia/Tokyo** (UTC+9) - Tokyo
- **Australia/Sydney** (UTC+10/+11) - Sydney

## Important Notes

1. **Always use JavaScript Date objects** for datetime operations
2. **Always use `toISOString()`** when sending to API
3. **Never manipulate UTC strings directly** in frontend
4. **Let JavaScript handle conversions** automatically
5. **Filter by local date** after conversion for accurate display

## Example API Response (Real Data)

```json
[
  {
    "courtId": "6922ef09dd7afef3c408e354",
    "courtName": "Court 2",
    "bookings": [
      {
        "bookingId": "6922ef09dd7afef3c408e394",
        "bookingName": "Yousef Fahad",
        "startDateTime": "2025-11-23T04:30:00.000Z",  // 4:30 AM UTC
        "endDateTime": "2025-11-23T06:30:00.000Z",    // 6:30 AM UTC
        "phone": "+966561916520"
      }
    ]
  }
]
```

**Displayed in Saudi Arabia (UTC+3):**
- Court 2: Yousef Fahad, **7:30 AM - 9:30 AM**, +966561916520

## Troubleshooting

### Bookings Not Showing
- Check browser's timezone settings
- Verify API returns UTC times with 'Z' suffix
- Check date filtering logic includes local date

### Wrong Times Displayed
- Ensure using `new Date()` constructor with ISO string
- Verify not using `toLocaleString()` without timezone
- Check for manual time parsing errors

### Booking Created at Wrong Time
- Verify using `toISOString()` before sending to API
- Check that local time is set correctly before conversion
- Test with known timezone to verify behavior

---

**Last Updated**: November 23, 2025
