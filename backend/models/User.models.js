import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {
  AvailableUserRoles,
  Config,
  UserRolesEnum,
} from '../utils/constants.js';

const userSchema = new Schema(
  {
    avatar: {
      url: {
        type: String,
        default: 'https://placehold.co/200x200',
      },
      localPath: {
        type: String,
        default: '',
      },
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    savedDestinations: {
      type: [{ type: String, trim: true, maxlength: 80 }],
      default: [],
      validate: {
        validator: (destinations) => destinations.length <= 30,
        message: 'You can save at most 30 destinations.',
      },
    },
    role: {
      type: String,
      enum: AvailableUserRoles,
      default: UserRolesEnum.USER,
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === 'local';
      },
      select: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockUntil: {
      type: Date,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    forgotPasswordToken: {
      type: String,
      select: false,
      index: true,
    },
    forgotPasswordExpiry: {
      type: Date,
      select: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
      index: true,
    },
    emailVerificationExpiry: {
      type: Date,
      select: false,
    },
    googleId: {
      type: String,
      select: false,
    },
    githubId: {
      type: String,
      select: false,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'github'],
      default: 'local',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.passwordChangedAt;
        return ret;
      },
    },
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) this.passwordChangedAt = new Date();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  if (!password || !this.password) {
    return false;
  }

  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (sid) {
  return jwt.sign(
    {
      _id: this._id,
      sid: String(sid),
      email: this.email,
      username: this.username,
      role: this.role || 'user',
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: Config.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function (sid) {
  return jwt.sign(
    {
      _id: this._id,
      sid: String(sid),
      jti: crypto.randomBytes(8).toString('hex'),
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
  );
};

userSchema.methods.generateTemporaryToken = function (
  expiryMs = 24 * 60 * 60 * 1000
) {
  const unHashedToken = crypto.randomBytes(20).toString('hex');

  const hashedToken = crypto
    .createHash('sha256')
    .update(unHashedToken)
    .digest('hex');

  const tokenExpiry = new Date(Date.now() + expiryMs);

  return { unHashedToken, hashedToken, tokenExpiry };
};

export const User = mongoose.model('User', userSchema);
