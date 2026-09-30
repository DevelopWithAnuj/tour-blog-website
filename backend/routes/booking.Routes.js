import { Router } from "express";
import { requireRole, verifyJWT } from "../middleware/auth.Middleware";
import { UserRolesEnum } from "../utils/constants";


const router =  Router()
// requireRole middleware exists in auth.Middleware.js but is never used anywhere. Right now nothing server-side actually enforces admin-only access — ProtectedRoute is frontend-only and trivially bypassed by calling the API directly. When you wire up adminRoutes.js and bookingRoutes.js, apply both:
router
  .route('/bookings')
  .get(verifyJWT, requireRole(UserRolesEnum.ADMIN), getBookings);

export default router
