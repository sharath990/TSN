import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Customer Pages
import { Home } from './pages/customer/Home';
import { Services } from './pages/customer/Services';
import { ServiceDetail } from './pages/customer/ServiceDetail';
import { MyBookings } from './pages/customer/MyBookings';
import { BookingDetail } from './pages/customer/BookingDetail';
import { Profile } from './pages/customer/Profile';
import { ChangePassword } from './pages/customer/ChangePassword';
import { PaymentStatus } from './pages/customer/PaymentStatus';
import { ContactUs } from './pages/customer/ContactUs';

// Admin Pages
import { Dashboard } from './pages/admin/Dashboard';
import { Catalog } from './pages/admin/Catalog';
import { Services as AdminServices } from './pages/admin/Services';
import { Bookings } from './pages/admin/AdminBookings';
import { Customers } from './pages/admin/Customers';
import { ServiceAreas } from './pages/admin/ServiceAreas';
import { ServiceAreaForm } from './pages/admin/ServiceAreaForm';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <div className="loading-container"><div className="spinner" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <div className="loading-container"><div className="spinner" /></div>;
  if (isAuthenticated) return <Navigate to={isAdmin ? '/admin' : '/'} replace />;
  return children;
};

const AdminLayout = ({ children, sidebarOpen, onToggleSidebar, onCloseSidebar }) => {
  return (
    <div className="admin-layout" style={{ flex: 1 }}>
      {sidebarOpen && <div className="sidebar-overlay" onClick={onCloseSidebar} />}
      <Sidebar isOpen={sidebarOpen} onClose={onCloseSidebar} />
      <div className="admin-main">
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><div className="layout"><Header /><div className="layout-content"><Login /></div></div></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><div className="layout"><Header /><div className="layout-content"><Register /></div></div></PublicRoute>} />

          {/* Customer Routes */}
          <Route path="/" element={<div className="layout"><Header /><div className="layout-content"><Home /></div><Footer /></div>} />
          <Route path="/services" element={<div className="layout"><Header /><div className="layout-content"><Services /></div><Footer /></div>} />
          <Route path="/services/:id" element={<div className="layout"><Header /><div className="layout-content"><ServiceDetail /></div><Footer /></div>} />
          <Route path="/bookings" element={<ProtectedRoute><div className="layout"><Header /><div className="layout-content"><MyBookings /></div><Footer /></div></ProtectedRoute>} />
          <Route path="/bookings/:id" element={<ProtectedRoute><div className="layout"><Header /><div className="layout-content"><BookingDetail /></div><Footer /></div></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><div className="layout"><Header /><div className="layout-content"><Profile /></div><Footer /></div></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><div className="layout"><Header /><div className="layout-content"><ChangePassword /></div><Footer /></div></ProtectedRoute>} />
          <Route path="/payment/status/:orderId" element={<ProtectedRoute><div className="layout"><Header /><div className="layout-content"><PaymentStatus /></div><Footer /></div></ProtectedRoute>} />
          <Route path="/contact" element={<div className="layout"><Header /><div className="layout-content"><ContactUs /></div><Footer /></div>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><div className="layout"><Header onToggleSidebar={toggleSidebar} /><AdminLayout sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} onCloseSidebar={closeSidebar}><Dashboard /></AdminLayout></div></ProtectedRoute>} />
          <Route path="/admin/catalog" element={<ProtectedRoute adminOnly><div className="layout"><Header onToggleSidebar={toggleSidebar} /><AdminLayout sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} onCloseSidebar={closeSidebar}><Catalog /></AdminLayout></div></ProtectedRoute>} />
          <Route path="/admin/services" element={<ProtectedRoute adminOnly><div className="layout"><Header onToggleSidebar={toggleSidebar} /><AdminLayout sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} onCloseSidebar={closeSidebar}><AdminServices /></AdminLayout></div></ProtectedRoute>} />
          <Route path="/admin/service-areas" element={<ProtectedRoute adminOnly><div className="layout"><Header onToggleSidebar={toggleSidebar} /><AdminLayout sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} onCloseSidebar={closeSidebar}><ServiceAreas /></AdminLayout></div></ProtectedRoute>} />
          <Route path="/admin/service-areas/new" element={<ProtectedRoute adminOnly><div className="layout"><Header onToggleSidebar={toggleSidebar} /><AdminLayout sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} onCloseSidebar={closeSidebar}><ServiceAreaForm /></AdminLayout></div></ProtectedRoute>} />
          <Route path="/admin/service-areas/:id/edit" element={<ProtectedRoute adminOnly><div className="layout"><Header onToggleSidebar={toggleSidebar} /><AdminLayout sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} onCloseSidebar={closeSidebar}><ServiceAreaForm /></AdminLayout></div></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute adminOnly><div className="layout"><Header onToggleSidebar={toggleSidebar} /><AdminLayout sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} onCloseSidebar={closeSidebar}><Bookings /></AdminLayout></div></ProtectedRoute>} />
          <Route path="/admin/customers" element={<ProtectedRoute adminOnly><div className="layout"><Header onToggleSidebar={toggleSidebar} /><AdminLayout sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} onCloseSidebar={closeSidebar}><Customers /></AdminLayout></div></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute adminOnly><div className="layout"><Header onToggleSidebar={toggleSidebar} /><AdminLayout sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} onCloseSidebar={closeSidebar}><Profile /></AdminLayout></div></ProtectedRoute>} />
          <Route path="/admin/change-password" element={<ProtectedRoute adminOnly><div className="layout"><Header onToggleSidebar={toggleSidebar} /><AdminLayout sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} onCloseSidebar={closeSidebar}><ChangePassword /></AdminLayout></div></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<div className="layout"><Header /><div className="layout-content"><div className="page container" style={{ textAlign: 'center', padding: '4rem' }}><h1>404</h1><p>Page not found</p></div></div><Footer /></div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
