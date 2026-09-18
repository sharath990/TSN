import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { StatCard } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { FiUsers, FiPackage, FiGrid, FiCalendar, FiClock, FiCheckCircle } from 'react-icons/fi';
import './Admin.css';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminAPI.getDashboard();
        setData(res.data);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  const { stats, recentBookings } = data || {};

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Customers" value={stats?.totalCustomers || 0} icon={<FiUsers />} color="primary" />
        <StatCard title="Total Services" value={stats?.totalServices || 0} icon={<FiPackage />} color="secondary" />
        <StatCard title="Total Categories" value={stats?.totalCategories || 0} icon={<FiGrid />} color="success" />
        <StatCard title="Total Bookings" value={stats?.totalBookings || 0} icon={<FiCalendar />} color="warning" />
      </div>

      <div className="stats-grid" style={{ marginTop: '1.5rem' }}>
        <StatCard title="Pending" value={stats?.pendingBookings || 0} icon={<FiClock />} color="warning" />
        <StatCard title="Confirmed" value={stats?.confirmedBookings || 0} icon={<FiCheckCircle />} color="primary" />
        <StatCard title="Completed" value={stats?.completedBookings || 0} icon={<FiCheckCircle />} color="success" />
        <StatCard title="Cancelled" value={stats?.cancelledBookings || 0} icon={<FiClock />} color="danger" />
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 className="card-title">Recent Bookings</h2>
        {recentBookings?.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Booking #</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="font-medium">{booking.booking_number}</td>
                    <td>{booking.customer?.name}</td>
                    <td>{booking.service?.name}</td>
                    <td>{booking.booking_date}</td>
                    <td><Badge status={booking.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">No recent bookings</div>
        )}
      </div>
    </div>
  );
};
