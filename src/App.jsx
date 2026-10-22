import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useServerStatus } from './context/ServerStatusContext.jsx';
import ServerUnavailablePage from './pages/ServerUnavailablePage.jsx';

import PublicLayout from './layouts/PublicLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
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
import AdminToursPage from './pages/Admin/AdminToursPage.jsx';
import AdminTourFormPage from './pages/Admin/AdminTourFormPage.jsx';
import AdminBlogPage from './pages/Admin/AdminBlogPage.jsx';
import AdminBlogFormPage from './pages/Admin/AdminBlogFormPage.jsx';
import AdminUsersPage from './pages/Admin/AdminUsersPage.jsx';
import MyPostsPage from './pages/Dashboard/MyPostsPage.jsx';
import MyPostFormPage from './pages/Dashboard/MyPostFormPage.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import AboutPage from './pages/Info/AboutPage.jsx';
import ContactPage from './pages/Info/ContactPage.jsx';
import ContactSupportPage from './pages/Info/ContactSupportPage.jsx';
import HelpPage from './pages/Info/HelpPage.jsx';
import PrivacyPage from './pages/Info/PrivacyPage.jsx';
import TermsPage from './pages/Info/TermsPage.jsx';
import LocationsPage from './pages/Info/LocationsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { useState } from 'react';

export default function App() {
  const { status, retry } = useServerStatus();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    await retry();
    setRetrying(false);
  };

  if (status === 'checking') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-5 text-center text-white/70"
      >
        <span
          aria-hidden="true"
          className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-amber-400"
        />
        <p className="mt-5 text-base font-medium text-white">
          Connecting to Drimora…
        </p>
        <p className="mt-2 max-w-sm text-sm">
          We’ll keep checking this connection for up to 15 seconds. Please wait
          while the server responds.
        </p>
      </div>
    );
  }

  if (status === 'down') {
    return <ServerUnavailablePage onRetry={handleRetry} retrying={retrying} />;
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public pages share Header + Footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/contact-support" element={<ContactSupportPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/tours" element={<TourListingPage />} />
          <Route path="/tours/:id" element={<TourDetailsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Route>

        <Route element={<AuthLayout />}>
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
          <Route path="/my-posts" element={<MyPostsPage />} />
          <Route path="/my-posts/new" element={<MyPostFormPage />} />
          <Route path="/my-posts/:id/edit" element={<MyPostFormPage />} />
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
          <Route path="/admin-tours" element={<AdminToursPage />} />
          <Route path="/admin-tours/new" element={<AdminTourFormPage />} />
          <Route path="/admin-tours/:id/edit" element={<AdminTourFormPage />} />
          <Route path="/admin-blog" element={<AdminBlogPage />} />
          <Route path="/admin-blog/new" element={<AdminBlogFormPage />} />
          <Route path="/admin-blog/:id/edit" element={<AdminBlogFormPage />} />
          <Route path="/admin-users" element={<AdminUsersPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
