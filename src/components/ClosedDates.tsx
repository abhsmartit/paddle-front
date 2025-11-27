import { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import type { ClosedDate, CreateClosedDateRequest } from '../types';
import './ClosedDates.css';

const ClosedDates = () => {
  const { clubId } = useAuth();
  const [closedDates, setClosedDates] = useState<ClosedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClosedDate, setNewClosedDate] = useState<CreateClosedDateRequest>({
    closedDate: '',
    reason: ''
  });

  useEffect(() => {
    if (clubId) {
      loadClosedDates();
    }
  }, [clubId]);

  const loadClosedDates = async () => {
    if (!clubId) return;
    
    try {
      setLoading(true);
      const data = await apiService.getClosedDates(clubId);
      setClosedDates(data);
    } catch (error: any) {
      console.error('Failed to load closed dates:', error);
      toast.error(error.response?.data?.message || 'Failed to load closed dates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClosedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clubId || !newClosedDate.closedDate || !newClosedDate.reason) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await apiService.createClosedDate(clubId, newClosedDate);
      toast.success('Closed date added successfully');
      setNewClosedDate({ closedDate: '', reason: '' });
      setIsModalOpen(false);
      await loadClosedDates();
    } catch (error: any) {
      console.error('Failed to create closed date:', error);
      toast.error(error.response?.data?.message || 'Failed to add closed date');
    }
  };

  const handleDeleteClosedDate = async (closedDateId: string) => {
    if (!window.confirm('Are you sure you want to delete this closed date?')) {
      return;
    }

    try {
      await apiService.deleteClosedDate(closedDateId);
      toast.success('Closed date deleted successfully');
      await loadClosedDates();
    } catch (error: any) {
      console.error('Failed to delete closed date:', error);
      toast.error(error.response?.data?.message || 'Failed to delete closed date');
    }
  };

  const formatDisplayDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const sortedClosedDates = [...closedDates].sort((a, b) => 
    new Date(a.closedDate).getTime() - new Date(b.closedDate).getTime()
  );

  if (loading) {
    return (
      <div className="closed-dates-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="closed-dates-container">
      <div className="closed-dates-header">
        <div className="header-content">
          <div className="header-title">
            <Calendar className="header-icon" size={24} />
            <h1>Stadium Closed Dates</h1>
          </div>
          <button 
            className="add-closed-date-btn"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={20} />
            Add Closed Date
          </button>
        </div>
      </div>

      <div className="closed-dates-content">
        {sortedClosedDates.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={48} className="empty-icon" />
            <h3>No Closed Dates</h3>
            <p>Stadium is available on all dates. Add closed dates for holidays or maintenance.</p>
          </div>
        ) : (
          <div className="closed-dates-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reason</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedClosedDates.map((closedDate) => (
                  <tr key={closedDate._id}>
                    <td className="date-cell">
                      {formatDisplayDate(closedDate.closedDate)}
                    </td>
                    <td className="reason-cell">
                      {closedDate.reason}
                    </td>
                    <td className="created-cell">
                      {formatDisplayDate(closedDate.createdAt)}
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteClosedDate(closedDate._id)}
                        title="Delete closed date"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Closed Date Modal */}
      {isModalOpen && (
        <div className="closed-dates-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="closed-dates-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="closed-dates-modal-header">
              <h2>Add Closed Date</h2>
              <button 
                className="closed-dates-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateClosedDate} className="closed-dates-modal-form">
              <div className="form-group">
                <label htmlFor="closedDate">Date</label>
                <input
                  type="date"
                  id="closedDate"
                  value={newClosedDate.closedDate}
                  onChange={(e) => setNewClosedDate(prev => ({
                    ...prev,
                    closedDate: e.target.value
                  }))}
                  required
                  min={format(new Date(), 'yyyy-MM-dd')} // Prevent past dates
                />
              </div>

              <div className="form-group">
                <label htmlFor="reason">Reason</label>
                <input
                  type="text"
                  id="reason"
                  placeholder="e.g., New Year Day, Stadium Maintenance"
                  value={newClosedDate.reason}
                  onChange={(e) => setNewClosedDate(prev => ({
                    ...prev,
                    reason: e.target.value
                  }))}
                  required
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Closed Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClosedDates;