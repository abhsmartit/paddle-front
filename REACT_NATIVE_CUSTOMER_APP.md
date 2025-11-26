# Padel Club - React Native Customer Application

## Overview
This document provides a complete guide for building a React Native customer application that aligns with the admin dashboard design and API.

---

## Table of Contents
1. [Project Setup](#project-setup)
2. [Design System](#design-system)
3. [Architecture](#architecture)
4. [Screen Specifications](#screen-specifications)
5. [API Integration](#api-integration)
6. [Component Library](#component-library)
7. [State Management](#state-management)
8. [Schedule Implementation](#schedule-implementation)

---

## Project Setup

### 1. Initialize React Native Project

```bash
# Using React Native CLI
npx react-native init PadelClubCustomer --template react-native-template-typescript

# OR using Expo (Recommended for faster development)
npx create-expo-app PadelClubCustomer --template
cd PadelClubCustomer
```

### 2. Install Dependencies

```bash
# Core Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler react-native-reanimated

# UI Components
npm install react-native-vector-icons
npm install react-native-calendars
npm install @gorhom/bottom-sheet
npm install react-native-modal

# Date/Time Handling
npm install date-fns

# API & State Management
npm install axios zustand
npm install @tanstack/react-query

# Forms & Validation
npm install react-hook-form yup @hookform/resolvers

# Utilities
npm install react-native-toast-message
npm install react-native-linear-gradient
```

### 3. Project Structure

```
PadelClubCustomer/
├── src/
│   ├── api/
│   │   ├── client.ts
│   │   ├── endpoints.ts
│   │   └── types.ts
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Loading.tsx
│   │   ├── booking/
│   │   │   ├── CourtCard.tsx
│   │   │   ├── TimeSlot.tsx
│   │   │   ├── BookingSummary.tsx
│   │   │   └── ConfirmationModal.tsx
│   │   └── schedule/
│   │       ├── DayView.tsx
│   │       ├── WeekView.tsx
│   │       └── TimelineGrid.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── CourtSelectionScreen.tsx
│   │   ├── DateTimeSelectionScreen.tsx
│   │   ├── BookingFormScreen.tsx
│   │   ├── BookingConfirmationScreen.tsx
│   │   ├── MyBookingsScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   └── TabNavigator.tsx
│   ├── store/
│   │   ├── bookingStore.ts
│   │   └── authStore.ts
│   ├── utils/
│   │   ├── theme.ts
│   │   ├── timeSlots.ts
│   │   └── validation.ts
│   ├── types/
│   │   └── index.ts
│   └── App.tsx
├── assets/
│   └── images/
└── package.json
```

---

## Design System

### Color Palette (Match Admin Dashboard)

```typescript
// src/utils/theme.ts
export const theme = {
  colors: {
    // Primary Colors
    primary: '#2ECC71',        // Main green
    primaryDark: '#27AE60',    // Dark green
    primaryLight: '#E9F7EF',   // Light green background
    
    // Secondary Colors
    secondary: '#3498DB',      // Blue for coach sessions
    secondaryDark: '#2980B9',
    
    // Neutral Colors
    white: '#FFFFFF',
    black: '#000000',
    gray100: '#F8F9FA',
    gray200: '#E5E5E5',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#2C3E50',
    gray900: '#1F2937',
    
    // Status Colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Background
    background: '#F8F9FA',
    surface: '#FFFFFF',
    
    // Text
    textPrimary: '#2C3E50',
    textSecondary: '#6B7280',
    textDisabled: '#9CA3AF',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700',
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};
```

---

## Architecture

### API Client Setup

```typescript
// src/api/client.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Change for production

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    // Add token if available (for authenticated customers)
    const token = ''; // Get from AsyncStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 409) {
      // Booking conflict
      throw new Error('This time slot is already booked');
    }
    return Promise.reject(error);
  }
);
```

### API Endpoints

```typescript
// src/api/endpoints.ts
import { apiClient } from './client';
import type { Court, Booking, BookingCategory, CreateBookingRequest } from './types';

export const clubApi = {
  // Get club details
  getClub: async (clubId: string) => {
    const { data } = await apiClient.get(`/clubs/${clubId}`);
    return data;
  },

  // Get all courts
  getCourts: async (clubId: string): Promise<Court[]> => {
    const { data } = await apiClient.get(`/clubs/${clubId}/courts`);
    return data;
  },

  // Get day schedule
  getDaySchedule: async (clubId: string, date: string) => {
    const { data } = await apiClient.get(
      `/clubs/${clubId}/schedule/day?date=${date}`
    );
    return data;
  },

  // Get booking categories
  getCategories: async (clubId: string): Promise<BookingCategory[]> => {
    const { data } = await apiClient.get(`/clubs/${clubId}/booking-categories`);
    return data;
  },

  // Create booking
  createBooking: async (clubId: string, booking: CreateBookingRequest): Promise<Booking> => {
    const { data } = await apiClient.post(`/clubs/${clubId}/bookings`, booking);
    return data;
  },

  // Get customer bookings (requires customer ID)
  getCustomerBookings: async (clubId: string, phone: string) => {
    const { data } = await apiClient.get(
      `/clubs/${clubId}/customers?search=${phone}`
    );
    return data;
  },
};
```

### Type Definitions

```typescript
// src/api/types.ts
export interface Court {
  _id: string;
  name: string;
  surfaceType: string;
  defaultPricePerHour: number;
  isActive: boolean;
}

export interface Booking {
  _id: string;
  courtId: string;
  bookingName: string;
  phone: string;
  startDateTime: string;
  endDateTime: string;
  price: number;
  paymentStatus: 'PENDING' | 'PAID' | 'CANCELLED';
  bookingType: 'SINGLE' | 'FIXED_BOOKING';
}

export interface BookingCategory {
  _id: string;
  name: string;
  colorHex: string;
  isActive: boolean;
}

export interface CreateBookingRequest {
  courtId: string;
  bookingName: string;
  phone: string;
  bookingType: 'SINGLE' | 'FIXED_BOOKING';
  startDateTime: string;
  endDateTime: string;
  price: number;
  bookingCategoryId?: string;
}

export interface TimeSlot {
  time: string;
  hour: number;
  minutes: number;
  isAvailable: boolean;
  booking?: Booking;
}

export interface CourtSchedule {
  courtId: string;
  courtName: string;
  timeSlots: TimeSlot[];
}
```

---

## Screen Specifications

### 1. Home Screen

**Purpose:** Landing page showing club info and quick booking CTA

```typescript
// src/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../utils/theme';

export const HomeScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.hero}
      >
        <Text style={styles.heroTitle}>Padel Club Riyadh</Text>
        <Text style={styles.heroSubtitle}>Book Your Court in Seconds</Text>
        
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate('CourtSelection')}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Features */}
      <View style={styles.features}>
        <FeatureCard
          icon="🎾"
          title="6 Premium Courts"
          description="Professional artificial grass courts"
        />
        <FeatureCard
          icon="⏰"
          title="Flexible Hours"
          description="Open 8 AM to 11 PM daily"
        />
        <FeatureCard
          icon="💳"
          title="Easy Payment"
          description="Pay online or at venue"
        />
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why Choose Us?</Text>
        <Text style={styles.sectionText}>
          Premium padel experience with state-of-the-art facilities,
          professional coaching, and a vibrant community.
        </Text>
      </View>
    </ScrollView>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <View style={styles.featureCard}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDescription}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  hero: {
    padding: theme.spacing.xxl,
    paddingTop: 60,
    paddingBottom: theme.spacing.xxl,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
  },
  heroTitle: {
    ...theme.typography.h1,
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  heroSubtitle: {
    ...theme.typography.body,
    color: theme.colors.white,
    opacity: 0.9,
    marginBottom: theme.spacing.xl,
  },
  bookButton: {
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
  },
  bookButtonText: {
    ...theme.typography.h3,
    color: theme.colors.primary,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: theme.spacing.lg,
    marginTop: -theme.spacing.xl,
  },
  featureCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    flex: 1,
    margin: theme.spacing.xs,
    ...theme.shadows.md,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  featureTitle: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  featureDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  sectionText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
});
```

### 2. Court Selection Screen

```typescript
// src/screens/CourtSelectionScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { clubApi } from '../api/endpoints';
import { theme } from '../utils/theme';
import type { Court } from '../api/types';

export const CourtSelectionScreen = ({ navigation }) => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const clubId = '674187c2e4b0c8f9a1234567'; // Your club ID

  useEffect(() => {
    loadCourts();
  }, []);

  const loadCourts = async () => {
    try {
      const data = await clubApi.getCourts(clubId);
      setCourts(data.filter(c => c.isActive));
    } catch (error) {
      console.error('Failed to load courts:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCourt = ({ item }: { item: Court }) => (
    <TouchableOpacity
      style={styles.courtCard}
      onPress={() => navigation.navigate('DateTimeSelection', { court: item })}
    >
      <View style={styles.courtIcon}>
        <Text style={styles.courtIconText}>🎾</Text>
      </View>
      <View style={styles.courtInfo}>
        <Text style={styles.courtName}>{item.name}</Text>
        <Text style={styles.courtSurface}>{item.surfaceType}</Text>
        <Text style={styles.courtPrice}>
          {item.defaultPricePerHour} SAR/hour
        </Text>
      </View>
      <View style={styles.courtArrow}>
        <Text style={styles.arrowText}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Court</Text>
      <FlatList
        data={courts}
        renderItem={renderCourt}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  list: {
    gap: theme.spacing.md,
  },
  courtCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  courtIcon: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  courtIconText: {
    fontSize: 32,
  },
  courtInfo: {
    flex: 1,
  },
  courtName: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  courtSurface: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  courtPrice: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  courtArrow: {
    marginLeft: theme.spacing.md,
  },
  arrowText: {
    fontSize: 24,
    color: theme.colors.gray400,
  },
});
```

### 3. Date & Time Selection Screen (Most Important)

```typescript
// src/screens/DateTimeSelectionScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { format, addDays } from 'date-fns';
import { clubApi } from '../api/endpoints';
import { theme } from '../utils/theme';
import { generateTimeSlots, checkSlotAvailability } from '../utils/timeSlots';

export const DateTimeSelectionScreen = ({ route, navigation }) => {
  const { court } = route.params;
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [schedule, setSchedule] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const clubId = '674187c2e4b0c8f9a1234567';

  useEffect(() => {
    loadSchedule(selectedDate);
  }, [selectedDate]);

  const loadSchedule = async (date: string) => {
    try {
      const data = await clubApi.getDaySchedule(clubId, date);
      const courtSchedule = data.courts.find(c => c.courtId === court._id);
      setSchedule(courtSchedule);
    } catch (error) {
      console.error('Failed to load schedule:', error);
    }
  };

  const timeSlots = generateTimeSlots(8, 23); // 8 AM to 11 PM

  const isSlotAvailable = (slot) => {
    if (!schedule) return true;
    return checkSlotAvailability(slot, schedule.bookings);
  };

  const handleSlotSelect = (slot) => {
    if (isSlotAvailable(slot)) {
      setSelectedSlot(slot);
    }
  };

  const handleContinue = () => {
    if (selectedSlot) {
      navigation.navigate('BookingForm', {
        court,
        date: selectedDate,
        timeSlot: selectedSlot,
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Select Date & Time</Text>
      
      {/* Calendar */}
      <Calendar
        current={selectedDate}
        minDate={format(new Date(), 'yyyy-MM-dd')}
        maxDate={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: theme.colors.primary },
        }}
        theme={{
          selectedDayBackgroundColor: theme.colors.primary,
          todayTextColor: theme.colors.primary,
          arrowColor: theme.colors.primary,
        }}
      />

      {/* Time Slots */}
      <View style={styles.slotsSection}>
        <Text style={styles.sectionTitle}>Available Time Slots</Text>
        <View style={styles.slotsGrid}>
          {timeSlots.map((slot) => {
            const available = isSlotAvailable(slot);
            const selected = selectedSlot?.time === slot.time;
            
            return (
              <TouchableOpacity
                key={slot.time}
                style={[
                  styles.slot,
                  !available && styles.slotBooked,
                  selected && styles.slotSelected,
                ]}
                onPress={() => handleSlotSelect(slot)}
                disabled={!available}
              >
                <Text
                  style={[
                    styles.slotText,
                    !available && styles.slotTextBooked,
                    selected && styles.slotTextSelected,
                  ]}
                >
                  {slot.time}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Continue Button */}
      {selectedSlot && (
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    padding: theme.spacing.lg,
  },
  slotsSection: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  slot: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    minWidth: '30%',
    alignItems: 'center',
  },
  slotBooked: {
    backgroundColor: theme.colors.gray100,
    borderColor: theme.colors.gray300,
  },
  slotSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  slotText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  slotTextBooked: {
    color: theme.colors.textDisabled,
    textDecorationLine: 'line-through',
  },
  slotTextSelected: {
    color: theme.colors.white,
  },
  continueButton: {
    backgroundColor: theme.colors.primary,
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  continueButtonText: {
    ...theme.typography.h3,
    color: theme.colors.white,
  },
});
```

### 4. Booking Form Screen

```typescript
// src/screens/BookingFormScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { clubApi } from '../api/endpoints';
import { theme } from '../utils/theme';

export const BookingFormScreen = ({ route, navigation }) => {
  const { court, date, timeSlot } = route.params;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    if (!name || !phone) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const startDateTime = new Date(`${date}T${timeSlot.time}:00`);
      const endDateTime = new Date(startDateTime.getTime() + 90 * 60000); // 1.5 hours

      const booking = await clubApi.createBooking('674187c2e4b0c8f9a1234567', {
        courtId: court._id,
        bookingName: name,
        phone,
        bookingType: 'SINGLE',
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        price: court.defaultPricePerHour * 1.5,
      });

      navigation.navigate('BookingConfirmation', { booking });
    } catch (error) {
      alert(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Details</Text>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Booking Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Court:</Text>
          <Text style={styles.summaryValue}>{court.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Date:</Text>
          <Text style={styles.summaryValue}>{date}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Time:</Text>
          <Text style={styles.summaryValue}>{timeSlot.time}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Price:</Text>
          <Text style={styles.summaryValue}>
            {court.defaultPricePerHour * 1.5} SAR
          </Text>
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+966 5XX XXX XXX"
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleBooking}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating Booking...' : 'Confirm Booking'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  summary: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  summaryTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  form: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.bodySmall,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    ...theme.typography.body,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...theme.typography.h3,
    color: theme.colors.white,
  },
});
```

---

## Schedule Implementation

### Time Slot Utilities

```typescript
// src/utils/timeSlots.ts
import { format, addMinutes, isWithinInterval, parseISO } from 'date-fns';

export interface TimeSlot {
  time: string;
  startMinutes: number;
  endMinutes: number;
  isAvailable: boolean;
}

export const generateTimeSlots = (startHour: number, endHour: number): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    // Add :00 slot
    slots.push({
      time: `${hour.toString().padStart(2, '0')}:00`,
      startMinutes: hour * 60,
      endMinutes: hour * 60 + 30,
      isAvailable: true,
    });
    
    // Add :30 slot
    slots.push({
      time: `${hour.toString().padStart(2, '0')}:30`,
      startMinutes: hour * 60 + 30,
      endMinutes: (hour + 1) * 60,
      isAvailable: true,
    });
  }
  
  return slots;
};

export const checkSlotAvailability = (slot: TimeSlot, bookings: any[]): boolean => {
  if (!bookings || bookings.length === 0) return true;
  
  return !bookings.some((booking) => {
    const bookingStart = new Date(booking.startDateTime);
    const bookingEnd = new Date(booking.endDateTime);
    
    const slotStartHour = Math.floor(slot.startMinutes / 60);
    const slotStartMinute = slot.startMinutes % 60;
    const slotStart = new Date(bookingStart);
    slotStart.setHours(slotStartHour, slotStartMinute, 0, 0);
    
    const slotEndHour = Math.floor(slot.endMinutes / 60);
    const slotEndMinute = slot.endMinutes % 60;
    const slotEnd = new Date(bookingStart);
    slotEnd.setHours(slotEndHour, slotEndMinute, 0, 0);
    
    // Check if slot overlaps with booking
    return (
      (slotStart >= bookingStart && slotStart < bookingEnd) ||
      (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
      (slotStart <= bookingStart && slotEnd >= bookingEnd)
    );
  });
};

export const formatTimeSlot = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
};
```

---

## Best Practices

### 1. State Management with Zustand

```typescript
// src/store/bookingStore.ts
import { create } from 'zustand';

interface BookingState {
  selectedCourt: Court | null;
  selectedDate: string | null;
  selectedSlot: TimeSlot | null;
  customerInfo: {
    name: string;
    phone: string;
  };
  setSelectedCourt: (court: Court) => void;
  setSelectedDate: (date: string) => void;
  setSelectedSlot: (slot: TimeSlot) => void;
  setCustomerInfo: (info: any) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedCourt: null,
  selectedDate: null,
  selectedSlot: null,
  customerInfo: { name: '', phone: '' },
  setSelectedCourt: (court) => set({ selectedCourt: court }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),
  setCustomerInfo: (info) => set({ customerInfo: info }),
  reset: () => set({
    selectedCourt: null,
    selectedDate: null,
    selectedSlot: null,
    customerInfo: { name: '', phone: '' },
  }),
}));
```

### 2. React Query for API Calls

```typescript
// Example usage in screen
import { useQuery } from '@tanstack/react-query';

const { data: courts, isLoading } = useQuery({
  queryKey: ['courts', clubId],
  queryFn: () => clubApi.getCourts(clubId),
});
```

### 3. Form Validation

```typescript
// src/utils/validation.ts
import * as yup from 'yup';

export const bookingFormSchema = yup.object({
  name: yup.string()
    .required('Name is required')
    .min(3, 'Name must be at least 3 characters'),
  phone: yup.string()
    .required('Phone is required')
    .matches(/^\+?[0-9]{10,}$/, 'Invalid phone number'),
});
```

---

## Navigation Structure

```typescript
// src/navigation/RootNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const BookingStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="CourtSelection" component={CourtSelectionScreen} />
    <Stack.Screen name="DateTimeSelection" component={DateTimeSelectionScreen} />
    <Stack.Screen name="BookingForm" component={BookingFormScreen} />
    <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
  </Stack.Navigator>
);

const RootNavigator = () => (
  <NavigationContainer>
    <Tab.Navigator>
      <Tab.Screen
        name="Book"
        component={BookingStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="My Bookings"
        component={MyBookingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="list" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  </NavigationContainer>
);
```

---

## Deployment Checklist

### iOS
1. Update `API_BASE_URL` to production URL
2. Configure `Info.plist` for permissions
3. Build with Xcode
4. Submit to App Store

### Android
1. Update `API_BASE_URL` to production URL
2. Configure `AndroidManifest.xml`
3. Build APK/AAB
4. Submit to Google Play

---

## Key Differences: Admin vs Customer App

| Feature | Admin Dashboard | Customer App |
|---------|----------------|--------------|
| **Authentication** | Required (JWT) | Optional (Phone-based) |
| **Booking Management** | Full CRUD | Create only |
| **View** | All bookings | Own bookings only |
| **Payment** | Record payments | View payment status |
| **Courts** | Manage courts | View available courts |
| **Schedule** | Full day view with drag-drop | Available slots only |
| **Platform** | Web (React) | Mobile (React Native) |

---

## Next Steps

1. **Phase 1:** Build basic booking flow (Courts → Date/Time → Form → Confirmation)
2. **Phase 2:** Add customer authentication (Phone OTP)
3. **Phase 3:** Implement "My Bookings" with cancellation
4. **Phase 4:** Add push notifications for booking reminders
5. **Phase 5:** Integrate payment gateway

Would you like me to:
1. Create detailed component code for any specific screen?
2. Provide the complete navigation setup?
3. Add authentication flow with OTP?
4. Create the state management structure?
