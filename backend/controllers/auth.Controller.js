import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from '../utils/api-error.js';
import { ApiPath, Config, HttpStatus } from '../utils/constants.js';
import { User } from '../models/User.models.js';

import crypto from 'crypto';
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
} from '../utils/mail.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
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
  const { email, username, password, role } = req.body;

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

  const user = await User.create({
    email,
    password,
    username,
    isEmailVerified: false,
  });

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: 'Verify your email',
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get('host')}${ApiPath.BASE}${ApiPath.AUTH}${ApiPath.VERIFY_EMAIL}/${unHashedToken}`
    ),
  });

  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken -emailVerificationToken -emailVerificationExpiry'
  );

  if (!createdUser) {
    throw new ApiError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Something went wrong while registering a user'
    );
  }

  return res.status(HttpStatus.ACCEPTED).json(
    new ApiResponse(
      HttpStatus.ACCEPTED,
      {
        user: createdUser,
      },
      'User registerd successfully and verfication email has been sent on your email'
    )
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'Email is required!');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'User does not exist!');
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'Invalid credentials');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken -emailVerificationToken -emailVerificationExpiry'
  );

  const options = {
    httpOnly: true,
    secure: Config.NODE_ENV,
  };

  return res
    .status(HttpStatus.OK)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(
        HttpStatus.OK,
        { user: loggedInUser, accessToken, refreshToken },
        'User logged in successfully!'
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: '',
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: Config.NODE_ENV,
  };

  return res
    .status(HttpStatus.OK)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
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
  });

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
  await res
    .status(HttpStatus.OK)
    .json(
      new ApiResponse(
        HttpStatus.OK,
        { isEmailVerified: true },
        'Email is verified!'
      )
    );
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(HttpStatus.NOT_FOUND, 'User does not exist');
  }
  if (user.isEmailVerified) {
    throw new ApiError(HttpStatus.CONFLICT, 'Email is already verified!');
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({
    validateBeforeSave: false,
  });

  await sendEmail({
    email: user?.email,
    subject: 'Verify your email',
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get('host')}${ApiPath.BASE}${ApiPath.USERS}${ApiPath.VERIFY_EMAIL}/${unHashedToken}`
    ),
  });

  return res
    .status(HttpStatus.OK)
    .json(
      new ApiResponse(
        HttpStatus.OK,
        {},
        'E-Mail has been sent to your E-mail Id'
      )
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

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

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Refresh token is expired');
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    return res
      .status(HttpStatus.OK)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', newRefreshToken, options)
      .json(
        new ApiResponse(
          HttpStatus.OK,
          { accessToken, refreshToken: newRefreshToken },
          'Access token refreshed'
        )
      );
  } catch (error) {
    throw new ApiError(HttpStatus.UNAUTHORIZED, 'Inavalid refres token');
  }
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({
    email,
  });
  if (!user) {
    throw new ApiError(HttpStatus.NOT_FOUND, 'User does not exists', []);
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();
  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: 'Password Reset request',
    mailgenContent: forgotPasswordMailgenContent(
      user.username,
      `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`
    ),
  });

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

  let hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
  });

  if (!user || !user.forgotPasswordExpiry) {
    throw new ApiError(HttpStatus.UNAUTHORIZED, 'Token is invalid or expired');
  }

  const expiryTime = new Date(user.forgotPasswordExpiry).getTime();
  if (Number.isNaN(expiryTime) || expiryTime <= Date.now()) {
    throw new ApiError(HttpStatus.UNAUTHORIZED, 'Token is invalid or expired');
  }

  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(HttpStatus.OK)
    .json(new ApiResponse(HttpStatus.OK, {}, 'Password reset successfully!'));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id).select('+password');
  const isPasswordVaild = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordVaild) {
    throw new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid Old Password');
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });
  return res
    .status(HttpStatus.OK)
    .json(new ApiResponse(HttpStatus.OK, {}, 'Password changes successfully!'));
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
