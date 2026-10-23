import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validator.Middleware.js';
import { newsletterValidator } from '../validators/index.js';
import { subscribe, unsubscribe } from '../controllers/newsletter.Controller.js';

const router = Router();

const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many attempts. Please try again later.',
  },
});

router
  .route('/')
  .post(newsletterLimiter, newsletterValidator(), validate, subscribe);

router.post('/unsubscribe/:token', newsletterLimiter, unsubscribe);
export default router;
