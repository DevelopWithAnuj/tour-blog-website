import mongoose, { Schema } from 'mongoose';

const refreshSessionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: { type: String, required: true },
    prevHash: { type: String },
    prevValidUntil: { type: Date },
    userAgent: { type: String, default: '', maxlength: 300 },
    lastUsedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

refreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshSession = mongoose.model(
  'RefreshSession',
  refreshSessionSchema
);
