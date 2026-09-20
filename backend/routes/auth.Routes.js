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
} from '../validators/index.js';
import { validate } from '../middleware/validator.Middleware.js';
import { verifyJWT } from '../middleware/auth.Middleware.js';

const router = Router();

const strictAuthLimiter = rateLimit({
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
  .post(strictAuthLimiter, userRegisterValidator(), validate, registerUser);
router
  .route('/login')
  .post(strictAuthLimiter, userLoginValidator(), validate, loginUser);
router.route('/verify-email/:verificationToken').get(verifyEmail);
router.route('/refresh-token').post(refreshAccessToken);
router
  .route('/forgot-password')
  .post(
    strictAuthLimiter,
    userForgotPasswordValidator(),
    validate,
    forgotPasswordRequest
  );
router
  .route('/reset-password/:resetToken')
  .post(
    strictAuthLimiter,
    userResetForgotPasswordValidator(),
    validate,
    resetForgotPassword
  );

// secure routes
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/current-user').get(verifyJWT, getCurrentUser);
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
  .post(verifyJWT, resendEmailVerification);

export default router;
