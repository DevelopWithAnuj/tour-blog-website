import mongoose from 'mongoose';
import { BlogPost } from '../models/Blog.models.js';
import { Booking, BOOKING_STATUS } from '../models/Booking.models.js';
import { Tour } from '../models/Tour.models.js';
import { User } from '../models/User.models.js';
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpStatus, UserRolesEnum } from '../utils/constants.js';

const TOUR_FIELDS = 'title destination location image';
const USER_FIELDS = 'fullName username email role createdAt';
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getPagination = (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(query.limit, 10) || 20, 1),
    100
  );
  return { page, limit, skip: (page - 1) * limit };
};

const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalBookings,
    pendingBookings,
    confirmedBookings,
    cancelledBookings,
    totalUsers,
    totalBlogs,
    publishedBlogs,
    recentBookings,
  ] = await Promise.all([
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'pending' }),
    Booking.countDocuments({ status: 'confirmed' }),
    Booking.countDocuments({ status: 'cancelled' }),
    User.countDocuments(),
    BlogPost.countDocuments(),
    BlogPost.countDocuments({ status: 'published' }),
    Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('tour', TOUR_FIELDS)
      .populate('user', USER_FIELDS),
  ]);

  res.status(HttpStatus.OK).json(
    new ApiResponse(
      HttpStatus.OK,
      {
        stats: {
          totalBookings,
          pendingBookings,
          confirmedBookings,
          cancelledBookings,
          totalUsers,
          totalBlogs,
          publishedBlogs,
        },
        recentBookings,
      },
      'Admin dashboard fetched'
    )
  );
});

const getBookings = asyncHandler(async (req, res) => {
  const { status, q } = req.query;
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (status && status !== 'all') {
    if (!BOOKING_STATUS.includes(String(status))) {
      throw new ApiError(HttpStatus.BAD_REQUEST, 'Invalid booking status');
    }
    filter.status = String(status);
  }

  if (q && String(q).trim()) {
    const term = escapeRegex(String(q).trim().slice(0, 100));
    const matchingUsers = await User.find({
      $or: [
        { fullName: { $regex: term, $options: 'i' } },
        { username: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
      ],
    }).distinct('_id');
    const matchingTours = await Tour.find({
      $or: [
        { title: { $regex: term, $options: 'i' } },
        { destination: { $regex: term, $options: 'i' } },
      ],
    }).distinct('_id');
    filter.$or = [
      { travelerName: { $regex: term, $options: 'i' } },
      { travelerEmail: { $regex: term, $options: 'i' } },
      { user: { $in: matchingUsers } },
      { tour: { $in: matchingTours } },
    ];
  }

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('tour', TOUR_FIELDS)
      .populate('user', USER_FIELDS),
    Booking.countDocuments(filter),
  ]);

  res
    .status(HttpStatus.OK)
    .json(
      new ApiResponse(
        HttpStatus.OK,
        { bookings, total, page, pages: Math.ceil(total / limit) },
        'Admin bookings fetched'
      )
    );
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(HttpStatus.NOT_FOUND, 'Booking not found');
  }
  if (!BOOKING_STATUS.includes(status)) {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'Invalid booking status');
  }

  const booking = await Booking.findById(id);
  if (!booking) throw new ApiError(HttpStatus.NOT_FOUND, 'Booking not found');
  if (booking.status === 'cancelled' && status !== 'cancelled') {
    throw new ApiError(
      HttpStatus.CONFLICT,
      'Cancelled bookings cannot be reopened'
    );
  }
  if (status === 'confirmed' && booking.paymentStatus !== 'paid') {
    throw new ApiError(HttpStatus.CONFLICT, 'Cannot confirm an unpaid booking');
  }
  if (status === 'pending' && booking.paymentStatus === 'paid') {
    throw new ApiError(
      HttpStatus.CONFLICT,
      'Paid bookings cannot be set to pending'
    );
  }

  if (booking.status !== status) {
    booking.status = status;
    if (status === 'cancelled') {
      booking.cancelledAt = new Date();
      if (booking.paymentStatus === 'paid') booking.paymentStatus = 'refunded';
    }
    await booking.save();
  }

  await booking.populate([
    { path: 'tour', select: TOUR_FIELDS },
    { path: 'user', select: USER_FIELDS },
  ]);

  res
    .status(HttpStatus.OK)
    .json(
      new ApiResponse(HttpStatus.OK, { booking }, 'Booking status updated')
    );
});

const getUsers = asyncHandler(async (req, res) => {
  const { q, role } = req.query;
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (role && role !== 'all') {
    if (!Object.values(UserRolesEnum).includes(String(role))) {
      throw new ApiError(HttpStatus.BAD_REQUEST, 'Invalid user role');
    }
    filter.role = String(role);
  }
  if (q && String(q).trim()) {
    const term = escapeRegex(String(q).trim().slice(0, 100));
    filter.$or = [
      { fullName: { $regex: term, $options: 'i' } },
      { username: { $regex: term, $options: 'i' } },
      { email: { $regex: term, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select(USER_FIELDS)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res
    .status(HttpStatus.OK)
    .json(
      new ApiResponse(
        HttpStatus.OK,
        { users, total, page, pages: Math.ceil(total / limit) },
        'Admin users fetched'
      )
    );
});

export { getDashboard, getBookings, updateBookingStatus, getUsers };
