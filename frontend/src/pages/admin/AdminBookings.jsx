import { useState, useEffect } from 'react';
import { bookingAPI, paymentAPI } from '../../api';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SearchInput } from '../../components/common/SearchInput';
import { SortableHeader } from '../../components/common/SortableHeader';
import { Pagination } from '../../components/common/Pagination';
import { formatTime, formatDateTime } from '../../utils/format';
import toast from 'react-hot-toast';
import { FiEye, FiClock, FiDollarSign, FiMessageCircle } from 'react-icons/fi';
import './Admin.css';

export const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: '', remarks: '', new_date: '', new_time: '' });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState('DESC');
  const [refundModal, setRefundModal] = useState(false);
  const [refundForm, setRefundForm] = useState({ refund_amount: '', refund_reason: '' });

  useEffect(() => {
    fetchBookings();
  }, [filter, pagination.page, search, sort, order]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 10,
        search,
        sort,
        order,
      };
      if (filter) params.status = filter;
      const res = await bookingAPI.getAll(params);
      setBookings(res.data.bookings);
      setPagination((prev) => ({
        ...prev,
        totalPages: res.data.pagination.totalPages,
        total: res.data.pagination.total,
      }));
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSort = (column, newOrder) => {
    setSort(column);
    setOrder(newOrder);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleFilterChange = (status) => {
    setFilter(status);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleViewDetail = async (booking) => {
    setSelectedBooking(booking);
    setDetailModal(true);
    try {
      const res = await bookingAPI.getById(booking.id);
      setSelectedBooking(res.data.booking);
    } catch {
      // keep the list data if fetch fails
    }
  };

  const handleStatusChange = (booking) => {
    setSelectedBooking(booking);
    setStatusForm({ status: '', remarks: '', new_date: booking.booking_date, new_time: booking.booking_time });
    setStatusModal(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await bookingAPI.updateStatus(selectedBooking.id, statusForm);
      toast.success('Status updated');
      setStatusModal(false);
      fetchBookings();
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleRefund = (booking) => {
    setSelectedBooking(booking);
    setRefundForm({ refund_amount: booking.payment?.amount || '', refund_reason: '' });
    setRefundModal(true);
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    try {
      await paymentAPI.refund(selectedBooking.payment.order_id, refundForm);
      toast.success('Refund initiated successfully');
      setRefundModal(false);
      fetchBookings();
    } catch (error) {
      toast.error(error.message || 'Failed to initiate refund');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Bookings</h1>
      </div>

      <div className="booking-filters">
        {['', 'pending_payment', 'pending', 'confirmed', 'rescheduled', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            className={`filter-btn ${filter === status ? 'filter-btn-active' : ''}`}
            onClick={() => handleFilterChange(status)}
          >
            {status ? status.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>

      <div className="data-toolbar">
        <SearchInput value={search} onChange={handleSearch} placeholder="Search bookings..." />
        <span className="data-toolbar-info">{pagination.total} total</span>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <SortableHeader column="created_at" label="Booking #" currentSort={sort} currentOrder={order} onSort={handleSort} />
                <th>Customer</th>
                <th>Service</th>
                <SortableHeader column="booking_date" label="Date" currentSort={sort} currentOrder={order} onSort={handleSort} />
                <th>Time</th>
                <th>Amount</th>
                <SortableHeader column="status" label="Status" currentSort={sort} currentOrder={order} onSort={handleSort} />
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="font-medium">{booking.booking_number}</td>
                  <td>{booking.customer?.name}</td>
                  <td>{booking.service?.name}</td>
                  <td>{booking.booking_date}</td>
                  <td>{formatTime(booking.booking_time)}</td>
                  <td className="font-medium">₹{Number(booking.total_price).toFixed(2)}</td>
                  <td><Badge status={booking.status} /></td>
                  <td>
                    {booking.payment ? (
                      <span className={`payment-status-badge ${booking.payment.status}`}>
                        {booking.payment.status}
                      </span>
                    ) : (
                      <span className="payment-status-badge none">N/A</span>
                    )}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-icon" onClick={() => handleViewDetail(booking)} title="View Details"><FiEye /></button>
                      {booking.status !== 'completed' && booking.status !== 'cancelled' && booking.status !== 'pending_payment' && (
                        <button className="btn-icon" onClick={() => handleStatusChange(booking)} title="Update Status">
                          <FiClock />
                        </button>
                      )}
                      {booking.payment?.status === 'completed' && !booking.payment?.refund_id && (
                        <button className="btn-icon btn-icon-warning" onClick={() => handleRefund(booking)} title="Refund">
                          <FiDollarSign />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />

      {/* Detail Modal */}
      <Modal isOpen={detailModal} onClose={() => setDetailModal(false)} title="Booking Details" size="lg">
        {selectedBooking && (
          <div className="invoice">

            {/* Invoice Header */}
            <div className="invoice-header">
              <div className="invoice-header-left">
                <span className="invoice-label">Booking Number</span>
                <span className="invoice-number">{selectedBooking.booking_number}</span>
              </div>
              <div className="invoice-header-right">
                <Badge status={selectedBooking.status} />
                <span className="invoice-date">{selectedBooking.booking_date} at {formatTime(selectedBooking.booking_time)}</span>
              </div>
            </div>

            {/* Two Column: Bill To + Service Details */}
            <div className="invoice-columns">
              <div className="invoice-col">
                <h4 className="invoice-col-title">Bill To</h4>
                <div className="invoice-col-body">
                  <span className="invoice-customer-name">{selectedBooking.customer?.name}</span>
                  <span className="invoice-customer-email">{selectedBooking.customer?.email}</span>
                  {selectedBooking.phone && <span className="invoice-customer-phone">{selectedBooking.phone}</span>}
                </div>
              </div>
              <div className="invoice-col">
                <h4 className="invoice-col-title">Service Details</h4>
                <div className="invoice-col-body">
                  <div className="invoice-detail-row">
                    <span className="invoice-detail-label">Service</span>
                    <span className="invoice-detail-value">{selectedBooking.service?.name}</span>
                  </div>
                  <div className="invoice-detail-row">
                    <span className="invoice-detail-label">Category</span>
                    <span className="invoice-detail-value">{selectedBooking.service?.category?.name}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            {selectedBooking.subcategories?.length > 0 && (
              <div className="invoice-table-wrapper">
                <table className="invoice-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th className="invoice-table-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBooking.subcategories.map((sub) => (
                      <tr key={sub.id}>
                        <td>{sub.name}</td>
                        <td className="invoice-table-right">₹{Number(sub.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="invoice-total-row">
                      <td>Total</td>
                      <td className="invoice-table-right">₹{Number(selectedBooking.total_price).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Address */}
            <div className="invoice-section">
              <h4 className="invoice-section-title">Service Address</h4>
              <div className="invoice-address">
                {selectedBooking.house_flat && (
                  <span><span className="invoice-address-label">House/Flat:</span> {selectedBooking.house_flat}</span>
                )}
                {selectedBooking.floor && (
                  <span><span className="invoice-address-label">Floor:</span> {selectedBooking.floor}</span>
                )}
                {selectedBooking.landmark && (
                  <span><span className="invoice-address-label">Landmark:</span> {selectedBooking.landmark}</span>
                )}
                <span>{selectedBooking.address}</span>
                {selectedBooking.pincode && (
                  <span><span className="invoice-address-label">PIN:</span> {selectedBooking.pincode}</span>
                )}
              </div>
            </div>

            {/* Payment + Notes row */}
            <div className="invoice-columns">
              {selectedBooking.payment && (
                <div className="invoice-col">
                  <h4 className="invoice-col-title">Payment</h4>
                  <div className="invoice-col-body">
                    <div className="invoice-detail-row">
                      <span className="invoice-detail-label">Status</span>
                      <span className="invoice-detail-value">
                        <span className={`payment-status-badge ${selectedBooking.payment.status}`}>
                          {selectedBooking.payment.status}
                        </span>
                      </span>
                    </div>
                    {selectedBooking.payment.paymentMethod && (
                      <div className="invoice-detail-row">
                        <span className="invoice-detail-label">Method</span>
                        <span className="invoice-detail-value">{selectedBooking.payment.paymentMethod}</span>
                      </div>
                    )}
                    {selectedBooking.payment.refund_id && (
                      <div className="invoice-detail-row">
                        <span className="invoice-detail-label">Refund</span>
                        <span className="invoice-detail-value" style={{ color: 'var(--color-error)' }}>
                          ₹{Number(selectedBooking.payment.refund_amount).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {selectedBooking.notes && (
                <div className="invoice-col">
                  <h4 className="invoice-col-title">Notes</h4>
                  <p className="invoice-notes">{selectedBooking.notes}</p>
                </div>
              )}
            </div>

            {/* Status History */}
            {selectedBooking.statusHistory?.length > 0 && (
              <div className="invoice-section">
                <h4 className="invoice-section-title"><FiMessageCircle /> Status History</h4>
                <div className="status-timeline">
                  {[...selectedBooking.statusHistory].reverse().map((entry, idx) => (
                    <div key={entry.id} className="timeline-item">
                      <div className={`timeline-dot ${idx === 0 ? 'timeline-dot-active' : ''}`} />
                      {idx < selectedBooking.statusHistory.length - 1 && <div className="timeline-line" />}
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
            )}
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal isOpen={statusModal} onClose={() => setStatusModal(false)} title="Update Booking Status">
        <form onSubmit={handleUpdateStatus}>
          <div className="form-group">
            <label className="form-label">New Status</label>
            <select
              value={statusForm.status}
              onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
              className="form-input"
              required
            >
              <option value="">Select Status</option>
              {selectedBooking?.status === 'pending' && <option value="confirmed">Confirm</option>}
              {selectedBooking?.status === 'confirmed' && <option value="rescheduled">Reschedule</option>}
              {selectedBooking?.status === 'confirmed' && <option value="completed">Complete</option>}
              {['pending', 'confirmed', 'rescheduled'].includes(selectedBooking?.status) && (
                <option value="cancelled">Cancel</option>
              )}
            </select>
          </div>

          {statusForm.status === 'rescheduled' && (
            <>
              <div className="form-group">
                <label className="form-label">New Date</label>
                <input
                  type="date"
                  value={statusForm.new_date}
                  onChange={(e) => setStatusForm({ ...statusForm, new_date: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Time</label>
                <input
                  type="time"
                  value={statusForm.new_time}
                  onChange={(e) => setStatusForm({ ...statusForm, new_time: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Remarks</label>
            <textarea
              value={statusForm.remarks}
              onChange={(e) => setStatusForm({ ...statusForm, remarks: e.target.value })}
              className="form-input"
              rows={3}
              placeholder="Add remarks..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={() => setStatusModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Update Status</button>
          </div>
        </form>
      </Modal>

      {/* Refund Modal */}
      <Modal isOpen={refundModal} onClose={() => setRefundModal(false)} title="Initiate Refund">
        <form onSubmit={handleRefundSubmit}>
          <div className="booking-detail-fields">
            <div className="booking-detail-field">
              <span className="booking-detail-field-label">Order ID</span>
              <span className="booking-detail-field-value">{selectedBooking?.payment?.order_id}</span>
            </div>
            <div className="booking-detail-field">
              <span className="booking-detail-field-label">Paid Amount</span>
              <span className="booking-detail-field-value">₹{Number(selectedBooking?.payment?.amount || 0).toFixed(2)}</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Refund Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={selectedBooking?.payment?.amount}
              value={refundForm.refund_amount}
              onChange={(e) => setRefundForm({ ...refundForm, refund_amount: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Reason</label>
            <textarea
              value={refundForm.refund_reason}
              onChange={(e) => setRefundForm({ ...refundForm, refund_reason: e.target.value })}
              className="form-input"
              rows={3}
              placeholder="Reason for refund..."
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={() => setRefundModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-danger">Initiate Refund</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
