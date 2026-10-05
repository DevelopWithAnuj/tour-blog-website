import { Router } from 'express';
import { requireRole, verifyJWT } from '../middleware/auth.Middleware.js';
import { validate } from '../middleware/validator.Middleware.js';
import { UserRolesEnum } from '../utils/constants.js';
import {
  bookingCreateValidator,
  bookingPaymentValidator,
} from '../validators/index.js';
import {
  createBooking,
  cancelBooking,
  confirmBooking,
  getBookingById,
  getBookings,
  payBooking,
} from '../controllers/booking.Controller.js';

const router = Router();

router.use(verifyJWT);

router
  .route('/')
  .post(bookingCreateValidator(), validate, createBooking)
  .get(getBookings);
router.route('/:id').get(getBookingById);
router.route('/:id/pay').post(bookingPaymentValidator(), validate, payBooking);
router.route('/:id/cancel').patch(cancelBooking);
router
  .route('/:id/confirm')
  .patch(requireRole(UserRolesEnum.ADMIN), confirmBooking);

export default router;
