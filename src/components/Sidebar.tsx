// src/components/Sidebar.tsx
import {
  Calendar,
  Repeat,
  Grid3x3,
  CreditCard,
  Users,
  User,
  Package,
  TrendingUp,
  BarChart3,
  LogOut,
  CalendarX,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ✅ Use your EXACT uploaded image
import padelHubLogo from "../assets/image.png";

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ activeItem, onItemClick, isMobile = false, onClose }: SidebarProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const menuItems = [
    { id: 'schedule', label: t('schedule'), icon: Calendar, section: 'SCHEDULE' },
    { id: 'fixed-booking', label: t('fixedBooking'), icon: Repeat, section: 'SCHEDULE' },
    { id: 'booking-categories', label: t('bookingCategories'), icon: Grid3x3, section: 'SCHEDULE' },
    { id: 'closed-dates', label: 'Closed Dates', icon: CalendarX, section: 'SCHEDULE' },
    { id: 'payment-methods', label: t('customPaymentMethods'), icon: CreditCard, section: 'SCHEDULE' },
    { id: 'waiting-list', label: t('waitingList'), icon: Users, section: 'SCHEDULE' },
  ];

  const coachItems = [
    { id: 'coaches', label: t('coaches'), icon: User, section: 'COACHES' },
    { id: 'coach-packages', label: t('coachPackages'), icon: Package, section: 'COACHES' },
    { id: 'coaches-reporting', label: t('coachesReporting'), icon: TrendingUp, section: 'COACHES' },
  ];

  const billingItems = [
    { id: 'reporting', label: t('reporting'), icon: BarChart3, section: 'BILLING' },
  ];

  return (
    <div className={cn(
      "w-60 h-full bg-card border-r border-border flex flex-col shrink-0",
      !isMobile && "hidden md:flex"
    )}>
      {/* Header with Logo */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex items-center justify-center">
            <img
              src={padelHubLogo}
              alt="The Padel Hub"
              className="h-8 w-auto object-contain max-w-[200px] dark:brightness-0 dark:invert"
            />
          </div>
          {isMobile && onClose && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 -mr-2"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Content */}
      <ScrollArea className="flex-1 p-4">
        <nav className="space-y-8">
          {/* Schedule Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
              SCHEDULE
            </h3>
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeItem === item.id ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "w-full justify-start h-9 px-2 font-normal",
                    activeItem === item.id && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => onItemClick(item.id)}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  <span className="truncate">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Coaches Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
              COACHES
            </h3>
            <div className="space-y-1">
              {coachItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeItem === item.id ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "w-full justify-start h-9 px-2 font-normal",
                    activeItem === item.id && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => onItemClick(item.id)}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  <span className="truncate">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Billing Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
              BILLING
            </h3>
            <div className="space-y-1">
              {billingItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeItem === item.id ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "w-full justify-start h-9 px-2 font-normal",
                    activeItem === item.id && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => onItemClick(item.id)}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  <span className="truncate">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </nav>
      </ScrollArea>

      {/* Footer with User Info */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
            {user?.fullName?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.fullName || 'Admin'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || 'admin@padelclub.com'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onItemClick('logout')}
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
