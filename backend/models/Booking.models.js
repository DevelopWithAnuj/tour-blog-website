import mongoose, { Schema } from 'mongoose';
import { CancellationPolicy } from '../utils/constants.js';

export const BOOKING_STATUS = ['pending', 'confirmed', 'cancelled'];
export const PAYMENT_STATUS = ['unpaid', 'paid', 'failed', 'refunded'];

const HOUR = 60 * 60 * 1000;

const bookingSchema = new Schema(
  {
    tour: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: { type: Date, required: true },
    guestCount: { type: Number, required: true, min: 1, max: 20 },
    travelerName: { type: String, required: true, trim: true },
    travelerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    travelerPhone: { type: String, trim: true, default: '' },
    specialRequests: { type: String, trim: true, maxlength: 500, default: '' },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: { type: String, enum: PAYMENT_STATUS, default: 'unpaid' },
    paymentMethod: { type: String, default: '' },
    status: { type: String, enum: BOOKING_STATUS, default: 'pending' },
    paidAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

// last moment a paid booking can be cancelled (null if not paid).
bookingSchema.virtual('cancellableUntil').get(function () {
  if (this.paymentStatus !== 'paid') return null;
  const paidAt = (this.paidAt || this.updatedAt).getTime();
  const byPayment = paidAt + CancellationPolicy.WINDOW_HOURS * HOUR;

  const byTravel =
    this.date.getTime() - CancellationPolicy.MIN_HOURS_BEFORE_TRAVEL * HOUR;
  return new Date(Math.min(byPayment, byTravel));
});

bookingSchema.virtual('canCancel').get(function () {
  if (this.status === 'cancelled') return false;
  if (this.paymentStatus !== 'paid') return true;
  return Date.now() <= this.cancellableUntil.getTime();
});

export const Booking = mongoose.model('Booking', bookingSchema);
