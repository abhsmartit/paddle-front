# Drag & Drop Booking Feature

## Overview
The booking schedule now supports drag-and-drop functionality to move bookings between courts and time slots. This uses the backend API endpoint `/clubs/:clubId/bookings/:id/drag-drop`.

## How It Works

### User Experience
1. **Grab a booking**: Click and hold on any booking card in the schedule
2. **Drag**: Move the booking to a different time slot or court
3. **Drop**: Release to update the booking
4. **Auto-save**: The change is immediately saved to the backend
5. **Auto-refresh**: The schedule refreshes to show the updated booking

### Technical Implementation

#### API Integration
- **Endpoint**: `PUT /clubs/:clubId/bookings/:id/drag-drop`
- **Request Body**:
  ```json
  {
    "startDateTime": "2024-11-23T14:00:00.000Z",
    "endDateTime": "2024-11-23T15:30:00.000Z",
    "courtId": "674187c2e4b..."
  }
  ```

#### Component Flow
```
User drags booking
    ↓
handleDragStart (captures booking data)
    ↓
handleDragOver (allows drop)
    ↓
handleDrop (on target cell)
    ↓
Dashboard.handleBookingDragDrop
    ↓
apiService.dragDropBooking (API call)
    ↓
loadData() (refresh schedule)
```

### Code Structure

#### ScheduleView Component
```typescript
// State
const [draggedBooking, setDraggedBooking] = useState<Booking | null>(null);

// Handlers
const handleDragStart = (booking: Booking) => {
  setDraggedBooking(booking);
};

const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault(); // Allow drop
};

const handleDrop = async (courtId: string, slotIndex: number) => {
  // Calculate new times
  const newStartTime = getTimeFromSlot(slotIndex);
  const newEndTime = getTimeFromSlot(slotIndex + duration);
  
  // Call parent handler
  await onBookingDragDrop(
    draggedBooking.id,
    courtId,
    newStartTime,
    newEndTime,
    currentDateStr
  );
};
```

#### Dashboard Component
```typescript
const handleBookingDragDrop = async (
  bookingId: string,
  newCourtId: string,
  newStartTime: string,
  newEndTime: string,
  date: string
) => {
  // Parse times to ISO format
  const startDateTime = new Date(date);
  startDateTime.setHours(startHours, startMinutes, 0, 0);
  
  const endDateTime = new Date(date);
  endDateTime.setHours(endHours, endMinutes, 0, 0);
  
  // Handle overnight bookings
  if (endDateTime <= startDateTime) {
    endDateTime.setDate(endDateTime.getDate() + 1);
  }

  // Call API
  await apiService.dragDropBooking(clubId, bookingId, {
    startDateTime: startDateTime.toISOString(),
    endDateTime: endDateTime.toISOString(),
    courtId: newCourtId
  });
  
  // Refresh
  await loadData();
};
```

#### API Service
```typescript
dragDropBooking: async (clubId: string, bookingId: string, data: any) => {
  const response = await api.put(
    `/clubs/${clubId}/bookings/${bookingId}/drag-drop`, 
    data
  );
  return response.data;
}
```

## Features

### ✅ Supported Operations
- Move booking to different time slot on same court
- Move booking to different court at same time
- Move booking to different court AND different time
- Maintains booking duration during move
- Handles overnight bookings (e.g., 11:30 PM to 2:00 AM)

### 🔒 Backend Validations
The API validates:
- Court availability at new time
- Coach availability (if booking has a coach)
- No overlapping bookings
- Valid time ranges

### 🎯 Visual Feedback
- Cursor changes to "grab" when hovering over booking
- Booking becomes semi-transparent during drag
- Drop target highlights on hover
- Smooth animation on successful drop
- Error message if drop fails

## Usage Examples

### Example 1: Move to Later Time (Same Court)
```
Original: Court 1, 10:00 AM - 11:30 AM
Drag to: Court 1, 2:00 PM slot
Result: Court 1, 2:00 PM - 3:30 PM (duration preserved)
```

### Example 2: Move to Different Court
```
Original: Court 1, 10:00 AM - 11:30 AM
Drag to: Court 3, 10:00 AM slot
Result: Court 3, 10:00 AM - 11:30 AM
```

### Example 3: Move to Different Court AND Time
```
Original: Court 1, 10:00 AM - 11:30 AM
Drag to: Court 2, 4:00 PM slot
Result: Court 2, 4:00 PM - 5:30 PM
```

## Error Handling

### Booking Conflict
If the new time slot overlaps with an existing booking:
- API returns 409 Conflict error
- Schedule reverts to original state
- Error message displayed to user

### Invalid Court
If the target court is invalid or inactive:
- API returns 400 Bad Request
- Schedule reverts to original state

### Network Error
If API call fails:
- Schedule automatically reverts
- Error message displayed
- User can retry the operation

## Time Slot Calculation

### Slot System
- Each hour is divided into 2 slots (30 minutes each)
- Slot index calculation: `hours * 2 + (minutes >= 30 ? 1 : 0)`
- Example: 2:30 PM = 14 * 2 + 1 = slot 29

### Duration Preservation
```typescript
// Original booking: 10:00 AM - 11:30 AM (3 slots)
const duration = getDuration('10:00', '11:30'); // = 3

// Drop at 2:00 PM (slot 28)
const newStartTime = getTimeFromSlot(28); // '14:00'
const newEndTime = getTimeFromSlot(28 + 3); // '15:30'
```

## Known Limitations

1. **Single Day Only**: Can't drag bookings across different dates
2. **No Visual Preview**: Doesn't show preview while dragging
3. **No Undo**: Changes are immediate (no undo functionality)
4. **Touch Devices**: May not work well on mobile/tablet (needs testing)

## Future Enhancements

### Planned Features
- [ ] Visual preview while dragging (ghost booking)
- [ ] Conflict warning before drop
- [ ] Undo last move action
- [ ] Drag across multiple days (week view)
- [ ] Touch device support
- [ ] Keyboard shortcuts (arrow keys to move)
- [ ] Bulk move (multiple bookings at once)

### Nice to Have
- [ ] Animation during drag
- [ ] Snap to grid
- [ ] Auto-scroll when dragging near edge
- [ ] Show available slots while dragging
- [ ] Resize booking by dragging edges (change duration)

## Testing Checklist

- [x] Drag booking to empty slot on same court
- [x] Drag booking to different court
- [x] Drag booking to different time
- [x] Handle API errors gracefully
- [x] Preserve booking duration
- [x] Refresh schedule after successful move
- [ ] Test with overnight bookings
- [ ] Test conflict scenarios
- [ ] Test with inactive courts
- [ ] Mobile/touch device testing

## Troubleshooting

### Booking Won't Drag
**Check:**
- Is `onBookingDragDrop` prop passed to ScheduleView?
- Are bookings rendered with `draggable` attribute?
- Check browser console for errors

### Drop Doesn't Work
**Check:**
- Is `handleDragOver` preventing default?
- Is drop target properly set up?
- Check Network tab for API call

### Booking Reverts After Drop
**Check:**
- API response status (should be 200)
- Check for conflict errors (409)
- Verify booking ID is valid
- Check court availability

### Schedule Doesn't Refresh
**Check:**
- `loadData()` is called after API success
- No errors in API call
- Club ID is valid

## Performance Considerations

- Drag-drop is optimized for smooth user experience
- API call is async but UI responds immediately
- Schedule refresh is debounced to prevent multiple calls
- Large schedules (50+ bookings) may have slight delay

## Accessibility

Currently, drag-and-drop is mouse/pointer only. For keyboard users:
- Use edit booking modal as alternative
- Consider adding keyboard shortcuts in future

## Related Files

- `src/components/ScheduleView.tsx` - Drag-drop UI logic
- `src/pages/Dashboard.tsx` - API handler
- `src/services/api.ts` - API method
- `src/types/index.ts` - TypeScript types
- `src/components/BookingCard.tsx` - Draggable card

---

**Last Updated**: November 23, 2025
