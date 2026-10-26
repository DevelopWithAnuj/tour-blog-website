import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'motion/react';

import PublicLayout from './layouts/PublicLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';

import ProtectedRoute from './components/ProtectedRoute.jsx';

const HomePage = lazy(() => import('./pages/Home.jsx'));
const LoginPage = lazy(() => import('./pages/Auth/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage.jsx'));
const ForgotPasswordPage = lazy(
  () => import('./pages/Auth/ForgotPasswordPage.jsx')
);
const ResetPasswordPage = lazy(
  () => import('./pages/Auth/ResetPasswordPage.jsx')
);

const TourListingPage = lazy(() => import('./pages/Tours/TourListingPage.jsx'));
const TourDetailsPage = lazy(() => import('./pages/Tours/TourDetailsPage.jsx'));
const BookingPage = lazy(() => import('./pages/Booking/BookingPage.jsx'));
const PaymentPage = lazy(() => import('./pages/Booking/PaymentPage.jsx'));
const ConfirmationPage = lazy(
  () => import('./pages/Booking/ConfirmationPage.jsx')
);

const BlogPage = lazy(() => import('./pages/Blog/BlogPage.jsx'));
const BlogPostPage = lazy(() => import('./pages/Blog/BlogPostPage.jsx'));

const UserDashboardPage = lazy(
  () => import('./pages/Dashboard/UserDashboardPage.jsx')
);
const AdminDashboardPage = lazy(
  () => import('./pages/Admin/AdminDashboardPage.jsx')
);
const AdminBookingsPage = lazy(
  () => import('./pages/Admin/AdminBookingsPage.jsx')
);
const AdminToursPage = lazy(() => import('./pages/Admin/AdminToursPage.jsx'));
const AdminTourFormPage = lazy(
  () => import('./pages/Admin/AdminTourFormPage.jsx')
);
const AdminBlogPage = lazy(() => import('./pages/Admin/AdminBlogPage.jsx'));
const AdminBlogFormPage = lazy(
  () => import('./pages/Admin/AdminBlogFormPage.jsx')
);
const AdminUsersPage = lazy(() => import('./pages/Admin/AdminUsersPage.jsx'));
const MyPostsPage = lazy(() => import('./pages/Dashboard/MyPostsPage.jsx'));
const MyPostFormPage = lazy(
  () => import('./pages/Dashboard/MyPostFormPage.jsx')
);
const AdminNewsletterPage = lazy(
  () => import('./pages/Admin/AdminNewsletterPage.jsx')
);
const AdminInquiriesPage = lazy(
  () => import('./pages/Admin/AdminInquiriesPage.jsx')
);

import ScrollToTop from './components/ScrollToTop.jsx';

const AboutPage = lazy(() => import('./pages/Info/AboutPage.jsx'));
const ContactPage = lazy(() => import('./pages/Info/ContactPage.jsx'));
const ContactSupportPage = lazy(
  () => import('./pages/Info/ContactSupportPage.jsx')
);
const HelpPage = lazy(() => import('./pages/Info/HelpPage.jsx'));
const PrivacyPage = lazy(() => import('./pages/Info/PrivacyPage.jsx'));
const TermsPage = lazy(() => import('./pages/Info/TermsPage.jsx'));
const LocationsPage = lazy(() => import('./pages/Info/LocationsPage.jsx'));
const UnsubscribePage = lazy(() => import('./pages/Info/UnsubscribePage.jsx'));
const InquiryTrackerPage = lazy(
  () => import('./pages/Info/InquiryTrackerPage.jsx')
);

const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));
import ServerBanner from './components/ServerBanner.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <ServerBanner />
        <ScrollToTop />
        <Suspense
          fallback={
            <div className="p-8 text-center text-white/60">Loading…</div>
          }
        >
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
              <Route
                path="/inquiry-tracker/:token"
                element={<InquiryTrackerPage />}
              />
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
              <Route
                path="/admin-newsletter"
                element={<AdminNewsletterPage />}
              />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </MotionConfig>
    </BrowserRouter>
  );
}
