import React from 'react';
import { X, Calendar, Clock, User, Phone, CreditCard, Tag, MapPin } from 'lucide-react';
import type { Booking } from '../types';
import './BookingDetailsModal.css';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  courtName?: string;
}

const formatTimeTo12Hour = (time: string) => {
  const [hStr, mStr] = time.split(':');
  const h = Number(hStr);
  const m = Number(mStr || '0');
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  const minute = m.toString().padStart(2, '0');
  return `${displayHour}:${minute} ${period}`;
};

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  isOpen,
  onClose,
  booking,
  courtName = 'Court',
}) => {
  if (!isOpen) return null;

  return (
    <div className="booking-details-overlay" onClick={onClose}>
      <div className="booking-details-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="booking-details-header">
          <h2>Booking Details</h2>
          <button className="booking-details-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="booking-details-content">
          {/* Player Info */}
          <div className="booking-details-section">
            <div className="booking-details-row">
              <div className="booking-details-icon">
                <User size={18} />
              </div>
              <div className="booking-details-info">
                <div className="booking-details-label">Player Name</div>
                <div className="booking-details-value">{booking.playerName}</div>
              </div>
            </div>

            {booking.phone && (
              <div className="booking-details-row">
                <div className="booking-details-icon">
                  <Phone size={18} />
                </div>
                <div className="booking-details-info">
                  <div className="booking-details-label">Phone Number</div>
                  <div className="booking-details-value">{booking.phone}</div>
                </div>
              </div>
            )}
          </div>

          {/* Booking Info */}
          <div className="booking-details-section">
            <div className="booking-details-row">
              <div className="booking-details-icon">
                <MapPin size={18} />
              </div>
              <div className="booking-details-info">
                <div className="booking-details-label">Court</div>
                <div className="booking-details-value">{courtName}</div>
              </div>
            </div>

            <div className="booking-details-row">
              <div className="booking-details-icon">
                <Calendar size={18} />
              </div>
              <div className="booking-details-info">
                <div className="booking-details-label">Date</div>
                <div className="booking-details-value">
                  {booking.date}
                  {booking.isOvernightBooking && booking.endDate && (
                    <span className="overnight-badge">
                      → {booking.endDate} (Overnight)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="booking-details-row">
              <div className="booking-details-icon">
                <Clock size={18} />
              </div>
              <div className="booking-details-info">
                <div className="booking-details-label">Time</div>
                <div className="booking-details-value">
                  {formatTimeTo12Hour(booking.startTime)} – {formatTimeTo12Hour(booking.endTime)}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="booking-details-section">
            {booking.categoryName && (
              <div className="booking-details-row">
                <div className="booking-details-icon">
                  <Tag size={18} />
                </div>
                <div className="booking-details-info">
                  <div className="booking-details-label">Category</div>
                  <div className="booking-details-value">{booking.categoryName}</div>
                </div>
              </div>
            )}

            {booking.bookingType && (
              <div className="booking-details-row">
                <div className="booking-details-icon">
                  <Tag size={18} />
                </div>
                <div className="booking-details-info">
                  <div className="booking-details-label">Booking Type</div>
                  <div className="booking-details-value">{booking.bookingType}</div>
                </div>
              </div>
            )}

            <div className="booking-details-row">
              <div className="booking-details-icon">
                <CreditCard size={18} />
              </div>
              <div className="booking-details-info">
                <div className="booking-details-label">Price</div>
                <div className="booking-details-value booking-price">
                  {booking.price || 300} SAR
                </div>
              </div>
            </div>

            <div className="booking-details-row">
              <div className="booking-details-icon">
                <CreditCard size={18} />
              </div>
              <div className="booking-details-info">
                <div className="booking-details-label">Payment Status</div>
                <div className={`booking-status-badge ${booking.paymentStatus?.toLowerCase() || 'pending'}`}>
                  {booking.paymentStatus || 'Pending'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="booking-details-footer">
          <button className="booking-details-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
