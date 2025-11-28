import axios from 'axios';
import type { CreateClosedDateRequest } from '../types';

const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('admin_refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('admin_access_token', accessToken);
        localStorage.setItem('admin_refresh_token', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Token refresh failed, clear storage and redirect to login
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth endpoints
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data;
  },

  logout: async () => {
    const token = localStorage.getItem('admin_access_token');
    if (token) {
      await api.post('/auth/logout');
    }
  },

  refreshToken: async (refreshToken: string) => {
    const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
    return response.data;
  },

  // Club endpoints
  getClubs: async () => {
    const response = await api.get('/clubs');
    return response.data;
  },

  getClub: async (clubId: string) => {
    const response = await api.get(`/clubs/${clubId}`);
    return response.data;
  },

  // Court endpoints
  getCourts: async (clubId: string) => {
    const response = await api.get(`/clubs/${clubId}/courts`);
    return response.data;
  },

  createCourt: async (clubId: string, data: any) => {
    const response = await api.post(`/clubs/${clubId}/courts`, data);
    return response.data;
  },

  updateCourt: async (courtId: string, data: any) => {
    const response = await api.patch(`/courts/${courtId}`, data);
    return response.data;
  },

  deleteCourt: async (courtId: string) => {
    const response = await api.delete(`/courts/${courtId}`);
    return response.data;
  },

  // Schedule endpoints
  getDaySchedule: async (clubId: string, date: string) => {
    const response = await api.get(`/clubs/${clubId}/schedule/day?date=${date}`);
    return response.data; // Return just the courts array
  },

  getWeekSchedule: async (clubId: string, startDate: string) => {
    // Calculate end date (7 days from start)
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const endDate = end.toISOString().split('T')[0];
    
    const response = await api.get(`/clubs/${clubId}/schedule/week?from=${startDate}&to=${endDate}`);
    return response.data;
  },

  getMonthSchedule: async (clubId: string, year: number, month: number) => {
    // Calculate first and last day of month
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0); // Day 0 of next month = last day of current month
    
    const fromDate = firstDay.toISOString().split('T')[0];
    const toDate = lastDay.toISOString().split('T')[0];
    
    // Use the week endpoint with from/to params for month range
    const response = await api.get(`/clubs/${clubId}/schedule/week?from=${fromDate}&to=${toDate}`);
    return response.data;
  },

  // Booking endpoints
  createBooking: async (clubId: string, data: any) => {
    const response = await api.post(`/clubs/${clubId}/bookings`, data);
    return response.data;
  },

  createFixedBooking: async (clubId: string, data: any) => {
    const response = await api.post(`/clubs/${clubId}/bookings`, data);
    return response.data;
  },

  updateBooking: async (clubId: string, bookingId: string, data: any) => {
    const response = await api.patch(`/clubs/${clubId}/bookings/${bookingId}`, data);
    return response.data;
  },

  dragDropBooking: async (clubId: string, bookingId: string, data: any) => {
    const response = await api.put(`/clubs/${clubId}/bookings/${bookingId}/drag-drop`, data);
    return response.data;
  },

  deleteBooking: async (clubId: string, bookingId: string) => {
    const response = await api.delete(`/clubs/${clubId}/bookings/${bookingId}`);
    return response.data;
  },

  getBooking: async (clubId: string, bookingId: string) => {
    const response = await api.get(`/clubs/${clubId}/bookings/${bookingId}`);
    return response.data;
  },

  // Customer endpoints
  getCustomers: async (clubId: string, search?: string) => {
    const url = search 
      ? `/clubs/${clubId}/customers?search=${encodeURIComponent(search)}`
      : `/clubs/${clubId}/customers`;
    const response = await api.get(url);
    return response.data;
  },

  createCustomer: async (clubId: string, data: any) => {
    const response = await api.post(`/clubs/${clubId}/customers`, data);
    return response.data;
  },

  updateCustomer: async (customerId: string, data: any) => {
    const response = await api.patch(`/customers/${customerId}`, data);
    return response.data;
  },

  // Coach endpoints
  getCoaches: async (clubId: string) => {
    const response = await api.get(`/clubs/${clubId}/coaches`);
    return response.data;
  },

  createCoach: async (clubId: string, data: any) => {
    const response = await api.post(`/clubs/${clubId}/coaches`, data);
    return response.data;
  },

  updateCoach: async (coachId: string, data: any) => {
    const response = await api.patch(`/coaches/${coachId}`, data);
    return response.data;
  },

  // Payment endpoints
  getClubPayments: async (clubId: string, startDate?: string, endDate?: string) => {
    let url = `/clubs/${clubId}/payments`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get(url);
    return response.data;
  },

  createPayment: async (clubId: string, data: any) => {
    const response = await api.post(`/clubs/${clubId}/payments`, data);
    return response.data;
  },

  // Booking Categories
  getBookingCategories: async (clubId: string) => {
    const response = await api.get(`/clubs/${clubId}/booking-categories`);
    return response.data;
  },

  createBookingCategory: async (clubId: string, data: any) => {
    const response = await api.post(`/clubs/${clubId}/booking-categories`, data);
    return response.data;
  },

  updateBookingCategory: async (categoryId: string, data: any) => {
    const response = await api.patch(`/booking-categories/${categoryId}`, data);
    return response.data;
  },

  deleteBookingCategory: async (categoryId: string) => {
    const response = await api.delete(`/booking-categories/${categoryId}`);
    return response.data;
  },

  // Closed Dates endpoints
  getClosedDates: async (clubId: string) => {
    const response = await api.get(`/clubs/${clubId}/closed-dates`);
    return response.data;
  },

  createClosedDate: async (clubId: string, data: CreateClosedDateRequest) => {
    const response = await api.post(`/clubs/${clubId}/closed-dates`, data);
    return response.data;
  },

  deleteClosedDate: async (closedDateId: string) => {
    const response = await api.delete(`/closed-dates/${closedDateId}`);
    return response.data;
  },
};

export default api;
