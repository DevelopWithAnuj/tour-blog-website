import mongoose, { Schema } from 'mongoose';

export const BOOKING_STATUS = ['pending', 'confirmed', 'cancelled'];
export const PAYMENT_STATUS = ['unpaid', 'paid', 'failed'];

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
  },
  { timestamps: true }
);

export const Booking = mongoose.model('Booking', bookingSchema)
