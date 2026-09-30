// Booking routes for creating, listing, and confirming bookings
export const bookingRoutes = {
  create: '/api/bookings',
  list: '/api/bookings',
  detail: '/api/bookings/:id',
  confirm: '/api/bookings/:id/confirm',
};

// requireRole middleware exists in auth.Middleware.js but is never used anywhere. Right now nothing server-side actually enforces admin-only access — ProtectedRoute is frontend-only and trivially bypassed by calling the API directly. When you wire up adminRoutes.js and bookingRoutes.js, apply both:
// router.get('/dashboard', verifyJWT, requireRole('admin'), getDashboard);
