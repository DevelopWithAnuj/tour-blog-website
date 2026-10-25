import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { optionalAuth, verifyJWT } from '../middleware/auth.Middleware.js';
import { ignoreHoneypot } from '../middleware/contactHoneypot.Middleware.js';
import { validate } from '../middleware/validator.Middleware.js';
import { inquiryValidator } from '../validators/index.js';
import {
  createInquiry,
  getInquiryByTrackingToken,
  getMyInquiries,
} from '../controllers/contact.Controller.js';

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many messages sent. Please try again later.',
  },
});

const trackingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

router
  .route('/')
  .post(
    contactLimiter,
    ignoreHoneypot,
    optionalAuth,
    inquiryValidator(),
    validate,
    createInquiry
  );

router.get('/my-inquiries', verifyJWT, getMyInquiries);
router.get('/track/:token', trackingLimiter, getInquiryByTrackingToken);

export default router;
