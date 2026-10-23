import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto'

const subscriberSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    // Sparse so subscribers saved before this field existed don't collide.


    unsubscribeToken: {
      type: String,
      unique: true,
      sparse: true,
      default: () => crypto.randomBytes(16).toString('hex'),
    },
    unsubscribedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Subscriber = mongoose.model('Subscriber', subscriberSchema);
