import mongoose, { Schema } from 'mongoose';

export const INQUIRY_TYPES = ['general', 'support'];
export const INQUIRY_STATUS = ['new', 'resolved'];

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
  },
  { timestamps: true }
);

inquirySchema.index({createdAt: -1})

export const Inquiry = mongoose.model('Inquiry', inquirySchema)
