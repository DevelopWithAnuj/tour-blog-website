import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { HttpStatus } from '../utils/constants.js';
import { Inquiry } from '../models/Inquiry.models.js';
import { Booking } from '../models/Booking.models.js';
import logger from '../config/logger.js';

const RECEIVED = 'Thanks, we received your message.';

const createInquiry = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    subject,
    message,
    type = 'general',
    bookingId,
  } = req.body;

  let booking;
  if (bookingId) {
    if (!req.user) {
      throw new ApiError(
        HttpStatus.UNAUTHORIZED,
        'Sign in to contact us about a booking'
      );
    }
    booking = await Booking.findOne({
      _id: bookingId,
      user: req.user._id,
    }).select('_id');
    if (!booking) throw new ApiError(HttpStatus.NOT_FOUND, 'Booking not found');
  }

  const inquiry = await Inquiry.create({
    name,
    email,
    subject,
    message,
    type,
    user: req.user?._id,
    booking: booking?._id,
  });
  logger.info(`New ${type} inquiry ${inquiry._id}`);

  res
    .status(HttpStatus.CREATED)
    .json(new ApiResponse(HttpStatus.CREATED, {}, RECEIVED));
});

export { createInquiry };
