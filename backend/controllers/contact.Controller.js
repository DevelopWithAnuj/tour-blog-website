import crypto from 'node:crypto';
import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { HttpStatus } from '../utils/constants.js';
import { Inquiry } from '../models/Inquiry.models.js';
import { Booking } from '../models/Booking.models.js';
import logger from '../config/logger.js';
import { sendEmail, inquiryTrackingMailgenContent } from '../utils/mail.js';

const RECEIVED = 'Thanks, we received your message.';
const TRACKING_TOKEN_BYTES = 32;
const TRACKING_TOKEN_LIFETIME_MS = 365 * 24 * 60 * 60 * 1000;

const hashTrackingToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const getClientUrl = () =>
  process.env.CLIENT_URL ||
  process.env.CORS_ORIGIN?.split(',')[0] ||
  'http://localhost:5173';

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

  const isGuest = !req.user;
  const trackingToken = isGuest
    ? crypto.randomBytes(TRACKING_TOKEN_BYTES).toString('hex')
    : null;
  const inquiry = await Inquiry.create({
    name,
    email,
    subject,
    message,
    type,
    user: req.user?._id,
    booking: booking?._id,
    ...(trackingToken
      ? {
          trackingTokenHash: hashTrackingToken(trackingToken),
          trackingTokenExpiresAt: new Date(
            Date.now() + TRACKING_TOKEN_LIFETIME_MS
          ),
        }
      : {}),
    statusHistory: [{ status: 'new', message: '' }],
  });

  let trackingEmailSent = false;
  if (trackingToken) {
    const trackingUrl = `${getClientUrl()}/inquiry-tracker/${trackingToken}`;
    try {
      await sendEmail({
        email,
        subject: 'Track your Drimora support request',
        mailgenContent: inquiryTrackingMailgenContent(
          name,
          subject,
          trackingUrl
        ),
      });
      trackingEmailSent = true;
    } catch (error) {
      logger.error(
        `Inquiry tracking email failed for ${inquiry._id}: ${error.message}`
      );
    }
  }

  logger.info(`New ${type} inquiry ${inquiry._id}`);

  const responseMessage = isGuest
    ? trackingEmailSent
      ? `${RECEIVED} We sent a private tracking link to your email.`
      : `${RECEIVED} We could not email your private tracking link. Please contact us if you need an update.`
    : `${RECEIVED} Track updates from your dashboard.`;

  res
    .status(HttpStatus.CREATED)
    .json(
      new ApiResponse(
        HttpStatus.CREATED,
        { trackingByEmail: trackingEmailSent },
        responseMessage
      )
    );
});

const getMyInquiries = asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.find({ user: req.user._id })
    .select('subject message type status statusHistory createdAt updatedAt')
    .sort({ createdAt: -1 });

  res
    .status(HttpStatus.OK)
    .json(
      new ApiResponse(HttpStatus.OK, { inquiries }, 'Your inquiries fetched')
    );
});

const getInquiryByTrackingToken = asyncHandler(async (req, res) => {
  const trackingTokenHash = hashTrackingToken(req.params.token);
  const inquiry = await Inquiry.findOne({
    trackingTokenHash,
    trackingTokenExpiresAt: { $gt: new Date() },
  }).select('subject message type status statusHistory createdAt updatedAt');

  if (!inquiry) {
    throw new ApiError(
      HttpStatus.NOT_FOUND,
      'Tracking link is invalid or expired'
    );
  }

  res
    .status(HttpStatus.OK)
    .json(
      new ApiResponse(HttpStatus.OK, { inquiry }, 'Inquiry status fetched')
    );
});

export {
  createInquiry,
  getMyInquiries,
  getInquiryByTrackingToken,
  hashTrackingToken,
};
