import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'motion/react';

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
import AdminNewsletterPage from './pages/Admin/AdminNewsletterPage.jsx';
import AdminInquiriesPage from './pages/Admin/AdminInquiriesPage.jsx';

import ScrollToTop from './components/ScrollToTop.jsx';

import AboutPage from './pages/Info/AboutPage.jsx';
import ContactPage from './pages/Info/ContactPage.jsx';
import ContactSupportPage from './pages/Info/ContactSupportPage.jsx';
import HelpPage from './pages/Info/HelpPage.jsx';
import PrivacyPage from './pages/Info/PrivacyPage.jsx';
import TermsPage from './pages/Info/TermsPage.jsx';
import LocationsPage from './pages/Info/LocationsPage.jsx';
import UnsubscribePage from './pages/Info/UnsubscribePage.jsx';

import NotFoundPage from './pages/NotFoundPage.jsx';
import ServerBanner from './components/ServerBanner.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <ServerBanner />
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
            <Route path="/unsubscribe/:token" element={<UnsubscribePage />} />
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
            <Route
              path="/booking/confirmation"
              element={<ConfirmationPage />}
            />
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
            <Route
              path="/admin-tours/:id/edit"
              element={<AdminTourFormPage />}
            />
            <Route path="/admin-blog" element={<AdminBlogPage />} />
            <Route path="/admin-blog/new" element={<AdminBlogFormPage />} />
            <Route
              path="/admin-blog/:id/edit"
              element={<AdminBlogFormPage />}
            />
            <Route path="/admin-inquiries" element={<AdminInquiriesPage />} />
            <Route path="/admin-users" element={<AdminUsersPage />} />
            <Route path="/admin-newsletter" element={<AdminNewsletterPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MotionConfig>
    </BrowserRouter>
  );
}
