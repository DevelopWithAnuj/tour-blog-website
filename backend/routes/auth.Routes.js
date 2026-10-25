import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
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
} from '../controllers/auth.Controller.js';
import {
  userRegisterValidator,
  userLoginValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userResetForgotPasswordValidator,
  savedDestinationValidator,
} from '../validators/index.js';
import { validate } from '../middleware/validator.Middleware.js';
import { verifyJWT } from '../middleware/auth.Middleware.js';

import passport from '../config/passport.js';
import { oauthCallback } from '../controllers/auth.Controller.js';
import {
  getSavedDestinations,
  removeSavedDestination,
  saveDestination,
} from '../controllers/savedDestination.Controller.js';

const router = Router();

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests, please slow down.',
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests, please slow down.',
  },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests, please slow down.',
  },
});

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests, please slow down.',
  },
});

router
  .route('/register')
  .post(registerLimiter, userRegisterValidator(), validate, registerUser);
router
  .route('/login')
  .post(loginLimiter, userLoginValidator(), validate, loginUser);
router.route('/verify-email/:verificationToken').get(verifyEmail);
router.route('/refresh-token').post(refreshAccessToken);
router
  .route('/forgot-password')
  .post(
    forgotPasswordLimiter,
    userForgotPasswordValidator(),
    validate,
    forgotPasswordRequest
  );
router
  .route('/reset-password/:resetToken')
  .post(
    resetPasswordLimiter,
    userResetForgotPasswordValidator(),
    validate,
    resetForgotPassword
  );
router.route('/logout').post(logoutUser);

// secure routes
router.route('/current-user').get(verifyJWT, getCurrentUser);
router
  .route('/saved-destinations')
  .get(verifyJWT, getSavedDestinations)
  .post(verifyJWT, savedDestinationValidator(), validate, saveDestination)
  .delete(
    verifyJWT,
    savedDestinationValidator(),
    validate,
    removeSavedDestination
  );
router
  .route('/change-password')
  .post(
    verifyJWT,
    userChangeCurrentPasswordValidator(),
    validate,
    changeCurrentPassword
  );
router
  .route('/resend-email-verification')
  .post(
    forgotPasswordLimiter,
    userForgotPasswordValidator(),
    validate,
    resendEmailVerification
  );

// Google
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login',
  }),
  oauthCallback
);

// GitHub
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'], session: false })
);
router.get('/github/callback', (req, res, next) => {
  passport.authenticate('github', { session: false }, (err, user, info) => {
    if (err) return next(err);
    const clientUrl =
      process.env.CLIENT_URL ||
      process.env.CORS_ORIGIN?.split(',')[0] ||
      'http://localhost:5173';
    if (!user) {
      const error =
        info?.code === 'GITHUB_EMAIL_NOT_VERIFIED'
          ? 'github_email_not_verified'
          : 'github_failed';
      return res.redirect(clientUrl + '/login?authError=' + error);
    }
    req.user = user;
    return oauthCallback(req, res, next);
  })(req, res, next);
});

export default router;
