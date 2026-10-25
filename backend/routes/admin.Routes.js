import { Router } from 'express';
import {
  getBookings,
  getInquiries,
  getDashboard,
  getUsers,
  updateBookingStatus,
  updateInquiryStatus,
  updateUserRole,
  getAdminTours,
  getAdminTourById,
  createTour,
  updateTour,
  setTourActive,
  getAdminBlogPosts,
  getAdminBlogPostById,
  createBlogPost,
  updateBlogPost,
  setBlogPostStatus,
  deleteBlogPost,
} from '../controllers/admin.Controller.js';
import { getNewsletterStats, sendNewsletter } from '../controllers/newsletter.Controller.js'
import { requireRole, verifyJWT } from '../middleware/auth.Middleware.js';
import { validate } from '../middleware/validator.Middleware.js';
import { UserRolesEnum } from '../utils/constants.js';
import {
  adminTourValidator,
  adminToggleActiveValidator,
  adminBlogValidator,
  adminBlogStatusValidator,
  adminUserRoleValidator,
  adminNewsletterValidator,
} from '../validators/index.js';

const router = Router();

router.use(verifyJWT, requireRole(UserRolesEnum.ADMIN));

router.get('/dashboard', getDashboard);

router.get('/bookings', getBookings);
router.patch('/bookings/:id/status', updateBookingStatus);

router.get('/inquiries', getInquiries);
router.patch('/inquiries/:id/status', updateInquiryStatus);

router.get('/users', getUsers);
router.patch(
  '/users/:id/role',
  adminUserRoleValidator(),
  validate,
  updateUserRole
);

router
  .route('/tours')
  .get(getAdminTours)
  .post(adminTourValidator(), validate, createTour);
router
  .route('/tours/:id')
  .get(getAdminTourById)
  .put(adminTourValidator(), validate, updateTour);
router.patch(
  '/tours/:id/active',
  adminToggleActiveValidator(),
  validate,
  setTourActive
);

router
  .route('/blogs')
  .get(getAdminBlogPosts)
  .post(adminBlogValidator(), validate, createBlogPost);
router
  .route('/blogs/:id')
  .get(getAdminBlogPostById)
  .put(adminBlogValidator(), validate, updateBlogPost)
  .delete(deleteBlogPost);
router.patch(
  '/blogs/:id/status',
  adminBlogStatusValidator(),
  validate,
  setBlogPostStatus
);

router.get('/newsletter', getNewsletterStats)
router.post('/newsletter/send', adminNewsletterValidator(), validate, sendNewsletter)

export default router;
