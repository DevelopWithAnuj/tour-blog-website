import mongoose from 'mongoose';
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpStatus } from '../utils/constants.js';
import { Booking } from '../models/Booking.models.js';
import { Tour } from '../models/Tour.models.js';

const TOUR_FIELDS = 'title destination location image duration';

const findAccessibleBooking = async (req) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(HttpStatus.NOT_FOUND, 'Booking not found');
  }
  const booking = await Booking.findById(req.params.id).populate(
    'tour',
    TOUR_FIELDS
  );
  const isOwner = booking && String(booking.user) === String(req.user._id);
  if (!booking || (!isOwner && req.user.role !== 'admin')) {
    throw new ApiError(HttpStatus.NOT_FOUND, 'Booking not found');
  }
  return booking;
};

const createBooking = asyncHandler(async (req, res) => {
  const {
    tourId,
    date,
    guestCount,
    travelerName,
    travelerEmail,
    travelerPhone,
    specialRequests,
  } = req.body;

  const tour = await Tour.findOne({ _id: tourId, isActive: true });
  if (!tour) throw new ApiError(HttpStatus.NOT_FOUND, 'Tour not found.');

  const guests = Number(guestCount);
  const booking = await Booking.create({
    tour: tour._id,
    user: req.user._id,
    date,
    guestCount: guests,
    travelerName,
    travelerEmail,
    travelerPhone,
    specialRequests,
    totalAmount: tour.price * guests,
  });

  res
    .status(HttpStatus.CREATED)
    .json(new ApiResponse(HttpStatus.CREATED, { booking }, 'Booking created'));
});

const getBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('tour', TOUR_FIELDS)
    .sort({ date: -1 });
  res
    .status(HttpStatus.OK)
    .json(
      new ApiResponse(
        HttpStatus.OK,
        { bookings },
        'Booking fetched successfully'
      )
    );
});

const getBookingById = asyncHandler(async (req, res) => {
  const booking = await findAccessibleBooking(req);
  res
    .status(HttpStatus.OK)
    .json(new ApiResponse(HttpStatus.OK, { booking }, 'Booking fetched'));
});

// Mock gateway

const payBooking = asyncHandler(async (req, res) => {
  const booking = await findAccessibleBooking(req);
  if (String(booking.user._id ?? booking.user) !== String(req.user._id)) {
    throw new ApiError(HttpStatus.NOT_FOUND, 'Booking not found');
  }

  if (booking.status === 'cancelled') {
    throw new ApiError(HttpStatus.CONFLICT, 'Booking is cancelled!');
  }

  if (booking.paymentStatus === 'paid') {
    throw new ApiError(HttpStatus.CONFLICT, 'Booking is already paid');
  }
  const { method, cardNumber } = req.body; // card data never stored
  booking.paymentMethod = method;

  if (method === 'card' && cardNumber.endsWith('0000')) {
    booking.paymentStatus = 'failed';
    await booking.save();
    throw new ApiError(
      HttpStatus.UNPROCESSABLE_ENTITY,
      'Payment declined. Please try another card'
    );
  }

  booking.paymentStatus = 'paid';
  await booking.save();
  res
    .status(HttpStatus.OK)
    .json(new ApiResponse(HttpStatus.OK, { booking }, 'Payment successfull'));
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await findAccessibleBooking(req);
  if (booking.status === 'cancelled') {
    throw new ApiError(HttpStatus.CONFLICT, 'Booking already cancelled');
  }
  if (booking.paymentStatus === 'paid') {
    throw new ApiError(
      HttpStatus.CONFLICT,
      'Paid bookings cannot be cancelled online. Please contact support.'
    );
  }

  booking.status = 'cancelled';
  await booking.save();
  res
    .status(HttpStatus.OK)
    .json(new ApiResponse(HttpStatus.OK, { booking }, 'Booking cancelled'));
});

const confirmBooking = asyncHandler(async (req, res) => {
  const booking = await findAccessibleBooking(req);
  if (booking.status === 'cancelled') {
    throw new ApiError(
      HttpStatus.CONFLICT,
      'Cannot confirm a cancelled booking'
    );
  }

  if (booking.paymentStatus !== 'paid') {
    throw new ApiError(HttpStatus.CONFLICT, 'Cannot confirm an unpaid booking');
  }

  booking.status = 'confirmed';
  await booking.save();
  res
    .status(HttpStatus.OK)
    .json(
      new ApiResponse(
        HttpStatus.OK,
        { booking },
        'Booking confirmed successfully'
      )
    );
});

export {
  createBooking,
  getBookings,
  getBookingById,
  payBooking,
  cancelBooking,
  confirmBooking,
};
