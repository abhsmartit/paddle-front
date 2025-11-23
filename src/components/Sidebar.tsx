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
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

const Sidebar = ({ activeItem, onItemClick }: SidebarProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const menuItems = [
    { id: 'schedule', label: t('schedule'), icon: Calendar, section: 'SCHEDULE' },
    { id: 'fixed-booking', label: t('fixedBooking'), icon: Repeat, section: 'SCHEDULE' },
    { id: 'booking-categories', label: t('bookingCategories'), icon: Grid3x3, section: 'SCHEDULE' },
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
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">🎾</div>
        </div>
      </div>

      <div className="sidebar-content">
        <div className="menu-section">
          <div className="section-title">SCHEDULE</div>
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`menu-item ${activeItem === item.id ? 'active' : ''}`}
              onClick={() => onItemClick(item.id)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="menu-section">
          <div className="section-title">COACHES</div>
          {coachItems.map((item) => (
            <div
              key={item.id}
              className={`menu-item ${activeItem === item.id ? 'active' : ''}`}
              onClick={() => onItemClick(item.id)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="menu-section">
          <div className="section-title">BILLING</div>
          {billingItems.map((item) => (
            <div
              key={item.id}
              className={`menu-item ${activeItem === item.id ? 'active' : ''}`}
              onClick={() => onItemClick(item.id)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.fullName?.charAt(0).toUpperCase() || 'A'}</div>
          <div className="user-details">
            <div className="user-name">{user?.fullName || 'Admin'}</div>
            <div className="user-email">{user?.email || 'admin@padelclub.com'}</div>
          </div>
          <LogOut 
            size={18} 
            className="logout-icon" 
            onClick={() => onItemClick('logout')}
            style={{ cursor: 'pointer' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
