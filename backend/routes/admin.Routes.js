// Admin routes for dashboard and management pages
export const adminRoutes = {
  dashboard: '/api/admin/dashboard',
  bookings: '/api/admin/bookings',
  users: '/api/admin/users',
};

// requireRole middleware exists in auth.Middleware.js but is never used anywhere. Right now nothing server-side actually enforces admin-only access — ProtectedRoute is frontend-only and trivially bypassed by calling the API directly. When you wire up adminRoutes.js and bookingRoutes.js, apply both:
// router.get('/dashboard', verifyJWT, requireRole('admin'), getDashboard);
