import { Router } from 'express';
import {
  getBookings,
  getDashboard,
  getUsers,
  updateBookingStatus,
} from '../controllers/admin.Controller.js';
import { requireRole, verifyJWT } from '../middleware/auth.Middleware.js';
import { UserRolesEnum } from '../utils/constants.js';

const router = Router();

router.use(verifyJWT, requireRole(UserRolesEnum.ADMIN));

router.get('/dashboard', getDashboard);
router.get('/bookings', getBookings);
router.patch('/bookings/:id/status', updateBookingStatus);
router.get('/users', getUsers);

export default router;
