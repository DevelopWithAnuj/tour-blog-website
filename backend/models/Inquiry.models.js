import mongoose, { Schema } from 'mongoose';

export const INQUIRY_TYPES = ['general', 'support'];
export const INQUIRY_STATUS = ['new', 'under_review', 'resolved'];

const statusUpdateSchema = new Schema(
  {
    status: { type: String, enum: INQUIRY_STATUS, required: true },
    message: { type: String, trim: true, maxlength: 2000, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const inquirySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    subject: { type: String, required: true, trim: true, maxlength: 150 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    type: { type: String, enum: INQUIRY_TYPES, default: 'general' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking' },
    status: { type: String, enum: INQUIRY_STATUS, default: 'new', index: true },
    statusHistory: { type: [statusUpdateSchema], default: [] },
    trackingTokenHash: { type: String, select: false, index: true },
    trackingTokenExpiresAt: { type: Date, select: false },
  },
  { timestamps: true }
);

inquirySchema.index({ createdAt: -1 });

export const Inquiry = mongoose.model('Inquiry', inquirySchema);
