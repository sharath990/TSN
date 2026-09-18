import { useState, useEffect } from 'react';
import { customerAPI } from '../../api';
import { Badge } from '../../components/common/Badge';
import { SearchInput } from '../../components/common/SearchInput';
import { SortableHeader } from '../../components/common/SortableHeader';
import { Pagination } from '../../components/common/Pagination';
import toast from 'react-hot-toast';
import { FiEye, FiUserCheck, FiUserX, FiMail, FiPhone, FiCalendar, FiBookOpen } from 'react-icons/fi';
import { Modal } from '../../components/common/Modal';
import './Admin.css';

export const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState('DESC');

  useEffect(() => {
    fetchCustomers();
  }, [pagination.page, search, sort, order]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 10,
        search,
        sort,
        order,
      };
      const res = await customerAPI.getAll(params);
      setCustomers(res.data.customers);
      setPagination((prev) => ({
        ...prev,
        totalPages: res.data.pagination.totalPages,
        total: res.data.pagination.total,
      }));
    } catch (error) {
      toast.error('Failed to load customers');
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

  const handleViewDetail = (customer) => {
    setSelectedCustomer(customer);
    setDetailModal(true);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await customerAPI.updateStatus(id, { status: newStatus });
      toast.success(`Customer ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetchCustomers();
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
      </div>

      <div className="data-toolbar">
        <SearchInput value={search} onChange={handleSearch} placeholder="Search customers..." />
        <span className="data-toolbar-info">{pagination.total} total</span>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <SortableHeader column="name" label="Name" currentSort={sort} currentOrder={order} onSort={handleSort} />
                <SortableHeader column="email" label="Email" currentSort={sort} currentOrder={order} onSort={handleSort} />
                <th>Phone</th>
                <th>Bookings</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="font-medium">{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone || '-'}</td>
                  <td>{customer.bookingCount || 0}</td>
                  <td><Badge status={customer.status} /></td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-icon" onClick={() => handleViewDetail(customer)}><FiEye /></button>
                      <button
                        className="btn-icon"
                        onClick={() => handleToggleStatus(customer.id, customer.status)}
                        title={customer.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {customer.status === 'active' ? <FiUserX /> : <FiUserCheck />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />

      <Modal isOpen={detailModal} onClose={() => setDetailModal(false)} title="Customer Details" size="lg">
        {selectedCustomer && (
          <div className="customer-profile">
            {/* Header */}
            <div className="customer-profile-header">
              <div className="customer-avatar">
                {selectedCustomer.name?.charAt(0).toUpperCase()}
              </div>
              <div className="customer-profile-info">
                <h3 className="customer-profile-name">{selectedCustomer.name}</h3>
                <span className="customer-profile-email">{selectedCustomer.email}</span>
              </div>
              <div className="customer-profile-status">
                <Badge status={selectedCustomer.status} />
              </div>
            </div>

            {/* Info Grid */}
            <div className="customer-info-grid">
              <div className="customer-info-item">
                <FiMail className="customer-info-icon" />
                <div>
                  <span className="customer-info-label">Email</span>
                  <span className="customer-info-value">{selectedCustomer.email}</span>
                </div>
              </div>
              <div className="customer-info-item">
                <FiPhone className="customer-info-icon" />
                <div>
                  <span className="customer-info-label">Phone</span>
                  <span className="customer-info-value">{selectedCustomer.phone || 'Not provided'}</span>
                </div>
              </div>
              <div className="customer-info-item">
                <FiBookOpen className="customer-info-icon" />
                <div>
                  <span className="customer-info-label">Total Bookings</span>
                  <span className="customer-info-value">{selectedCustomer.bookingCount || 0}</span>
                </div>
              </div>
              <div className="customer-info-item">
                <FiCalendar className="customer-info-icon" />
                <div>
                  <span className="customer-info-label">Joined</span>
                  <span className="customer-info-value">
                    {selectedCustomer.createdAt
                      ? new Date(selectedCustomer.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })
                      : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="customer-profile-actions">
              <button
                className={`btn ${selectedCustomer.status === 'active' ? 'btn-danger' : 'btn-primary'}`}
                onClick={() => {
                  handleToggleStatus(selectedCustomer.id, selectedCustomer.status);
                  setDetailModal(false);
                }}
              >
                {selectedCustomer.status === 'active' ? (
                  <><FiUserX /> Deactivate Account</>
                ) : (
                  <><FiUserCheck /> Activate Account</>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
