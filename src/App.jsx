import { BrowserRouter, Route, Routes } from 'react-router-dom';

import PublicLayout from './layouts/PublicLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';

import HomePage from './pages/Home.jsx';
import LoginPage from './pages/Auth/LoginPage.jsx';
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages share Header + Footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/tours" element={<TourListingPage />} />
          <Route path="/tours/:id" element={<TourDetailsPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/booking/payment" element={<PaymentPage />} />
          <Route path="/booking/confirmation" element={<ConfirmationPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogPostPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* User dashboard uses Sidebar */}
        <Route element={<DashboardLayout role="user" />}>
          <Route path="/dashboard" element={<UserDashboardPage />} />
        </Route>

        {/* Admin pages use Sidebar with admin links */}
        <Route element={<DashboardLayout role="admin" />}>
          <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin-bookings" element={<AdminBookingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
