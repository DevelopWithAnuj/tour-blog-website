import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { optionalAuth } from '../middleware/auth.Middleware.js';
import { ignoreHoneypot } from '../middleware/contactHoneypot.Middleware.js';
import { validate } from '../middleware/validator.Middleware.js';
import { inquiryValidator } from '../validators/index.js';
import { createInquiry } from '../controllers/contact.Controller.js';

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

export default router;
