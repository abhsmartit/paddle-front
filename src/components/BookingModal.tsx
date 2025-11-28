import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Calendar, Repeat, Dumbbell, Home, Trash2, Search, Clock, User, Phone, DollarSign } from 'lucide-react';
import { apiService } from '../services/api';
import type { Court, ApiBookingCategory, CreateBookingRequest, CreateFixedBookingRequest, ClosedDate, Coach } from '../types';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  VisuallyHidden,
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
import { cn } from '@/lib/utils';

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
  const [bookingPrice, setBookingPrice] = useState('');
  const [totalReceived, setTotalReceived] = useState('');
  const [paidAtStadium, setPaidAtStadium] = useState(false);
  const [categories, setCategories] = useState<ApiBookingCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  
  // Fixed booking specific states
  const [endDate, setEndDate] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  
  // Coach booking specific states
  const [selectedCoach, setSelectedCoach] = useState('');
  const [coaches, setCoaches] = useState<Coach[]>([]);

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
    }
  }, [clubId]);

  const loadCategories = useCallback(async () => {
    try {
      const categoriesData = await apiService.getBookingCategories(clubId);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, [clubId]);

  const loadCoaches = useCallback(async () => {
    try {
      const coachesData = await apiService.getCoaches(clubId);
      setCoaches(coachesData);
    } catch (err) {
      console.error('Failed to load coaches:', err);
    }
  }, [clubId]);

  useEffect(() => {
    if (isOpen && clubId) {
      loadCategories();
      loadClosedDates();
      loadCoaches();
      if (courts.length > 0 && !selectedCourt) {
        setSelectedCourt(courts[0].id || courts[0]._id || '');
      }
      if (courts.length > 0 && !bookingPrice) {
        const court = courts.find(c => (c.id || c._id) === (selectedCourt || courts[0].id || courts[0]._id));
        if (court?.defaultPricePerHour) {
          const durationHours = parseInt(duration) / 60;
          setBookingPrice((court.defaultPricePerHour * durationHours).toString());
        }
      }
    }
  }, [isOpen, clubId, courts, loadCategories, loadClosedDates, loadCoaches, selectedCourt, bookingPrice, duration]);

  useEffect(() => {
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
      if (customersData.length === 1) {
        const customer = customersData[0];
        setBookingName(customer.fullName);
        setSelectedCustomerId(customer._id);
        toast.success(`Found: ${customer.fullName}`);
      } else if (customersData.length > 1) {
        toast.success(`Found ${customersData.length} customers`);
      } else {
        toast.error('No customer found');
      }
    } catch (err) {
      console.error('Failed to search customers:', err);
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const fullDaysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  const handleAddClosedDate = async () => {
    if (!newClosedDate || !closedReason) {
      toast.error('Please fill in both date and reason');
      return;
    }
    try {
      setLoading(true);
      await apiService.createClosedDate(clubId, { closedDate: newClosedDate, reason: closedReason });
      toast.success('Closed date added successfully');
      setNewClosedDate('');
      setClosedReason('');
      await loadClosedDates();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add closed date');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClosedDate = async (closedDateId: string) => {
    if (!window.confirm('Are you sure you want to delete this closed date?')) return;
    try {
      setLoading(true);
      await apiService.deleteClosedDate(closedDateId);
      toast.success('Closed date deleted successfully');
      await loadClosedDates();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete closed date');
    } finally {
      setLoading(false);
    }
  };

  const formatDisplayDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const isDateClosed = (dateString: string) => {
    if (!dateString) return false;
    return closedDates.some(cd => cd.closedDate === dateString);
  };

  const formatDateForComparison = (date: Date) => date.toISOString().split('T')[0];

  if (!isOpen) return null;

  const durationOptions = [
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (activeTab === 'close') {
      setLoading(false);
      return;
    }

    // Validation
    if (!bookingName.trim()) { setError('Booking name is required'); setLoading(false); return; }
    if (!phoneNumber.trim()) { setError('Phone number is required'); setLoading(false); return; }
    if (!selectedCourt) { setError('Please select a court'); setLoading(false); return; }
    if (!bookingPrice || parseFloat(bookingPrice) <= 0) { setError('Please enter a valid price'); setLoading(false); return; }
    if (isDateClosed(startingDate)) { setError('Cannot book on a closed date'); setLoading(false); return; }

    if (activeTab === 'fixed') {
      if (!endDate) { setError('End date is required for fixed bookings'); setLoading(false); return; }
      if (selectedDays.length === 0) { setError('Please select at least one day'); setLoading(false); return; }
    }

    if (activeTab === 'coach' && !selectedCoach) {
      setError('Please select a coach');
      setLoading(false);
      return;
    }

    try {
      const [hours, minutes] = startTime.split(':').map(Number);
      const startDateTime = new Date(startingDate);
      startDateTime.setHours(hours, minutes, 0, 0);
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + parseInt(duration));

      if (activeTab === 'single' || activeTab === 'coach') {
        const bookingData: CreateBookingRequest = {
          courtId: selectedCourt,
          bookingName: bookingName.trim(),
          phone: phoneNumber.trim(),
          bookingType: activeTab === 'coach' ? 'COACH'  : activeTab === 'single' ?  'SINGLE' : 'FIXED',
          startDateTime: startDateTime.toISOString(),
          endDateTime: endDateTime.toISOString(),
          price: parseFloat(bookingPrice),
        };
        if (selectedCustomerId) bookingData.customerId = selectedCustomerId;
        if (selectedCategory) bookingData.bookingCategoryId = selectedCategory;
        if (notes) bookingData.notes = notes;
        if (activeTab === 'coach' && selectedCoach) bookingData.coachId = selectedCoach;

        await apiService.createBooking(clubId, bookingData);
      } else if (activeTab === 'fixed') {
        const fixedBookingData: CreateFixedBookingRequest = {
          courtId: selectedCourt,
          bookingName: bookingName.trim(),
          phone: phoneNumber.trim(),
          bookingType: "FIXED",
          startDateTime: startDateTime.toISOString(),
          durationMinutes: parseInt(duration),
          repeatedDaysOfWeek: selectedDays.map((day) => fullDaysOfWeek[daysOfWeek.indexOf(day)] || day),
          recurrenceEndDate: endDate,
          price: parseFloat(bookingPrice),
        };
        if (selectedCustomerId) fixedBookingData.customerId = selectedCustomerId;
        if (selectedCategory) fixedBookingData.bookingCategoryId = selectedCategory;
        if (notes) fixedBookingData.notes = notes;

        await apiService.createFixedBooking(clubId, fixedBookingData);
      }

      resetForm();
      if (onBookingCreated) onBookingCreated();
      toast.success('Booking created successfully!');
      onClose();
    } catch (err) {
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

  // Styled Input Component
  const StyledInput = ({ icon: Icon, className: inputClassName, ...props }: any) => (
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <Input
        {...props}
        className={cn(
          "h-10 rounded-lg border bg-background",
          "focus:border-primary focus:ring-1 focus:ring-primary/20",
          Icon && "pl-10",
          inputClassName
        )}
      />
    </div>
  );

  // Styled Select Component
  const StyledSelect = ({ value, onValueChange, placeholder, children }: any) => (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-10 rounded-lg border bg-background">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-lg border shadow-md bg-background">
        {children}
      </SelectContent>
    </Select>
  );

  // Common Form Fields Component
  const CommonFields = () => (
    <>
      {/* Customer Info Card */}
      <Card className="rounded-lg border bg-card shadow-sm">
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Name *</Label>
              <StyledInput
                icon={User}
                type="text"
                value={bookingName}
                onChange={(e: any) => setBookingName(e.target.value)}
                placeholder="Customer name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Phone *</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <StyledInput
                    icon={Phone}
                    type="tel"
                    value={phoneNumber}
                    onChange={(e: any) => setPhoneNumber(e.target.value)}
                    placeholder="+966 xxx xxx xxx"
                    required
                  />
                </div>
                <Button 
                  type="button" 
                  variant="outline"
                  size="icon"
                  onClick={searchCustomer}
                  className="h-10 w-10 rounded-lg"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Card */}
      <Card className="rounded-lg border bg-card shadow-sm">
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Schedule Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date *</Label>
              <StyledInput
                type="date"
                value={startingDate}
                onChange={(e: any) => {
                  if (isDateClosed(e.target.value)) {
                    setError('This date is closed');
                  } else {
                    setError(null);
                  }
                  setStartingDate(e.target.value);
                }}
                min={formatDateForComparison(new Date())}
                className={isDateClosed(startingDate) ? 'border-destructive' : ''}
              />
              {isDateClosed(startingDate) && (
                <p className="text-xs text-destructive">⚠️ This date is closed</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Time *</Label>
              <StyledInput
                type="time"
                value={startTime}
                onChange={(e: any) => setStartTime(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Duration *</Label>
              <StyledSelect value={duration} onValueChange={setDuration} placeholder="Select duration">
                {durationOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                    {opt.label}
                  </SelectItem>
                ))}
              </StyledSelect>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Court *</Label>
              <StyledSelect value={selectedCourt} onValueChange={setSelectedCourt} placeholder="Select court">
                {courts.filter(c => c.id || c._id).map((court) => (
                  <SelectItem key={court.id || court._id} value={(court.id || court._id)!} className="rounded-lg">
                    {court.name}
                  </SelectItem>
                ))}
              </StyledSelect>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Card */}
      <Card className="rounded-lg border bg-card shadow-sm">
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Price (SAR) *</Label>
              <StyledInput
                type="number"
                value={bookingPrice}
                onChange={(e: any) => setBookingPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Received (SAR)</Label>
              <StyledInput
                type="number"
                value={totalReceived}
                onChange={(e: any) => setTotalReceived(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Category</Label>
            <StyledSelect 
              value={selectedCategory || 'none'} 
              onValueChange={(v: string) => setSelectedCategory(v === 'none' ? '' : v)} 
              placeholder="Select category"
            >
              <SelectItem value="none" className="rounded-lg">No Category</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id} className="rounded-lg">
                  {cat.name}
                </SelectItem>
              ))}
            </StyledSelect>
          </div>
          <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
            <Label htmlFor="paidAtStadium" className="text-sm cursor-pointer">
              Paid at Stadium
            </Label>
            <Switch id="paidAtStadium" checked={paidAtStadium} onCheckedChange={setPaidAtStadium} />
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Notes</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes..."
          rows={2}
          className="rounded-lg border bg-background resize-none"
        />
      </div>
    </>
  );

  // Fixed Booking Extra Fields
  const FixedBookingFields = () => (
    <Card className="rounded-lg border border-primary/20 bg-primary/5 shadow-sm">
      <CardHeader className="pb-3 pt-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Repeat className="h-4 w-4 text-primary" />
          Recurrence Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">End Date *</Label>
          <StyledInput
            type="date"
            value={endDate}
            onChange={(e: any) => setEndDate(e.target.value)}
            min={startingDate}
          />
        </div>
        <div className="space-y-3">
          <Label className="text-sm font-medium">Repeat on *</Label>
          <div className="flex flex-wrap gap-1.5">
            {daysOfWeek.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={cn(
                  "h-9 w-11 rounded-md text-xs font-medium transition-colors",
                  "border",
                  selectedDays.includes(day)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:border-primary hover:bg-primary/5"
                )}
              >
                {day}
              </button>
            ))}
          </div>
          {selectedDays.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Selected: {selectedDays.join(', ')}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Payment Method</Label>
          <StyledSelect value={paymentMethod} onValueChange={setPaymentMethod} placeholder="Select method">
            <SelectItem value="Cash" className="rounded-lg">Cash</SelectItem>
            <SelectItem value="Card" className="rounded-lg">Card</SelectItem>
            <SelectItem value="Bank Transfer" className="rounded-lg">Bank Transfer</SelectItem>
          </StyledSelect>
        </div>
      </CardContent>
    </Card>
  );

  // Coach Booking Extra Fields
  const CoachBookingFields = () => (
    <Card className="rounded-lg border border-orange-500/20 bg-orange-500/5 shadow-sm">
      <CardHeader className="pb-3 pt-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-orange-500" />
          Coach Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Select Coach *</Label>
          <StyledSelect value={selectedCoach || 'none'} onValueChange={(v: string) => setSelectedCoach(v === 'none' ? '' : v)} placeholder="Choose a coach">
            <SelectItem value="none" className="rounded-lg">No Coach Selected</SelectItem>
            {coaches.filter(c => c.isActive).map((coach) => (
              <SelectItem key={coach._id} value={coach._id} className="rounded-lg">
                {coach.name || coach.fullName}
              </SelectItem>
            ))}
          </StyledSelect>
        </div>
        {coaches.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No coaches available. Please add coaches first.
          </p>
        )}
        {selectedCoach && (
          <p className="text-xs text-muted-foreground">
            Coach bookings will be tracked separately for reporting
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={false}>
      <DialogContent 
        className="w-[95vw] max-w-4xl max-h-[92vh] p-0 gap-0 rounded-xl border bg-background flex flex-col overflow-hidden [&>button]:top-3 [&>button]:right-3"
        aria-describedby={undefined}
        onOverlayClick={onClose}
      >
        <VisuallyHidden.Root asChild>
          <DialogTitle>Create Booking</DialogTitle>
        </VisuallyHidden.Root>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as BookingTab)} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="px-4 sm:px-6 pt-4 pb-2 shrink-0 pr-12">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1 rounded-lg bg-muted">
              <TabsTrigger value="single" className="rounded-md py-2 px-1 sm:px-3 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Calendar className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Single</span>
              </TabsTrigger>
              <TabsTrigger value="fixed" className="rounded-md py-2 px-1 sm:px-3 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Repeat className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Fixed</span>
              </TabsTrigger>
              <TabsTrigger value="coach" className="rounded-md py-2 px-1 sm:px-3 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Dumbbell className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Coach</span>
              </TabsTrigger>
              <TabsTrigger value="close" className="rounded-md py-2 px-1 sm:px-3 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Home className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Close</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6">
            {/* Single Booking Tab */}
            <TabsContent value="single" className="mt-0 pb-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                    {error}
                  </div>
                )}
                <CommonFields />
                <div className="flex gap-3 pt-4 sticky bottom-0 bg-background pb-2">
                  <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="flex-1 h-10 rounded-lg">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1 h-10 rounded-lg">
                    {loading ? 'Creating...' : 'Create Booking'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Fixed Booking Tab */}
            <TabsContent value="fixed" className="mt-0 pb-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                    {error}
                  </div>
                )}
                <CommonFields />
                <FixedBookingFields />
                <div className="flex gap-3 pt-4 sticky bottom-0 bg-background pb-2">
                  <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="flex-1 h-10 rounded-lg">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1 h-10 rounded-lg">
                    {loading ? 'Creating...' : 'Create Fixed Booking'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Coach Booking Tab */}
            <TabsContent value="coach" className="mt-0 pb-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                    {error}
                  </div>
                )}
                <CoachBookingFields />
                <CommonFields />
                <div className="flex gap-3 pt-4 sticky bottom-0 bg-background pb-2">
                  <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="flex-1 h-10 rounded-lg">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1 h-10 rounded-lg bg-orange-500 hover:bg-orange-600">
                    {loading ? 'Creating...' : 'Create Coach Booking'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Close Stadium Tab */}
            <TabsContent value="close" className="mt-0 pb-4">
              <div className="space-y-4">
                <Card className="rounded-lg border bg-card shadow-sm">
                  <CardHeader className="pb-3 pt-4">
                    <CardTitle className="text-sm font-medium">Add Closed Date</CardTitle>
                    <CardDescription>Close the stadium for maintenance or holidays</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Date</Label>
                        <StyledInput
                          type="date"
                          value={newClosedDate}
                          onChange={(e: any) => setNewClosedDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Reason</Label>
                        <StyledInput
                          type="text"
                          value={closedReason}
                          onChange={(e: any) => setClosedReason(e.target.value)}
                          placeholder="e.g., Maintenance"
                        />
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      onClick={handleAddClosedDate}
                      disabled={loading || !newClosedDate || !closedReason}
                      className="w-full h-10 rounded-lg"
                    >
                      {loading ? 'Adding...' : 'Add Closed Date'}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="rounded-lg border bg-card shadow-sm">
                  <CardHeader className="pb-3 pt-4">
                    <CardTitle className="text-sm font-medium">Closed Dates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {closedDates.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground border border-dashed rounded-lg">
                        <Home className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No closed dates scheduled</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {closedDates
                          .sort((a, b) => new Date(a.closedDate).getTime() - new Date(b.closedDate).getTime())
                          .map((cd) => (
                          <div key={cd._id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
                            <div>
                              <div className="font-medium text-sm">{formatDisplayDate(cd.closedDate)}</div>
                              <div className="text-xs text-muted-foreground">{cd.reason}</div>
                            </div>
                            <Button 
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClosedDate(cd._id)}
                              disabled={loading}
                              className="h-8 w-8 p-0 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
