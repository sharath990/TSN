import { NavLink } from 'react-router-dom';
import {
  FiHome, FiGrid, FiPackage, FiCalendar,
  FiUsers, FiSettings, FiBarChart2, FiMapPin
} from 'react-icons/fi';
import './Layout.css';

const menuItems = [
  { path: '/admin', icon: <FiHome />, label: 'Dashboard', end: true },
  { path: '/admin/catalog', icon: <FiGrid />, label: 'Catalog' },
  { path: '/admin/services', icon: <FiPackage />, label: 'Services' },
  { path: '/admin/service-areas', icon: <FiMapPin />, label: 'Service Areas' },
  { path: '/admin/bookings', icon: <FiCalendar />, label: 'Bookings' },
  { path: '/admin/customers', icon: <FiUsers />, label: 'Customers' },
];

export const Sidebar = ({ isOpen, onClose }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-header">
        <FiBarChart2 className="sidebar-logo-icon" />
        <span>Admin Panel</span>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
            onClick={onClose}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
