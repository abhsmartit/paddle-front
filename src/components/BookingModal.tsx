import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Calendar, Repeat, Dumbbell, Home, Trash2 } from 'lucide-react';
import { apiService } from '../services/api';
import type { Court, ApiBookingCategory, CreateBookingRequest, CreateFixedBookingRequest, ClosedDate } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import './BookingModal.css';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  courts: Court[];
  selectedDate?: Date;
  clubId: string;
  onBookingCreated?: () => void;
}

type BookingTab = 'single' | 'fixed' | 'coach' | 'close';

const BookingModal = ({ isOpen, onClose, courts, selectedDate, clubId, onBookingCreated }: BookingModalProps) => {
  const [activeTab, setActiveTab] = useState<BookingTab>('single');
  const [bookingName, setBookingName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [duration, setDuration] = useState('60');
  const [startTime, setStartTime] = useState('17:30');
  const [startingDate, setStartingDate] = useState(
    selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [selectedCourt, setSelectedCourt] = useState('');
  const [bookingType, setBookingType] = useState<'SINGLE' | 'TEAM' | 'TOURNAMENT' | 'COACH'>('SINGLE');
  const [bookingPrice, setBookingPrice] = useState('');
  const [totalReceived, setTotalReceived] = useState('');
  const [paidAtStadium, setPaidAtStadium] = useState(false);
  const [categories, setCategories] = useState<ApiBookingCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  
  // Fixed booking specific states
  const [endDate, setEndDate] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  
  // Coach booking specific states
  const [selectedCoach, setSelectedCoach] = useState('');
  // const [coaches, setCoaches] = useState<Coach[]>([]);

  // Close Stadium specific states
  const [closedDates, setClosedDates] = useState<ClosedDate[]>([]);
  const [newClosedDate, setNewClosedDate] = useState('');
  const [closedReason, setClosedReason] = useState('');

  const loadClosedDates = useCallback(async () => {
    try {
      const closedDatesData = await apiService.getClosedDates(clubId);
      setClosedDates(closedDatesData);
    } catch (err) {
      console.error('Failed to load closed dates:', err);
      toast.error('Failed to load closed dates');
    }
  }, [clubId]);

  const loadCategories = useCallback(async () => {
    try {
      const categoriesData = await apiService.getBookingCategories(clubId);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to load categories:', err);
      toast.error('Failed to load booking categories');
    }
  }, [clubId]);

  const loadCoaches = useCallback(async () => {
    try {
      // const coachesData = await apiService.getCoaches(clubId);
      // setCoaches(coachesData);
    } catch (err) {
      console.error('Failed to load coaches:', err);
      toast.error('Failed to load coaches');
    }
  }, [clubId]);

  useEffect(() => {
    if (isOpen && clubId) {
      loadCategories();
      if (activeTab === 'coach') {
        loadCoaches();
      }
      if (activeTab === 'close') {
        loadClosedDates();
      }
      // Set default court if available
      if (courts.length > 0 && !selectedCourt) {
        setSelectedCourt(courts[0].id || courts[0]._id || '');
      }
      // Calculate default price
      if (courts.length > 0 && !bookingPrice) {
        const court = courts.find(c => (c.id || c._id) === (selectedCourt || courts[0].id || courts[0]._id));
        if (court?.defaultPricePerHour) {
          const durationHours = parseInt(duration) / 60;
          setBookingPrice((court.defaultPricePerHour * durationHours).toString());
        }
      }
    }
  }, [isOpen, clubId, courts, activeTab, loadCategories, loadCoaches, loadClosedDates, selectedCourt, bookingPrice, duration]);

  useEffect(() => {
    // Recalculate price when court or duration changes
    if (selectedCourt && duration) {
      const court = courts.find(c => (c.id || c._id) === selectedCourt);
      if (court?.defaultPricePerHour) {
        const durationHours = parseInt(duration) / 60;
        const calculatedPrice = court.defaultPricePerHour * durationHours;
        setBookingPrice(calculatedPrice.toString());
      }
    }
  }, [selectedCourt, duration, courts]);

  const searchCustomer = async () => {
    if (!phoneNumber || phoneNumber.length < 3) return;
    
    try {
      const customersData = await apiService.getCustomers(clubId, phoneNumber);
      // setCustomers(customersData);
      
      if (customersData.length === 1) {
        const customer = customersData[0];
        setBookingName(customer.fullName);
        setSelectedCustomerId(customer._id);
      }
    } catch (err) {
      console.error('Failed to search customers:', err);
      toast.error('Failed to search customers');
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  const handleAddClosedDate = async () => {
    if (!newClosedDate || !closedReason) {
      toast.error('Please fill in both date and reason');
      return;
    }

    try {
      setLoading(true);
      await apiService.createClosedDate(clubId, {
        closedDate: newClosedDate,
        reason: closedReason
      });
      toast.success('Closed date added successfully');
      setNewClosedDate('');
      setClosedReason('');
      await loadClosedDates();
    } catch (err: any) {
      console.error('Failed to add closed date:', err);
      toast.error(err.response?.data?.message || 'Failed to add closed date');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClosedDate = async (closedDateId: string) => {
    if (!window.confirm('Are you sure you want to delete this closed date?')) {
      return;
    }

    try {
      setLoading(true);
      await apiService.deleteClosedDate(closedDateId);
      toast.success('Closed date deleted successfully');
      await loadClosedDates();
    } catch (err: any) {
      console.error('Failed to delete closed date:', err);
      toast.error(err.response?.data?.message || 'Failed to delete closed date');
    } finally {
      setLoading(false);
    }
  };

  const formatDisplayDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Helper function to check if a date is closed
  const isDateClosed = (dateString: string) => {
    if (!dateString) return false;
    return closedDates.some(closedDate => 
      closedDate.closedDate === dateString
    );
  };

  // Helper function to format date for comparison (YYYY-MM-DD)
  const formatDateForComparison = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'single', label: 'Single Bookings', icon: Calendar },
    { id: 'fixed', label: 'Fixed Bookings', icon: Repeat },
    { id: 'coach', label: 'Coach Bookings', icon: Dumbbell },
    { id: 'close', label: 'Close Stadium', icon: Home },
  ];

  const durationOptions = [
    { value: '30', label: '30 minutes' },
    { value: '60', label: '60 minutes' },
    { value: '90', label: '90 minutes' },
    { value: '120', label: '120 minutes' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Handle close stadium tab differently
    if (activeTab === 'close') {
      setLoading(false);
      return; // Close tab doesn't create bookings
    }

    // Validation
    if (!bookingName.trim()) {
      setError('Booking name is required');
      setLoading(false);
      return;
    }

    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      setLoading(false);
      return;
    }

    if (!selectedCourt) {
      setError('Please select a court');
      setLoading(false);
      return;
    }

    if (!bookingPrice || parseFloat(bookingPrice) <= 0) {
      setError('Please enter a valid price');
      setLoading(false);
      return;
    }

    // Check if booking date is closed
    if (isDateClosed(startingDate)) {
      setError('Cannot book on a closed date. Please select a different date.');
      setLoading(false);
      return;
    }

    // Additional validation for fixed bookings
    if (activeTab === 'fixed') {
      if (!endDate) {
        setError('End date is required for fixed bookings');
        setLoading(false);
        return;
      }
      if (selectedDays.length === 0) {
        setError('Please select at least one day of the week');
        setLoading(false);
        return;
      }
      // Check if end date is closed for fixed bookings
      if (isDateClosed(endDate)) {
        setError('Cannot set end date on a closed date. Please select a different end date.');
        setLoading(false);
        return;
      }
    }

    // Additional validation for coach bookings
    if (activeTab === 'coach' && !selectedCoach) {
      setError('Please select a coach');
      setLoading(false);
      return;
    }

    try {
      // Parse start time (format: HH:mm)
      const [hours, minutes] = startTime.split(':').map(Number);
      const startDateTime = new Date(startingDate);
      startDateTime.setHours(hours, minutes, 0, 0);

      // Calculate end time based on duration
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + parseInt(duration));

      if (activeTab === 'single') {
        // Single booking
        const bookingData: CreateBookingRequest = {
          courtId: selectedCourt,
          bookingName: bookingName.trim(),
          phone: phoneNumber.trim(),
          bookingType: bookingType,
          startDateTime: startDateTime.toISOString(),
          endDateTime: endDateTime.toISOString(),
          price: parseFloat(bookingPrice),
        };

        // Add optional fields
        if (selectedCustomerId) {
          bookingData.customerId = selectedCustomerId;
        }

        if (selectedCategory) {
          bookingData.bookingCategoryId = selectedCategory;
        }

        if (notes) {
          bookingData.notes = notes;
        }

        await apiService.createBooking(clubId, bookingData);
      } else if (activeTab === 'fixed') {
        // Fixed booking - now supports multiple days of the week
        const fixedBookingData: CreateFixedBookingRequest = {
          courtId: selectedCourt,
          bookingName: bookingName.trim(),
          phone: phoneNumber.trim(),
          bookingType: "FIXED",
          startDateTime: startDateTime.toISOString(),
          durationMinutes: parseInt(duration),
          repeatedDaysOfWeek: selectedDays.map(day => day.toUpperCase()),
          recurrenceEndDate: endDate,
          price: parseFloat(bookingPrice),
        };

        if (selectedCustomerId) {
          fixedBookingData.customerId = selectedCustomerId;
        }

        if (selectedCategory) {
          fixedBookingData.bookingCategoryId = selectedCategory;
        }

        if (notes) {
          fixedBookingData.notes = notes;
        }

        await apiService.createFixedBooking(clubId, fixedBookingData);
      } else if (activeTab === 'coach') {
        // Coach booking - uses same endpoint as single booking but with COACH type
        const coachBookingData: CreateBookingRequest = {
          courtId: selectedCourt,
          coachId: selectedCoach,
          bookingName: bookingName.trim(),
          phone: phoneNumber.trim(),
          bookingType: 'COACH',
          startDateTime: startDateTime.toISOString(),
          endDateTime: endDateTime.toISOString(),
          price: parseFloat(bookingPrice),
        };

        if (selectedCustomerId) {
          coachBookingData.customerId = selectedCustomerId;
        }

        if (selectedCategory) {
          coachBookingData.bookingCategoryId = selectedCategory;
        }

        if (notes) {
          coachBookingData.notes = notes;
        }

        await apiService.createBooking(clubId, coachBookingData);
      }
      
      // Handle payment if received
      if (totalReceived && parseFloat(totalReceived) > 0) {
        // Payment will be handled in the next step
        // For now, we can create the booking with PAID status
      }

      // Reset form
      resetForm();

      // Call the callback if provided
      if (onBookingCreated) {
        onBookingCreated();
      }

      toast.success('Booking created successfully!');
      onClose();
    } catch (err) {
      console.error('Failed to create booking:', err);
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create booking';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setBookingName('');
    setPhoneNumber('');
    setDuration('60');
    setStartTime('17:30');
    setBookingPrice('');
    setTotalReceived('');
    setPaidAtStadium(false);
    setSelectedCategory('');
    setSelectedCustomerId('');
    setEndDate('');
    setSelectedDays([]);
    setPaymentMethod('Cash');
    setNotes('');
    setSelectedCoach('');
    setError(null);
  };

  // Render Close Stadium Tab Content
  const renderCloseStadiumTab = () => (
    <div className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Stadium Closed Dates</CardTitle>
          <CardDescription>
            Manage dates when the stadium will be closed for maintenance or holidays.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add new closed date */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Add New Closed Date</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newClosedDate">Date</Label>
                <Input
                  type="date"
                  id="newClosedDate"
                  value={newClosedDate}
                  onChange={(e) => setNewClosedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closedReason">Reason</Label>
                <Input
                  type="text"
                  id="closedReason"
                  value={closedReason}
                  onChange={(e) => setClosedReason(e.target.value)}
                  placeholder="e.g., New Year Day, Maintenance"
                />
              </div>
            </div>
            <Button 
              type="button" 
              onClick={handleAddClosedDate}
              disabled={loading || !newClosedDate || !closedReason}
            >
              {loading ? 'Adding...' : 'Add Closed Date'}
            </Button>
          </div>

          {/* Display existing closed dates */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Existing Closed Dates</h4>
            {closedDates.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground border border-dashed rounded-lg">
                <p>No closed dates scheduled. Stadium is available on all dates.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {closedDates
                  .sort((a, b) => new Date(a.closedDate).getTime() - new Date(b.closedDate).getTime())
                  .map((closedDate) => (
                  <div key={closedDate._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{formatDisplayDate(closedDate.closedDate)}</div>
                      <div className="text-sm text-muted-foreground">{closedDate.reason}</div>
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClosedDate(closedDate._id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Booking Management</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="single" value={activeTab} onValueChange={(value) => setActiveTab(value as BookingTab)}>
          <TabsList className="grid w-full grid-cols-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <Icon size={16} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="close" className="mt-6">
            <ScrollArea className="h-[60vh]">
              {renderCloseStadiumTab()}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="single" className="mt-6">
            <ScrollArea className="h-[60vh]">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {error}
                  </div>
                )}

                {/* Common fields for all booking types */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bookingName">Booking Name *</Label>
                    <Input
                      type="text"
                      id="bookingName"
                      value={bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      placeholder="Enter booking name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <div className="flex gap-2">
                      <Input
                        type="tel"
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+966 xxx xxx xxx"
                        required
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={searchCustomer}
                        className="px-3"
                      >
                        🔍
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Search by name or phone number, or click the search icon.
                    </p>
                  </div>
                </div>

                {/* Duration and time fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration *</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {durationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startTime">Starting Time *</Label>
                    <Input
                      type="time"
                      id="startTime"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Date and court selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startingDate">Starting Date *</Label>
                    <Input
                      type="date"
                      id="startingDate"
                      value={startingDate}
                      onChange={(e) => {
                        const selectedDate = e.target.value;
                        if (isDateClosed(selectedDate)) {
                          setError('This date is closed. Please select a different date.');
                        } else {
                          setError(null);
                        }
                        setStartingDate(selectedDate);
                      }}
                      min={formatDateForComparison(new Date())}
                      className={isDateClosed(startingDate) ? 'border-destructive' : ''}
                      required
                    />
                    {isDateClosed(startingDate) && (
                      <p className="text-xs text-destructive">
                        ⚠️ This date is closed: {closedDates.find(cd => cd.closedDate === startingDate)?.reason}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="selectPitch">Select Court *</Label>
                    <Select value={selectedCourt} onValueChange={setSelectedCourt}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a court" />
                      </SelectTrigger>
                      <SelectContent>
                        {courts.map((court) => (
                          <SelectItem key={court.id || court._id} value={court.id || court._id || ''}>
                            {court.name} {court.isActive === false ? '(Inactive)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Booking Type and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bookingType">Booking Type *</Label>
                    <Select value={bookingType} onValueChange={(value) => setBookingType(value as 'SINGLE' | 'TEAM' | 'TOURNAMENT')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select booking type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SINGLE">Single</SelectItem>
                        <SelectItem value="TEAM">Team</SelectItem>
                        <SelectItem value="TOURNAMENT">Tournament</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category (Optional)</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Category</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bookingPrice">Booking Price (SAR) *</Label>
                    <Input
                      type="number"
                      id="bookingPrice"
                      value={bookingPrice}
                      onChange={(e) => setBookingPrice(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalReceived">Total Received (SAR)</Label>
                    <Input
                      type="number"
                      id="totalReceived"
                      value={totalReceived}
                      onChange={(e) => setTotalReceived(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                {/* Payment Status */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="paidAtStadium"
                    checked={paidAtStadium}
                    onCheckedChange={setPaidAtStadium}
                  />
                  <Label htmlFor="paidAtStadium">Paid at Stadium</Label>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional notes..."
                    rows={3}
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Add Booking'}
                  </Button>
                </div>

            {/* Fixed Booking specific: Repeated Day and Court selection in second row */}
            {activeTab === 'fixed' && (
              <>
                <div className="form-group full-width">
                  <label htmlFor="selectPitch">Select Court *</label>
                  <select
                    id="selectPitch"
                    value={selectedCourt}
                    onChange={(e) => setSelectedCourt(e.target.value)}
                    required
                  >
                    <option value="">Choose a court</option>
                    {courts.map((court) => (
                      <option key={court.id || court._id} value={court.id || court._id}>
                        {court.name} {court.isActive === false ? '(Inactive)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Repeated Days of Week *</label>
                  <div className="days-selector">
                    {daysOfWeek.map((day) => (
                      <button
                        key={day}
                        type="button"
                        className={`day-button ${selectedDays.includes(day) ? 'selected' : ''}`}
                        onClick={() => toggleDay(day)}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                  {selectedDays.length > 0 && (
                    <div className="selected-days-info">
                      Selected: {selectedDays.join(', ')}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Show notes field for all tabs */}
            {(activeTab === 'fixed' || activeTab === 'single' || activeTab === 'coach') && (
              <div className="form-group full-width">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  rows={3}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e5e5e5' }}
                />
              </div>
            )}

            {/* Single and Fixed bookings: Booking Type row */}
            {activeTab !== 'coach' && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bookingType">Booking Type *</label>
                  <select
                    id="bookingType"
                    value={bookingType}
                    onChange={(e) => setBookingType(e.target.value as 'SINGLE' | 'TEAM' | 'TOURNAMENT')}
                    required
                  >
                    <option value="SINGLE">Single</option>
                    <option value="TEAM">Team</option>
                    <option value="TOURNAMENT">Tournament</option>
                  </select>
                </div>

                {activeTab === 'fixed' ? (
                  <div className="form-group">
                    <label htmlFor="paymentMethod">Payment Method *</label>
                    <select
                      id="paymentMethod"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      required
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                ) : (
                  <div className="form-group">
                    <label htmlFor="category">Category (Optional)</label>
                    <select
                      id="category"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="">No Category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Category for Coach and Fixed bookings */}
            {(activeTab === 'coach' || activeTab === 'fixed') && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category (Optional)</label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">No Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bookingPrice">Booking Price (SAR) *</label>
                <input
                  type="number"
                  id="bookingPrice"
                  value={bookingPrice}
                  onChange={(e) => setBookingPrice(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="totalReceived">Total Received (SAR)</label>
                <input
                  type="number"
                  id="totalReceived"
                  value={totalReceived}
                  onChange={(e) => setTotalReceived(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={paidAtStadium}
                    onChange={(e) => setPaidAtStadium(e.target.checked)}
                  />
                  <span>Paid at Stadium</span>
                </label>
              </div>
            </div>

            {/* Additional Notes for Fixed and Coach bookings */}
            {(activeTab === 'fixed' || activeTab === 'coach') && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="notes">Additional Notes</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Write notes here…"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Creating...' : 'Add Booking'}
              </button>
              </div>
              </form>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="fixed" className="mt-6">
            <ScrollArea className="h-[60vh]">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Fixed booking form - same content as single but with different fields */}
                <div className="text-sm text-muted-foreground">Fixed booking content will be rendered here</div>
              </form>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="coach" className="mt-6">
            <ScrollArea className="h-[60vh]">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Coach booking form */}
                <div className="text-sm text-muted-foreground">Coach booking content will be rendered here</div>
              </form>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;