import { BrowserRouter, Route, Routes } from 'react-router-dom';

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
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/tours" element={<TourListingPage />} />
        <Route path="/tours/:id" element={<TourDetailsPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/booking/payment" element={<PaymentPage />} />
        <Route path="/booking/confirmation" element={<ConfirmationPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogPostPage />} />
        <Route path="/dashboard" element={<UserDashboardPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin-bookings" element={<AdminBookingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
