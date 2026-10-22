import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { verifyJWT } from '../middleware/auth.Middleware.js';
import { validate } from '../middleware/validator.Middleware.js';
import { userBlogValidator } from '../validators/index.js';
import {
  createMyPost,
  deleteMyPost,
  getMyPost,
  getMyPosts,
  submitMyPost,
  updateMyPost,
} from '../controllers/myPost.Controller.js';

const router = Router();

const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many changes. Try again later.',
  },
});

router.use(verifyJWT);

router
  .route('/')
  .get(getMyPosts)
  .post(writeLimiter, userBlogValidator(), validate, createMyPost);
router
  .route('/:id')
  .get(getMyPost)
  .put(writeLimiter, userBlogValidator(), validate, updateMyPost)
  .delete(deleteMyPost);
router.patch('/:id/submit', writeLimiter, submitMyPost);

export default router;
