import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout.jsx';
import CustomerLayout from './layouts/CustomerLayout.jsx';
import ProviderLayout from './layouts/ProviderLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';

// Auth Guard
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

// Public Pages
import Home from './pages/public/Home.jsx';
import About from './pages/public/About.jsx';
import HowItWorks from './pages/public/HowItWorks.jsx';
import Services from './pages/public/Services.jsx';
import ServiceDetail from './pages/public/ServiceDetail.jsx';
import BecomeProvider from './pages/public/BecomeProvider.jsx';
import Contact from './pages/public/Contact.jsx';
import Login from './pages/public/Login.jsx';
import Register from './pages/public/Register.jsx';
import Privacy from './pages/public/Privacy.jsx';
import Terms from './pages/public/Terms.jsx';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard.jsx';
import CustomerBookings from './pages/customer/Bookings.jsx';
import CustomerBookingDetail from './pages/customer/BookingDetail.jsx';
import CustomerTrackingPage from './pages/customer/TrackingPage.jsx';
import CustomerFavorites from './pages/customer/Favorites.jsx';
import CustomerDisputes from './pages/customer/Disputes.jsx';
import CustomerNotifications from './pages/customer/Notifications.jsx';
import CustomerMessages from './pages/customer/Messages.jsx';
import CustomerProfile from './pages/customer/Profile.jsx';

// Provider Pages
import ProviderDashboard from './pages/provider/Dashboard.jsx';
import ProviderJobs from './pages/provider/Jobs.jsx';
import ProviderServices from './pages/provider/Services.jsx';
import ProviderAvailability from './pages/provider/Availability.jsx';
import ProviderEarnings from './pages/provider/Earnings.jsx';
import ProviderTrustPassportView from './pages/provider/TrustPassportView.jsx';
import ProviderVerification from './pages/provider/Verification.jsx';
import ProviderReviews from './pages/provider/Reviews.jsx';
import ProviderProfile from './pages/provider/Profile.jsx';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminVerifications from './pages/admin/Verifications.jsx';
import AdminUsers from './pages/admin/Users.jsx';
import AdminProviders from './pages/admin/Providers.jsx';
import AdminCategories from './pages/admin/Categories.jsx';
import AdminBookings from './pages/admin/Bookings.jsx';
import AdminLiveTracking from './pages/admin/LiveTracking.jsx';
import AdminDisputes from './pages/admin/Disputes.jsx';
import AdminAuditLogs from './pages/admin/AuditLogs.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/become-provider" element={<BecomeProvider />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Route>

        {/* CUSTOMER PROTECTED ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['customer', 'admin']} />}>
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<Navigate to="/customer/dashboard" replace />} />
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="bookings" element={<CustomerBookings />} />
            <Route path="bookings/:id" element={<CustomerBookingDetail />} />
            <Route path="tracking/:bookingId" element={<CustomerTrackingPage />} />
            <Route path="favorites" element={<CustomerFavorites />} />
            <Route path="disputes" element={<CustomerDisputes />} />
            <Route path="notifications" element={<CustomerNotifications />} />
            <Route path="messages" element={<CustomerMessages />} />
            <Route path="profile" element={<CustomerProfile />} />
          </Route>
        </Route>

        {/* PROVIDER PROTECTED ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['provider', 'admin']} />}>
          <Route path="/provider" element={<ProviderLayout />}>
            <Route index element={<Navigate to="/provider/dashboard" replace />} />
            <Route path="dashboard" element={<ProviderDashboard />} />
            <Route path="jobs" element={<ProviderJobs />} />
            <Route path="services" element={<ProviderServices />} />
            <Route path="availability" element={<ProviderAvailability />} />
            <Route path="earnings" element={<ProviderEarnings />} />
            <Route path="trust-passport" element={<ProviderTrustPassportView />} />
            <Route path="verification" element={<ProviderVerification />} />
            <Route path="onboarding" element={<ProviderVerification />} />
            <Route path="reviews" element={<ProviderReviews />} />
            <Route path="messages" element={<CustomerMessages />} />
            <Route path="profile" element={<ProviderProfile />} />
          </Route>
        </Route>

        {/* ADMIN PROTECTED ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'support']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="verifications" element={<AdminVerifications />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="providers" element={<AdminProviders />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="services" element={<AdminCategories />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="live-tracking" element={<AdminLiveTracking />} />
            <Route path="disputes" element={<AdminDisputes />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
          </Route>
        </Route>

        {/* 404 CATCH-ALL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
