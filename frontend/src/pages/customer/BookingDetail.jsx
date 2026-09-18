import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../../api';
import { Badge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatTime, formatDate, formatDateTime } from '../../utils/format';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCalendar, FiClock, FiMapPin, FiFileText, FiTag, FiHash, FiMessageCircle } from 'react-icons/fi';
import './Customer.css';

export const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const res = await bookingAPI.getById(id);
      setBooking(res.data.booking);
    } catch (error) {
      toast.error('Failed to load booking details');
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      const res = await bookingAPI.cancel(id, { reason: 'Cancelled by customer' });
      toast.success(res.data.message || 'Booking cancelled');
      fetchBooking();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to cancel booking');
    }
  };

  const isEligibleForCancel = () => {
    if (!booking || !booking.booking_date || !booking.booking_time) return false;
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
    const now = new Date();
    const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);
    return hoursUntilBooking > 24;
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  if (!booking) return null;

  return (
    <div className="page container">
      <button className="back-btn" onClick={() => navigate('/bookings')}>
        <FiArrowLeft /> Back to Bookings
      </button>

      <div className="booking-detail-header">
        <div className="booking-detail-header-left">
          <h1 className="page-title">{booking.booking_number}</h1>
          <Badge status={booking.status} />
        </div>
        <span className="booking-detail-service">{booking.service?.name}</span>
      </div>

      <div className="booking-detail-grid">
        <div className="booking-detail-card">
          <h3 className="booking-detail-card-title">
            <FiTag /> Service Info
          </h3>
          <div className="booking-detail-card-body">
            <div className="booking-detail-field">
              <span className="booking-detail-field-label">Service</span>
              <span className="booking-detail-field-value">{booking.service?.name}</span>
            </div>
            <div className="booking-detail-field">
              <span className="booking-detail-field-label">Category</span>
              <span className="booking-detail-field-value">{booking.service?.category?.name}</span>
            </div>
            {booking.subcategories?.length > 0 && (
              <div className="booking-detail-field">
                <span className="booking-detail-field-label">Options</span>
                <div className="booking-subcategories-detail">
                  {booking.subcategories.map((sub) => (
                    <div key={sub.id} className="booking-subcategory-row">
                      <span>{sub.name}</span>
                      <span className="booking-subcategory-price">₹{Number(sub.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {booking.total_price != null && (
              <div className="booking-detail-field">
                <span className="booking-detail-field-label">Total Price</span>
                <span className="booking-detail-field-value booking-detail-price">
                  ₹{Number(booking.total_price).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="booking-detail-card">
          <h3 className="booking-detail-card-title">
            <FiCalendar /> Schedule
          </h3>
          <div className="booking-detail-card-body">
            <div className="booking-detail-field">
              <span className="booking-detail-field-label">Date</span>
              <span className="booking-detail-field-value">
                <FiCalendar className="booking-detail-field-icon" />
                {formatDate(booking.booking_date)}
              </span>
            </div>
            <div className="booking-detail-field">
              <span className="booking-detail-field-label">Time</span>
              <span className="booking-detail-field-value">
                <FiClock className="booking-detail-field-icon" />
                {formatTime(booking.booking_time)}
              </span>
            </div>
          </div>
        </div>

        <div className="booking-detail-card booking-detail-card-full">
          <h3 className="booking-detail-card-title">
            <FiMapPin /> Address
          </h3>
          <div className="booking-detail-card-body">
            {booking.phone && (
              <p className="booking-detail-address"><strong>Phone:</strong> {booking.phone}</p>
            )}
            {booking.house_flat && (
              <p className="booking-detail-address"><strong>House/Flat:</strong> {booking.house_flat}</p>
            )}
            {booking.floor && (
              <p className="booking-detail-address"><strong>Floor:</strong> {booking.floor}</p>
            )}
            {booking.landmark && (
              <p className="booking-detail-address"><strong>Landmark:</strong> {booking.landmark}</p>
            )}
            <p className="booking-detail-address">{booking.address}</p>
            {booking.pincode && (
              <p className="booking-detail-address"><strong>PIN:</strong> {booking.pincode}</p>
            )}
          </div>
        </div>

        {booking.notes && (
          <div className="booking-detail-card booking-detail-card-full">
            <h3 className="booking-detail-card-title">
              <FiFileText /> Notes
            </h3>
            <div className="booking-detail-card-body">
              <p className="booking-detail-notes">{booking.notes}</p>
            </div>
          </div>
        )}

        {booking.statusHistory?.length > 0 && (
          <div className="booking-detail-card booking-detail-card-full">
            <h3 className="booking-detail-card-title">
              <FiMessageCircle /> Status History
            </h3>
            <div className="booking-detail-card-body">
              <div className="status-timeline">
                {[...booking.statusHistory].reverse().map((entry, idx) => (
                  <div key={entry.id} className="timeline-item">
                    <div className={`timeline-dot ${idx === 0 ? 'timeline-dot-active' : ''}`} />
                    {idx < booking.statusHistory.length - 1 && <div className="timeline-line" />}
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <Badge status={entry.new_status} />
                        <span className="timeline-time">{formatDateTime(entry.created_at)}</span>
                      </div>
                      {entry.remarks && (
                        <p className="timeline-remarks">{entry.remarks}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {['pending', 'confirmed', 'rescheduled'].includes(booking.status) && isEligibleForCancel() && (
        <div className="booking-detail-actions">
          <button className="btn btn-outline" onClick={() => setCancelDialog(true)}>
            Cancel Booking
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={cancelDialog}
        onClose={() => setCancelDialog(false)}
        onConfirm={handleCancel}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmText="Cancel Booking"
        danger
      />
    </div>
  );
};
