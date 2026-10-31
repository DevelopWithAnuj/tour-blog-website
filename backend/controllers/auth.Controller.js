import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from '../utils/api-error.js';
import { CookieOptions, HttpStatus } from '../utils/constants.js';
import { User } from '../models/User.models.js';
import bcrypt from 'bcrypt';
import { RefreshSession } from '../models/RefreshSession.models.js';
import {
  ROTATION_GRACE_MS,
  clearAuthCookies,
  createSession,
  hashToken,
  setAuthCookies,
} from '../utils/session.js';

import crypto from 'crypto';
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
} from '../utils/mail.js';
import jwt from 'jsonwebtoken';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;
// Startup par ek baar: unknown email par bhi bcrypt ka same time lage
const DUMMY_HASH = bcrypt.hashSync('timing-equalizer', 12);

const oauthCallback = asyncHandler(async (req, res) => {
  const tokens = await createSession(req.user, req);
  setAuthCookies(res, tokens);
  res.redirect(
    `${process.env.CLIENT_URL || 'http://localhost:5173'}/${req.user.role === 'admin' ? 'admin-dashboard' : 'dashboard'}`
  );
});

const getClientUrl = () =>
  process.env.CLIENT_URL ||
  process.env.CORS_ORIGIN?.split(',')[0] ||
  'http://localhost:5173';

const verifyEmailUrl = (token) =>
  `${getClientUrl()}/verify-email/${encodeURIComponent(token)}`;

const registerUser = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '')
    .trim()
    .toLowerCase();
  const username = String(req.body.username || '')
    .trim()
    .toLowerCase();
  const password = String(req.body.password || '');
  const fullName = req.body.fullName || req.body.fullname || undefined;

  const existUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existUser) {
    throw new ApiError(
      HttpStatus.CONFLICT,
      'User with same email or username already exists',
      []
    );
  }

  let user;

  try {
    user = await User.create({
      email,
      password,
      username,
      fullName,
      isEmailVerified: false,
    });
  } catch (error) {
    if (error && error.code === 11000) {
      throw new ApiError(
        HttpStatus.CONFLICT,
        'User with same email or username already exists'
      );
    }
    throw error;
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      email: user?.email,
      subject: 'Verify your email',
      mailgenContent: emailVerificationMailgenContent(
        user.username,
        verifyEmailUrl(unHashedToken)
      ),
    });
  } catch (mailError) {
    await User.findByIdAndDelete(user._id);
    throw new ApiError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Failed to send verification email. Please try again later.'
    );
  }

  const createdUser = await User.findById(user._id);

  if (!createdUser) {
    throw new ApiError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Something went wrong while registering a user'
    );
  }

  return res.status(HttpStatus.CREATED).json(
    new ApiResponse(
      HttpStatus.CREATED,
      {
        user: createdUser,
      },
      'User registered successfully and verification email has been sent to your email'
    )
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '')
    .trim()
    .toLowerCase();
  const password = String(req.body.password || '');

  if (!email) throw new ApiError(HttpStatus.BAD_REQUEST, 'Email is required!');

  const user = await User.findOne({ email }).select(
    '+password +failedLoginAttempts +lockUntil'
  );

  const hash = user?.password || DUMMY_HASH;
  const match = await bcrypt.compare(password, hash);
  const passwordOk = Boolean(user?.password) && match;
  const locked = Boolean(user?.lockUntil && user.lockUntil > new Date());

  if (!user || locked || !passwordOk) {
    if (user && !locked) {
      const updated = await User.findOneAndUpdate(
        { _id: user._id },
        { $inc: { failedLoginAttempts: 1 } },
        { returnDocument: 'after' }
      ).select('+failedLoginAttempts');
      if (updated && updated.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              lockUntil: new Date(Date.now() + LOCK_MS),
              failedLoginAttempts: 0,
            },
          }
        );
      }
    }
    throw new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  if (user.failedLoginAttempts || user.lockUntil) {
    await User.updateOne(
      { _id: user._id },
      { $set: { failedLoginAttempts: 0 }, $unset: { lockUntil: '' } }
    );
  }

  if (!user.isEmailVerified) {
    throw new ApiError(
      HttpStatus.UNAUTHORIZED,
      'Please verify your email before logging in',
      [],
      '',
      'EMAIL_NOT_VERIFIED'
    );
  }

  const tokens = await createSession(user, req);
  setAuthCookies(res, tokens);
  const loggedInUser = await User.findById(user._id);

  return res
    .status(HttpStatus.OK)
    .json(
      new ApiResponse(
        HttpStatus.OK,
        { user: loggedInUser },
        'User logged in successfully!'
      )
    );
});

const sessionIdFromCookies = (req) => {
  const attempts = [
    [
      req.cookies?.refreshToken || req.body?.refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    ],
    [req.cookies?.accessToken, process.env.ACCESS_TOKEN_SECRET],
  ];
  for (const [token, secret] of attempts) {
    if (!token) continue;
    try {
      const d = jwt.verify(token, secret, { ignoreExpiration: true });
      if (d?.sid && d?._id) return { sid: d.sid, userId: d._id };
    } catch {
      // next try
    }
  }
  return null;
};

const logoutUser = asyncHandler(async (req, res) => {
  const found = sessionIdFromCookies(req);
  if (found) {
    await RefreshSession.deleteOne({ _id: found.sid, user: found.userId });
  }
  clearAuthCookies(res);
  return res
    .status(HttpStatus.OK)
    .json(new ApiResponse(HttpStatus.OK, {}, 'User logged out!'));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(HttpStatus.OK)
    .json(
      new ApiResponse(
        HttpStatus.OK,
        req.user,
        'Current user fetched successfully!'
      )
    );
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;
  if (!verificationToken) {
    throw new ApiError(
      HttpStatus.BAD_REQUEST,
      'Email verification token is missing'
    );
  }

  const hashedToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
  }).select('+emailVerificationExpiry');

  if (!user || !user.emailVerificationExpiry) {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'Token is invalid or expired');
  }

  const expiryTime = new Date(user.emailVerificationExpiry).getTime();
  if (Number.isNaN(expiryTime) || expiryTime <= Date.now()) {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'Token is invalid or expired');
  }

  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });
  return res
    .status(HttpStatus.OK)
    .json(new ApiResponse(HttpStatus.OK, {}, 'Email verified successfully'));
});

const verifyEmailRedirect = asyncHandler(async (req, res) => {
  res.redirect(verifyEmailUrl(req.params.verificationToken));
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '')
    .trim()
    .toLowerCase();

  if (!email) {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'Email is required');
  }

  const user = await User.findOne({ email });

  if (user && !user.isEmailVerified) {
    const { unHashedToken, hashedToken, tokenExpiry } =
      user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    try {
      await sendEmail({
        email: user?.email,
        subject: 'Verify your email',
        mailgenContent: emailVerificationMailgenContent(
          user.username,
          verifyEmailUrl(unHashedToken)
        ),
      });
    } catch (mailError) {
      console.error('Verification resend email failed:', mailError);
    }
  }

  return res
    .status(HttpStatus.OK)
    .json(
      new ApiResponse(
        HttpStatus.OK,
        {},
        'If an account exists for that email, a verification link has been sent.'
      )
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incoming = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!incoming) {
    throw new ApiError(HttpStatus.UNAUTHORIZED, 'Unauthorized access');
  }

  const reject = (message) => {
    clearAuthCookies(res);
    throw new ApiError(HttpStatus.UNAUTHORIZED, message);
  };

  let decoded;
  try {
    decoded = jwt.verify(incoming, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    return reject('Invalid refresh token');
  }
  if (!decoded.sid) return reject('Invalid refresh token'); // purane tokens

  const session = await RefreshSession.findOne({
    _id: decoded.sid,
    user: decoded._id,
  });
  if (!session) return reject('Invalid refresh token');

  const user = await User.findById(decoded._id);
  if (!user) return reject('Invalid refresh token');

  const incomingHash = hashToken(incoming);
  const now = Date.now();
  const ok = () =>
    res
      .status(HttpStatus.OK)
      .json(new ApiResponse(HttpStatus.OK, {}, 'Access token refreshed'));

  // 1) Normal rotation. Condition atomic hai, to do parallel requests mein sirf ek jeetegi
  if (incomingHash === session.tokenHash) {
    const refreshToken = user.generateRefreshToken(session._id);
    const rotated = await RefreshSession.findOneAndUpdate(
      { _id: session._id, tokenHash: incomingHash },
      {
        $set: {
          prevHash: incomingHash,
          prevValidUntil: new Date(now + ROTATION_GRACE_MS),
          tokenHash: hashToken(refreshToken),
          lastUsedAt: new Date(now),
          expiresAt: new Date(now + CookieOptions.maxAge),
        },
      }
    );
    if (rotated) {
      setAuthCookies(res, {
        accessToken: user.generateAccessToken(session._id),
        refreshToken,
      });
      return ok();
    }
  }

  // 2) Grace: abhi rotate hua purana token. Sirf naya access token, refresh cookie nahi
  const current =
    incomingHash === session.tokenHash
      ? await RefreshSession.findById(session._id) // race haar gaye, fresh state
      : session;
  if (
    current &&
    current.prevHash === incomingHash &&
    current.prevValidUntil?.getTime() > now
  ) {
    setAuthCookies(res, { accessToken: user.generateAccessToken(session._id) });
    return ok();
  }

  // 3) Grace ke baad reuse: sirf ye session revoke
  await RefreshSession.deleteOne({ _id: session._id });
  return reject('Refresh token reuse detected');
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '')
    .trim()
    .toLowerCase();
  const user = await User.findOne({ email });

  if (user) {
    const { unHashedToken, hashedToken, tokenExpiry } =
      user.generateTemporaryToken(30 * 60 * 1000);
    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    try {
      const resetUrlBase =
        process.env.CLIENT_URL || process.env.FORGOT_PASSWORD_REDIRECT_URL;
      const passwordResetUrl = new URL(
        `/reset-password/${encodeURIComponent(unHashedToken)}`,
        resetUrlBase
      ).toString();

      await sendEmail({
        email: user?.email,
        subject: 'Password Reset request',
        mailgenContent: forgotPasswordMailgenContent(
          user.username,
          passwordResetUrl
        ),
      });
    } catch (mailError) {
      console.error('Password reset email failed:', mailError);
    }
  }

  return res
    .status(HttpStatus.OK)
    .json(
      new ApiResponse(
        HttpStatus.OK,
        {},
        'Password reset mail has been sent on your e-mail id'
      )
    );
});

const resetForgotPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
  }).select('+forgotPasswordExpiry');

  if (!user || !user.forgotPasswordExpiry) {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'Token is invalid or expired');
  }

  const expiryTime = new Date(user.forgotPasswordExpiry).getTime();
  if (Number.isNaN(expiryTime) || expiryTime <= Date.now()) {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'Token is invalid or expired');
  }

  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  await RefreshSession.deleteMany({ user: user._id });

  return res
    .status(HttpStatus.OK)
    .json(new ApiResponse(HttpStatus.OK, {}, 'Password reset successfully!'));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(
      HttpStatus.BAD_REQUEST,
      'Old and new passwords are required'
    );
  }

  if (oldPassword === newPassword) {
    throw new ApiError(
      HttpStatus.BAD_REQUEST,
      'New password must be different from the current password'
    );
  }

  const user = await User.findById(req.user?._id).select('+password');
  if (!user) {
    throw new ApiError(HttpStatus.NOT_FOUND, 'User not found');
  }

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid old password');
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });
  await RefreshSession.deleteMany({ user: user._id, _id: { $ne: req.sid } });

  return res
    .status(HttpStatus.OK)
    .json(new ApiResponse(HttpStatus.OK, {}, 'Password changed successfully!'));
});

export {
  oauthCallback,
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  verifyEmail,
  verifyEmailRedirect,
  resendEmailVerification,
  refreshAccessToken,
  forgotPasswordRequest,
  resetForgotPassword,
  changeCurrentPassword,
};
