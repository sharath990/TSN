import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../../api';
import { Badge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SearchInput } from '../../components/common/SearchInput';
import { SortableHeader } from '../../components/common/SortableHeader';
import { Pagination } from '../../components/common/Pagination';
import { formatTime } from '../../utils/format';
import toast from 'react-hot-toast';
import { FiEye, FiX, FiArrowLeft } from 'react-icons/fi';
import './Customer.css';

export const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState('DESC');
  const [cancelId, setCancelId] = useState(null);

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

  const handleCancel = async (id) => {
    setCancelId(id);
  };

  const confirmCancel = async () => {
    try {
      await bookingAPI.cancel(cancelId, { reason: 'Cancelled by customer' });
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (error) {
      toast.error(error.message || 'Failed to cancel booking');
    }
  };

  return (
    <div className="page container">
      <button className="back-btn" onClick={() => navigate('/')}>
        <FiArrowLeft /> Back to Home
      </button>

      <div className="page-header">
        <h1 className="page-title">My Bookings</h1>
      </div>

      <div className="booking-filters">
        {['', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            className={`filter-btn ${filter === status ? 'filter-btn-active' : ''}`}
            onClick={() => handleFilterChange(status)}
          >
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
          </button>
        ))}
      </div>

      <div className="data-toolbar">
        <SearchInput value={search} onChange={handleSearch} placeholder="Search bookings..." />
        <span className="data-toolbar-info">{pagination.total} total</span>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <p>No bookings found</p>
          <Link to="/services" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Browse Services
          </Link>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Booking #</th>
                  <th>Service</th>
                  <SortableHeader column="booking_date" label="Date" currentSort={sort} currentOrder={order} onSort={handleSort} />
                  <th>Time</th>
                  <SortableHeader column="status" label="Status" currentSort={sort} currentOrder={order} onSort={handleSort} />
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="font-medium">{booking.booking_number}</td>
                    <td>{booking.service?.name}</td>
                    <td>{booking.booking_date}</td>
                    <td>{formatTime(booking.booking_time)}</td>
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
                        <Link to={`/bookings/${booking.id}`} className="btn-icon" title="View">
                          <FiEye />
                        </Link>
                        {['pending', 'confirmed', 'rescheduled'].includes(booking.status) && (
                          <button
                            className="btn-icon btn-icon-danger"
                            onClick={() => handleCancel(booking.id)}
                            title="Cancel"
                          >
                            <FiX />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
        </>
      )}

      <ConfirmDialog
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={confirmCancel}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmText="Cancel Booking"
        danger
      />
    </div>
  );
};
