import { Router } from 'express';
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

router.route('/register').post(userRegisterValidator(), validate, registerUser);
router.route('/login').post(userLoginValidator(), validate, loginUser);
router.route('/verify-email/:verificationToken').get(verifyEmail);
router.route('/refresh-token').post(refreshAccessToken);
router
  .route('/forgot-password')
  .post(userForgotPasswordValidator(), validate, forgotPasswordRequest);
router
  .route('/reset-password/:resetToken')
  .post(userResetForgotPasswordValidator(), validate, resetForgotPassword);

// secure routes
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/current-user').post(verifyJWT, getCurrentUser);
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
