import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { FiMenu, FiX, FiUser, FiLogOut, FiGrid, FiChevronDown, FiSettings, FiLock } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';
import tsnLogo from '../../assets/TSN-Facility-Services-Footer-Logo.svg';
import './Layout.css';

export const Header = ({ onToggleSidebar }) => {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isAdminPage = location.pathname.startsWith('/admin');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openLogoutDialog = () => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    setLogoutDialog(true);
  };

  const closeDropdown = () => setDropdownOpen(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const profilePath = isAdmin ? '/admin/profile' : '/profile';
  const changePasswordPath = isAdmin ? '/admin/change-password' : '/change-password';

  return (
    <header className="header">
      <div className="header-container">
        {isAdminPage && (
          <button className="sidebar-toggle-btn" onClick={onToggleSidebar}>
            <FiGrid />
          </button>
        )}

        <Link to="/" className="logo">
          <img src={tsnLogo} alt="TSN Facility Services" className="logo-img" />
        </Link>

        <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          {!isAdmin && (
            <Link to="/services" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Services</Link>
          )}
          <Link to="/contact" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          {isAuthenticated && !isAdmin && (
            <Link to="/bookings" className="nav-link" onClick={() => setMobileMenuOpen(false)}>My Bookings</Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>
          )}
          <div className="nav-mobile-auth">
            {isAuthenticated ? (
              <>
                <Link to={profilePath} className="nav-link" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
                <Link to={changePasswordPath} className="nav-link" onClick={() => setMobileMenuOpen(false)}>Change Password</Link>
                <button className="nav-link nav-link-btn" onClick={openLogoutDialog}>
                  <FiLogOut /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link to="/register" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        </nav>

        <div className="header-actions">
          {isAuthenticated ? (
            <div className="user-menu" ref={dropdownRef}>
              <button className="user-dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="user-avatar">
                  <FiUser />
                </div>
                <span className="user-name">{user?.name}</span>
                <FiChevronDown className={`user-chevron ${dropdownOpen ? 'user-chevron-open' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="user-dropdown">
                  <Link to={profilePath} className="dropdown-item" onClick={closeDropdown}>
                    <FiSettings />
                    <span>My Profile</span>
                  </Link>
                  <Link to={changePasswordPath} className="dropdown-item" onClick={closeDropdown}>
                    <FiLock />
                    <span>Change Password</span>
                  </Link>
                  <button className="dropdown-item dropdown-item-danger" onClick={openLogoutDialog}>
                    <FiLogOut />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </div>
          )}

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={logoutDialog}
        onClose={() => setLogoutDialog(false)}
        onConfirm={handleLogout}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        danger
      />
    </header>
  );
};
