import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from '../utils/api-error.js';
import {
  ApiPath,
  Config,
  CookieOptions,
  HttpStatus,
} from '../utils/constants.js';
import { User } from '../models/User.models.js';

import crypto from 'crypto';
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
} from '../utils/mail.js';
import jwt from 'jsonwebtoken';

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = hashToken(refreshToken);
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Something went wrong while generating access token'
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const username = String(req.body.username || '').trim().toLowerCase();
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
        `${Config.SERVER_URL}${ApiPath.BASE}${ApiPath.AUTH}${ApiPath.VERIFY_EMAIL}/${unHashedToken}`
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
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!email) {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'Email is required!');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  if (!user.isEmailVerified) {
    throw new ApiError(
      HttpStatus.UNAUTHORIZED,
      'Please verify your email before logging in'
    );
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id);

  const accessTokenOptions = {
    ...CookieOptions,
    maxAge: 15 * 60 * 1000,
  };

  return res
    .status(HttpStatus.OK)
    .cookie('accessToken', accessToken, accessTokenOptions)
    .cookie('refreshToken', refreshToken, CookieOptions)
    .json(
      new ApiResponse(
        HttpStatus.OK,
        { user: loggedInUser },
        'User logged in successfully!'
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (req.user?._id) {
    await User.findByIdAndUpdate(
      req.user._id,
      { $unset: { refreshToken: '' } },
      { new: true }
    );
  }

  if (refreshToken) {
    const hashedRefreshToken = hashToken(refreshToken);
    await User.findOneAndUpdate(
      { refreshToken: hashedRefreshToken },
      { $unset: { refreshToken: '' } },
      { new: true }
    );
  }

  const options = { ...CookieOptions };

  return res
    .status(HttpStatus.OK)
    .clearCookie('accessToken', { ...options, maxAge: 0 })
    .clearCookie('refreshToken', { ...options, maxAge: 0 })
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
    throw new ApiError(HttpStatus.BAD_REQUEST, 'Token is invaild or expired');
  }

  const expiryTime = new Date(user.emailVerificationExpiry).getTime();
  if (Number.isNaN(expiryTime) || expiryTime <= Date.now()) {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'Token is invaild or expired');
  }

  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });
  const redirectTarget =
    process.env.CLIENT_URL ||
    process.env.CORS_ORIGIN?.split(',')[0] ||
    'http://localhost:5173';

  return res.redirect(`${redirectTarget}/login?verified=1`);
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();

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
          `${Config.SERVER_URL}${ApiPath.BASE}${ApiPath.AUTH}${ApiPath.VERIFY_EMAIL}/${unHashedToken}`
        ),
      });
    } catch (mailError) {
      console.error('Verification resend email failed:', mailError);
    }
  }

  return res.status(HttpStatus.OK).json(
    new ApiResponse(
      HttpStatus.OK,
      {},
      'If an account exists for that email, a verification link has been sent.'
    )
  );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(HttpStatus.UNAUTHORIZED, 'Unauthorized access');
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id).select('+refreshToken');
    if (!user) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid refresh token');
    }

    if (hashToken(incomingRefreshToken) !== user.refreshToken) {
      user.refreshToken = undefined;
      await user.save({ validateBeforeSave: false });
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Refresh token is expired');
    }

    const accessTokenOptions = {
      ...CookieOptions,
      maxAge: 15 * 60 * 1000,
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(HttpStatus.OK)
      .cookie('accessToken', accessToken, accessTokenOptions)
      .cookie('refreshToken', newRefreshToken, CookieOptions)
      .json(new ApiResponse(HttpStatus.OK, {}, 'Access token refreshed'));
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Refresh token expired');
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid refresh token');
    }

    throw error;
  }
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const user = await User.findOne({ email });

  if (user) {
    const { unHashedToken, hashedToken, tokenExpiry } =
      user.generateTemporaryToken();
    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    try {
      await sendEmail({
        email: user?.email,
        subject: 'Password Reset request',
        mailgenContent: forgotPasswordMailgenContent(
          user.username,
          `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`
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
  user.refreshToken = undefined;

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(HttpStatus.OK)
    .json(new ApiResponse(HttpStatus.OK, {}, 'Password reset successfully!'));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'Old and new passwords are required');
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
  user.refreshToken = undefined;

  await user.save({ validateBeforeSave: false });
  return res
    .status(HttpStatus.OK)
    .json(new ApiResponse(HttpStatus.OK, {}, 'Password changed successfully!'));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  verifyEmail,
  resendEmailVerification,
  refreshAccessToken,
  forgotPasswordRequest,
  resetForgotPassword,
  changeCurrentPassword,
};
