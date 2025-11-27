# Padel Club Management System - Frontend Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Core Features](#core-features)
5. [Architecture & Flow](#architecture--flow)
6. [Components Documentation](#components-documentation)
7. [API Integration](#api-integration)
8. [State Management](#state-management)
9. [Setup & Installation](#setup--installation)

---

## 🎯 Project Overview

A comprehensive web-based management system for Padel clubs, enabling administrators to manage court bookings, schedules, coaches, customers, and facility closures. The application provides real-time schedule views (day/week/month), drag-and-drop booking management, and multi-language support.

**Key Capabilities:**
- 🏟️ Court and booking management
- 📅 Multiple schedule views (Day, Week, Month)
- 👥 Customer and coach management
- 💰 Payment tracking and categorization
- 🚫 Stadium closure management
- 🌍 Internationalization (i18n)
- 🎨 Theme switching (Light/Dark)
- 🔐 Secure authentication with JWT

---

## 🛠 Technology Stack

### Core Framework & Build Tools
- **React 19.2.0** - UI library
- **TypeScript 5.9.3** - Type-safe JavaScript
- **Vite 7.2.4** - Fast build tool and dev server
- **React Router DOM 7.9.6** - Client-side routing

### UI & Styling
- **CSS Modules** - Component-scoped styling
- **Lucide React 0.554.0** - Modern icon library
- **React Hot Toast 2.6.0** - Toast notifications

### State & Data Management
- **Axios 1.13.2** - HTTP client with interceptors
- **React Context API** - Global state management
- **LocalStorage** - Token persistence

### Utilities
- **date-fns 4.1.0** - Date manipulation and formatting
- **i18next 25.6.3** - Internationalization framework
- **react-i18next 16.3.5** - React bindings for i18next

### Development Tools
- **ESLint 9.39.1** - Code linting
- **TypeScript ESLint 8.46.4** - TypeScript-specific linting
- **Vite Plugin React 5.1.1** - React Fast Refresh

---

## 📁 Project Structure

```
paddleFront_End/
├── public/                          # Static assets
├── src/
│   ├── assets/                      # Images, fonts, etc.
│   ├── components/                  # Reusable UI components
│   │   ├── BookingCard.tsx         # Individual booking display
│   │   ├── BookingCard.css
│   │   ├── BookingDetailsModal.tsx # Booking details popup
│   │   ├── BookingDetailsModal.css
│   │   ├── BookingModal.tsx        # Multi-tab booking creation
│   │   ├── BookingModal.css
│   │   ├── CoachBookingModal.tsx   # Coach-specific bookings
│   │   ├── FixedBookingModal.tsx   # Recurring bookings
│   │   ├── FixedBookingModal.css
│   │   ├── Header.tsx              # App header with actions
│   │   ├── Header.css
│   │   ├── LanguageSwitcher.tsx    # i18n language selector
│   │   ├── LanguageSwitcher.css
│   │   ├── MonthView.tsx           # Calendar month view
│   │   ├── MonthView.css
│   │   ├── ProtectedRoute.tsx      # Auth route wrapper
│   │   ├── ScheduleView.tsx        # Day schedule grid
│   │   ├── ScheduleView.css
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   ├── Sidebar.css
│   │   ├── ThemeSwitcher.tsx       # Dark/Light mode toggle
│   │   ├── ThemeSwitcher.css
│   │   ├── WeekView.tsx            # Week schedule view
│   │   └── WeekView.css
│   │
│   ├── contexts/                    # React Context providers
│   │   └── AuthContext.tsx         # Authentication state
│   │
│   ├── data/                        # Mock/sample data
│   │   └── mockData.ts
│   │
│   ├── i18n/                        # Internationalization
│   │   └── config.ts               # i18next configuration
│   │
│   ├── pages/                       # Route-level pages
│   │   ├── Dashboard.tsx           # Main application page
│   │   ├── Login.tsx               # Authentication page
│   │   └── Login.css
│   │
│   ├── services/                    # API & external services
│   │   └── api.ts                  # Axios HTTP client & endpoints
│   │
│   ├── types/                       # TypeScript definitions
│   │   ├── index.ts                # Shared type definitions
│   │   └── types.ts                # Additional types
│   │
│   ├── App.tsx                      # Root component
│   ├── App.css                      # Global app styles
│   ├── main.tsx                     # Application entry point
│   └── index.css                    # Global CSS variables
│
├── index.html                       # HTML template
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript configuration
├── tsconfig.app.json               # App-specific TS config
├── tsconfig.node.json              # Node-specific TS config
├── vite.config.ts                  # Vite build configuration
├── eslint.config.js                # ESLint rules
├── API_INTEGRATION.md              # API documentation
├── BOOKING_TABS_IMPLEMENTATION.md  # Booking feature docs
├── DRAG_DROP_FEATURE.md            # Drag & drop documentation
├── QUICK_START.md                  # Getting started guide
├── REACT_NATIVE_CUSTOMER_APP.md    # Mobile app documentation
└── TIMEZONE_HANDLING.md            # Timezone logic documentation
```

---

## 🎨 Core Features

### 1. **Authentication System**
- JWT-based authentication with access and refresh tokens
- Token auto-refresh mechanism (every 50 minutes)
- Persistent login using localStorage
- Protected routes with automatic redirects
- Multi-club support with club ID persistence

### 2. **Booking Management**

#### **Single Bookings**
- One-time court reservations
- Customer selection with search functionality
- Booking type: Single, Team, Tournament
- Category assignment for tracking
- Price calculation based on court and duration
- Payment status tracking (Pending, Partial, Paid)
- Overnight booking support

#### **Fixed Bookings (Recurring)**
- Weekly recurring bookings
- Multi-day selection (Monday, Wednesday, Friday, etc.)
- Recurrence end date
- Payment method tracking
- Series management for bulk operations

#### **Coach Bookings**
- Specialized bookings with coach assignment
- Coach selection from club roster
- Training session management

#### **Stadium Closure Management**
- Close entire club for specific dates
- Reason tracking (holidays, maintenance, etc.)
- Visual indicators in schedule (striped pattern)
- Bulk date closure
- Delete individual closure dates

### 3. **Schedule Views**

#### **Day View**
- 30-minute time slots (00:00 - 23:30)
- Multi-court grid layout
- Drag-and-drop booking rescheduling
- Color-coded bookings by category
- Overnight booking indicators
- Closed date visual overlays

#### **Week View**
- 7-day horizontal layout
- Booking overview across multiple days
- Quick navigation between weeks

#### **Month View**
- Calendar-style monthly overview
- Booking count per day
- Date navigation with year/month selector

### 4. **Customer & Coach Management**
- Customer database with search
- Phone number lookup
- Auto-fill customer details on booking
- Coach roster management
- Coach assignment to bookings

### 5. **Payment & Categories**
- Booking categories with color coding
- Payment status tracking
- Price management per court
- Total received vs. booking price tracking
- Payment method recording

### 6. **Internationalization (i18n)**
- Multi-language support
- Language switcher component
- Persistent language preference
- Translation keys for all UI text

### 7. **Theme System**
- Light and Dark mode
- System preference detection
- Persistent theme selection
- CSS variable-based theming

---

## 🏗 Architecture & Flow

### Application Entry Point
```
main.tsx
  ├─ Wraps App with BrowserRouter
  ├─ Wraps with AuthProvider (Context)
  └─ Renders App component
```

### Authentication Flow
```
1. User accesses application
   ↓
2. AuthContext checks localStorage for tokens
   ↓
3. If authenticated → Redirect to /dashboard
   If not → Show /login
   ↓
4. Login form submits credentials
   ↓
5. API returns accessToken, refreshToken, user
   ↓
6. Store tokens in localStorage
   ↓
7. Fetch clubs and set default clubId
   ↓
8. Redirect to Dashboard
```

### Data Flow Architecture

```
Dashboard (Main Page)
  ├─ useAuth() hook → Get clubId, user
  ├─ useEffect on mount/date change
  │   ├─ Fetch courts (getCourts)
  │   └─ Fetch schedule (getDaySchedule/getWeekSchedule/getMonthSchedule)
  │
  ├─ Transform API data to component format
  │   ├─ Convert UTC timestamps to local time
  │   ├─ Handle overnight bookings
  │   ├─ Extract closedDates from response
  │   └─ Merge closedDates into courts
  │
  ├─ Pass data to child components
  │   ├─ ScheduleView (Day)
  │   ├─ WeekView (Week)
  │   └─ MonthView (Month)
  │
  └─ Handle user actions
      ├─ Open BookingModal
      ├─ Drag-drop bookings (dragDropBooking API)
      └─ View booking details
```

### Booking Creation Flow

```
1. User clicks "Add Booking" button
   ↓
2. BookingModal opens with 4 tabs:
   - Single Bookings
   - Fixed Bookings
   - Coach Bookings
   - Close Stadium
   ↓
3. User fills form based on selected tab
   ↓
4. Form validation on submit
   ↓
5. API call based on booking type:
   - Single → createBooking()
   - Fixed → createFixedBooking()
   - Coach → createBooking() with coachId
   - Close → closeClubDate()
   ↓
6. Success → Toast notification
   ↓
7. Reload schedule data
   ↓
8. Close modal
```

### API Request/Response Flow

```
Component Action
  ↓
apiService method (api.ts)
  ↓
Axios request with interceptors
  ├─ Request Interceptor
  │   └─ Add Authorization header (Bearer token)
  ↓
Backend API (http://localhost:3000)
  ↓
Response Interceptor
  ├─ If 401 error
  │   ├─ Attempt token refresh
  │   ├─ Retry original request
  │   └─ If refresh fails → Logout & redirect to /login
  └─ Return response
  ↓
Transform data in component
  ↓
Update state → Re-render UI
```

---

## 📦 Components Documentation

### Core Components

#### **Dashboard.tsx**
**Purpose:** Main application container and data orchestrator

**Responsibilities:**
- Fetch courts and bookings from API
- Manage date and view mode state
- Handle booking drag-and-drop operations
- Transform API data for child components
- Coordinate between Header, Sidebar, and view components

**State:**
```typescript
- activeMenuItem: string         // Current sidebar selection
- selectedDate: Date             // Active date for schedule
- viewMode: 'day' | 'week' | 'month'
- isBookingModalOpen: boolean
- courts: Court[]
- bookings: Booking[]
- loading: boolean
- error: string | null
```

#### **BookingModal.tsx**
**Purpose:** Multi-tab booking creation interface

**Tabs:**
1. **Single Bookings** - One-time reservations
2. **Fixed Bookings** - Recurring bookings with repeat pattern
3. **Coach Bookings** - Training sessions with coach assignment
4. **Close Stadium** - Facility closure management

**Features:**
- Tab-based navigation
- Dynamic form fields based on active tab
- Customer search and auto-fill
- Court selection with price calculation
- Category assignment
- Validation per booking type
- Closed dates list with delete functionality

#### **ScheduleView.tsx**
**Purpose:** Day view schedule grid with time slots

**Features:**
- 30-minute time slot grid (48 slots per day)
- Multi-court horizontal layout
- Drag-and-drop booking rescheduling
- BookingCard rendering with duration calculation
- Overnight booking support
- Closed date visual indicators (striped pattern)
- Date picker dropdown with calendar
- View mode toggle (Day/Week/Month)

**Booking Rendering Logic:**
```typescript
- Calculate slot index from time (HH:mm)
- Determine if booking starts at slot
- Calculate display duration (handles overnight)
- Render BookingCard at start slot
- Apply closed styling if court is closed
```

#### **BookingCard.tsx**
**Purpose:** Individual booking display within schedule

**Features:**
- Draggable for rescheduling
- Color-coded by category
- Displays player name, time, and phone
- Click to view details modal
- Dynamic height based on duration

#### **BookingDetailsModal.tsx**
**Purpose:** Full booking information popup

**Displays:**
- Player/customer information
- Court and date details
- Time range (12-hour format)
- Payment status and price
- Booking type and category
- Fixed booking recurrence details

#### **ScheduleView Components**

##### **WeekView.tsx**
- 7-day horizontal grid
- Bookings grouped by day
- Multi-court columns per day

##### **MonthView.tsx**
- Calendar-style month display
- Booking count indicators
- Date selection with navigation

---

## 🔌 API Integration

### Base Configuration
```typescript
const API_URL = 'http://localhost:3000';

// Axios instance with interceptors
- Request: Adds Authorization header
- Response: Handles 401 with token refresh
```

### Authentication Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/login` | User authentication |
| POST | `/auth/logout` | User logout |
| POST | `/auth/refresh` | Refresh access token |

### Club & Court Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/clubs` | List all clubs |
| GET | `/clubs/{clubId}` | Get club details |
| GET | `/clubs/{clubId}/courts` | List courts in club |
| POST | `/clubs/{clubId}/courts` | Create new court |
| PATCH | `/courts/{courtId}` | Update court |
| DELETE | `/courts/{courtId}` | Delete court |

### Schedule Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/clubs/{clubId}/schedule/day?date={YYYY-MM-DD}` | Day schedule |
| GET | `/clubs/{clubId}/schedule/week?startDate={YYYY-MM-DD}` | Week schedule |
| GET | `/clubs/{clubId}/schedule/month?year={YYYY}&month={MM}` | Month schedule |

**Response includes:** Courts with bookings and closedDates arrays

### Booking Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/clubs/{clubId}/bookings` | Create booking (single/fixed/coach) |
| GET | `/clubs/{clubId}/bookings/{bookingId}` | Get booking details |
| PATCH | `/clubs/{clubId}/bookings/{bookingId}` | Update booking |
| PUT | `/clubs/{clubId}/bookings/{bookingId}/drag-drop` | Drag-drop reschedule |
| DELETE | `/clubs/{clubId}/bookings/{bookingId}` | Delete booking |

### Customer & Coach Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/clubs/{clubId}/customers?search={query}` | Search customers |
| POST | `/clubs/{clubId}/customers` | Create customer |
| PATCH | `/customers/{customerId}` | Update customer |
| GET | `/clubs/{clubId}/coaches` | List coaches |
| POST | `/clubs/{clubId}/coaches` | Create coach |
| PATCH | `/coaches/{coachId}` | Update coach |

### Closed Dates Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/clubs/{clubId}/closed-dates` | Close club date |
| GET | `/clubs/{clubId}/closed-dates?from={date}&to={date}` | List closed dates (optional range) |
| GET | `/closed-dates/{closedDateId}` | Get specific closed date |
| DELETE | `/closed-dates/{closedDateId}` | Delete closed date |

### Booking Categories

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/clubs/{clubId}/booking-categories` | List categories |
| POST | `/clubs/{clubId}/booking-categories` | Create category |
| PATCH | `/booking-categories/{categoryId}` | Update category |
| DELETE | `/booking-categories/{categoryId}` | Delete category |

### Payment Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/clubs/{clubId}/payments?startDate={date}&endDate={date}` | List payments |
| POST | `/clubs/{clubId}/payments` | Record payment |

---

## 🧠 State Management

### Global State (Context API)

#### **AuthContext**
```typescript
interface AuthContextType {
  user: User | null;              // Current user info
  accessToken: string | null;     // JWT access token
  clubId: string | null;          // Selected club ID
  login: (email, password) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;             // Auth initialization
  isAuthenticated: boolean;       // Computed from token
}
```

**Provided to:** Entire application via AuthProvider wrapper

**Usage in components:**
```typescript
const { user, clubId, logout } = useAuth();
```

### Local Component State

#### **Dashboard State**
- `activeMenuItem` - Sidebar selection
- `selectedDate` - Current date for schedule
- `viewMode` - day/week/month view
- `courts` - Court list with closedDates
- `bookings` - Transformed booking list
- `isBookingModalOpen` - Modal visibility

#### **BookingModal State**
- `activeTab` - Current booking type tab
- Form fields per booking type
- `categories` - Available booking categories
- `coaches` - Available coaches
- `closedDates` - List of closed dates
- `loading` & `error` - Form submission state

#### **ScheduleView State**
- `draggedBooking` - Currently dragged booking
- `isCalendarOpen` - Date picker visibility
- `selectedBooking` - Booking for details modal
- `isDetailsModalOpen` - Details modal visibility

### Data Persistence

#### **LocalStorage Keys**
```typescript
'admin_access_token'   // JWT access token
'admin_refresh_token'  // JWT refresh token
'admin_user'           // Serialized user object
'admin_club_id'        // Selected club ID
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Backend API running on http://localhost:3000

### Installation Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd paddleFront_End

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview

# 6. Lint code
npm run lint
```

### Environment Configuration

The application connects to:
```typescript
API_URL = 'http://localhost:3000'
```

To change the backend URL, update `src/services/api.ts`:
```typescript
const API_URL = 'your-backend-url';
```

### Development Server
```
Local:   http://localhost:5173/
Network: http://<your-ip>:5173/
```

### Build Output
```
dist/
├── assets/           # Bundled JS, CSS with hash names
├── index.html        # Entry HTML
└── ...
```

---

## 📝 Key Features Implementation

### 1. **Drag-and-Drop Booking Rescheduling**

**Implementation in ScheduleView.tsx:**
```typescript
// Start drag
handleDragStart(booking) → setDraggedBooking(booking)

// Drop on new slot
handleDrop(courtId, slotIndex) {
  - Calculate new start time from slotIndex
  - Calculate new end time (start + duration)
  - Call API: dragDropBooking(bookingId, courtId, startTime, endTime, date)
  - Reload schedule data
}
```

### 2. **Overnight Booking Support**

**Logic:**
```typescript
// Detect overnight
startDate !== endDate

// Rendering
if (booking.isOvernightBooking) {
  if (booking.endDate === currentDate) {
    // Show from midnight to end time
    render from slot 0 to endSlot
  } else {
    // Show from start time to end of day
    render from startSlot to slot 47
  }
}
```

### 3. **Closed Date Visualization**

**CSS:**
```css
.court-cell-half.closed {
  background: repeating-linear-gradient(
    45deg,
    #fee2e2,
    #fee2e2 10px,
    #fecaca 10px,
    #fecaca 20px
  );
  cursor: not-allowed;
  pointer-events: none;
}
```

**Badge overlay at slot 0:**
```tsx
{isCourtClosed && slotIndex === 0 && (
  <div className="closed-badge">
    🚫 CLOSED
    <div>{closedDateInfo?.reason}</div>
  </div>
)}
```

### 4. **Timezone Handling**

**UTC to Local Conversion:**
```typescript
// API returns UTC timestamps
const startDate = new Date(booking.startDateTime);

// Extract local time
const hours = startDate.getHours();
const minutes = startDate.getMinutes();

// Format for display
const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
```

### 5. **Token Refresh Mechanism**

```typescript
// Auto-refresh every 50 minutes
useEffect(() => {
  const interval = setInterval(async () => {
    const refreshToken = localStorage.getItem('admin_refresh_token');
    const response = await apiService.refreshToken(refreshToken);
    
    // Update tokens
    localStorage.setItem('admin_access_token', response.accessToken);
    localStorage.setItem('admin_refresh_token', response.refreshToken);
  }, 50 * 60 * 1000);
  
  return () => clearInterval(interval);
}, [accessToken]);
```

---

## 🎯 Application Flow Summary

### User Journey

```
1. Login Page
   ↓ Enter credentials
   
2. Authentication
   ↓ Store tokens & fetch clubs
   
3. Dashboard Loads
   ├─ Sidebar (Navigation)
   ├─ Header (Actions, Theme, Language)
   └─ Schedule View (Default: Day)
       ├─ Court columns
       ├─ Time slot rows
       └─ Booking cards
   
4. User Actions
   ├─ Add Booking
   │   └─ BookingModal (4 tabs)
   │       ├─ Single Booking
   │       ├─ Fixed Booking
   │       ├─ Coach Booking
   │       └─ Close Stadium
   │
   ├─ Drag Booking
   │   └─ Drop on new slot → Update API
   │
   ├─ Click Booking
   │   └─ BookingDetailsModal
   │
   ├─ Change View
   │   ├─ Week View
   │   ├─ Month View
   │   └─ Day View
   │
   └─ Navigate Dates
       └─ Calendar Date Picker
```

---

## 📚 Additional Documentation Files

1. **API_INTEGRATION.md** - Detailed API endpoint documentation
2. **BOOKING_TABS_IMPLEMENTATION.md** - Booking modal implementation guide
3. **DRAG_DROP_FEATURE.md** - Drag-and-drop functionality details
4. **TIMEZONE_HANDLING.md** - Timezone conversion logic
5. **REACT_NATIVE_CUSTOMER_APP.md** - Mobile app documentation
6. **QUICK_START.md** - Quick setup guide

---

## 🔐 Security Considerations

1. **JWT Token Management**
   - Tokens stored in localStorage (consider httpOnly cookies for production)
   - Auto-refresh mechanism before expiry
   - Logout clears all stored credentials

2. **API Interceptors**
   - Automatic token injection
   - 401 handling with refresh retry
   - Error handling and user feedback

3. **Protected Routes**
   - ProtectedRoute wrapper checks authentication
   - Automatic redirect to login if not authenticated
   - Persistent login across page refreshes

---

## 🎨 Theming & Styling

### CSS Variable System
```css
:root {
  --bg-body: #f8f9fa;
  --bg-surface: #ffffff;
  --border-subtle: #e5e5e5;
  --text-main: #333333;
  /* ... more variables */
}

[data-theme="dark"] {
  --bg-body: #1a1a1a;
  --bg-surface: #2d2d2d;
  /* ... dark mode overrides */
}
```

### Component Styling Pattern
- Each component has its own CSS file
- BEM-like naming convention
- Responsive design with media queries
- Consistent spacing and color palette

---

## 🌍 Internationalization (i18n)

### Configuration (i18n/config.ts)
```typescript
i18next.init({
  resources: {
    en: { translation: { /* English translations */ } },
    ar: { translation: { /* Arabic translations */ } },
    es: { translation: { /* Spanish translations */ } }
  },
  lng: 'en',
  fallbackLng: 'en',
  detection: { order: ['localStorage', 'navigator'] }
});
```

### Usage in Components
```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
<h1>{t('dashboard.title')}</h1>
```

---

## 📈 Performance Optimizations

1. **React.memo** on ScheduleView and large components
2. **useCallback** for event handlers
3. **Vite's Fast Refresh** for instant HMR
4. **Code splitting** with React Router lazy loading
5. **Date-fns** for efficient date operations
6. **Axios interceptors** to avoid redundant auth logic

---

## 🐛 Error Handling

### API Errors
```typescript
try {
  const response = await apiService.someMethod();
} catch (error) {
  const message = error.response?.data?.message || 'Operation failed';
  toast.error(message);
  setError(message);
}
```

### Global Error Boundaries
- React Router handles 404s
- API interceptor handles 401s
- Toast notifications for user feedback

---

## 🧪 Testing Strategy (Recommended)

### Unit Tests
- Component rendering
- State management logic
- Utility functions (date formatting, calculations)

### Integration Tests
- API service calls with mock responses
- Authentication flow
- Booking creation workflow

### E2E Tests
- User login → Dashboard → Create booking
- Drag-and-drop operations
- Multi-view navigation

---

## 🚧 Future Enhancements

1. **Real-time Updates** - WebSocket for live booking updates
2. **Mobile App** - React Native customer-facing app (see REACT_NATIVE_CUSTOMER_APP.md)
3. **Analytics Dashboard** - Revenue, utilization metrics
4. **Notification System** - Email/SMS booking confirmations
5. **Multi-club Management** - Switch between multiple clubs
6. **Advanced Filtering** - Filter bookings by customer, category, status
7. **Export Functionality** - PDF reports, CSV exports
8. **Recurring Payments** - Automatic payment tracking for fixed bookings

---

## 📞 Support & Contribution

For questions or contributions:
1. Check existing documentation files
2. Review code comments in critical sections
3. Follow TypeScript best practices
4. Maintain consistent component structure
5. Update this documentation when adding features

---

**Last Updated:** November 27, 2025  
**Version:** 0.0.0  
**Maintained By:** Development Team
