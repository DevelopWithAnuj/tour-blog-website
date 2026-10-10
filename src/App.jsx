import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useServerStatus } from './context/ServerStatusContext.jsx';
import ServerUnavailablePage from './pages/ServerUnavailablePage.jsx';

import PublicLayout from './layouts/PublicLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';

import ProtectedRoute from './components/ProtectedRoute.jsx';

import HomePage from './pages/Home.jsx';
import LoginPage from './pages/Auth/LoginPage.jsx';
import RegisterPage from './pages/Auth/RegisterPage.jsx';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage.jsx';

import TourListingPage from './pages/Tours/TourListingPage.jsx';
import TourDetailsPage from './pages/Tours/TourDetailsPage.jsx';
import BookingPage from './pages/Booking/BookingPage.jsx';
import PaymentPage from './pages/Booking/PaymentPage.jsx';
import ConfirmationPage from './pages/Booking/ConfirmationPage.jsx';

import BlogPage from './pages/Blog/BlogPage.jsx';
import BlogPostPage from './pages/Blog/BlogPostPage.jsx';

import UserDashboardPage from './pages/Dashboard/UserDashboardPage.jsx';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage.jsx';
import AdminBookingsPage from './pages/Admin/AdminBookingsPage.jsx';
import AdminUsersPage from './pages/Admin/AdminUsersPage.jsx';
import { useState } from 'react';

export default function App() {
  const { status, retry } = useServerStatus();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    await retry();
    setRetrying(false);
  };

  if (status === 'checking' && !retrying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white/70 text-sm">
        Connecting to Drimora…
      </div>
    );
  }

  if (status === 'down' || (status === 'checking' && retrying)) {
    return <ServerUnavailablePage onRetry={handleRetry} retrying={retrying} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages share Header + Footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/tours" element={<TourListingPage />} />
          <Route path="/tours/:id" element={<TourDetailsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/reset-password/:resetToken"
            element={<ResetPasswordPage />}
          />
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <PublicLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/booking/payment" element={<PaymentPage />} />
          <Route path="/booking/confirmation" element={<ConfirmationPage />} />
        </Route>

        {/* User dashboard uses Sidebar */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout role="user" />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<UserDashboardPage />} />
        </Route>

        {/* Admin pages use Sidebar with admin links */}
        <Route
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout role="admin" />
            </ProtectedRoute>
          }
        >
          <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin-bookings" element={<AdminBookingsPage />} />
          <Route path="/admin-users" element={<AdminUsersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
