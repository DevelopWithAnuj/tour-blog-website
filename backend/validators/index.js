import { body } from 'express-validator';
import { TOUR_CATEGORIES } from '../models/Tour.models.js';
import { BLOG_CATEGORIES, BLOG_STATUS } from '../models/Blog.models.js';
import { UserRolesEnum } from '../utils/constants.js';
import { INQUIRY_TYPES } from '../models/Inquiry.models.js';

const passwordValidationChain = (
  fieldName,
  { minLength = null, maxLength = 72, required = true } = {}
) => {
  const chain = body(fieldName);

  if (required) {
    chain.notEmpty().withMessage('Password is required!');
  }

  if (minLength !== null) {
    chain
      .isLength({ min: minLength })
      .withMessage(`Password must be at least ${minLength} characters!`);
  }

  return chain
    .isLength({ max: maxLength })
    .withMessage(`Password must be at most ${maxLength} characters!`);
};

const userRegisterValidator = () => {
  return [
    body('email')
      .trim()
      .normalizeEmail({ gmail_remove_dots: false })
      .notEmpty()
      .withMessage('Email is required!')
      .isEmail()
      .withMessage('Email is invalid!'),
    body('username')
      .trim()
      .toLowerCase()
      .notEmpty()
      .withMessage('Username is required!')
      .matches(/^[a-z0-9_]{4,20}$/)
      .withMessage(
        'Username must be 4-20 characters and contain only lowercase letters, numbers, or underscores!'
      ),
    passwordValidationChain('password', { minLength: 8, maxLength: 72 }),
    body('fullName').optional().trim().isLength({ max: 100 }),
    body('fullname').optional().trim().isLength({ max: 100 }),
  ];
};

const userLoginValidator = () => {
  return [
    body('email')
      .trim()
      .normalizeEmail({ gmail_remove_dots: false })
      .notEmpty()
      .withMessage('Email is required!')
      .isEmail()
      .withMessage('Email is invalid!'),
    passwordValidationChain('password', { maxLength: 72 }),
  ];
};

const userChangeCurrentPasswordValidator = () => {
  return [
    body('oldPassword').notEmpty().withMessage('Old password is required!'),
    passwordValidationChain('newPassword', { minLength: 8, maxLength: 72 }),
  ];
};

const userForgotPasswordValidator = () => {
  return [
    body('email')
      .trim()
      .normalizeEmail({ gmail_remove_dots: false })
      .notEmpty()
      .withMessage('Email is required!')
      .isEmail()
      .withMessage('Email is invalid!'),
  ];
};

const userResetForgotPasswordValidator = () => {
  return [
    passwordValidationChain('newPassword', { minLength: 8, maxLength: 72 }),
  ];
};

const bookingCreateValidator = () => [
  body('tourId').isMongoId().withMessage('Valid tour is required'),
  body('date')
    .isISO8601()
    .withMessage('Valid travel date is required')
    .custom((v) => new Date(v) > new Date())
    .withMessage('Travel date must be in the future'),
  body('guestCount')
    .isInt({ min: 1, max: 20 })
    .withMessage('Guests must be between 1 and 20'),
  body('travelerName').trim().notEmpty().withMessage('Name is required'),
  body('travelerEmail').trim().isEmail().withMessage('Valid email is required'),
  body('travelerPhone')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 20 }),
  body('specialRequests').optional().trim().isLength({ max: 500 }),
];

const bookingPaymentValidator = () => [
  body('method')
    .isIn(['card', 'upi', 'netbanking'])
    .withMessage('Invalid payment method'),
  body('cardNumber')
    .if(body('method').equals('card'))
    .customSanitizer((v) => String(v || '').replace(/\s/g, ''))
    .matches(/^\d{16}$/)
    .withMessage('Card number must be 16 digits'),
];

const text = (field, max, { required = true } = {}) => {
  const chain = body(field);
  if (!required) chain.optional({ values: 'falsy' });
  chain.isString().withMessage(`${field} must be text`).trim();
  if (required) chain.notEmpty().withMessage(`${field} is required`);
  return chain
    .isLength({ max })
    .withMessage(`${field} must be at most ${max} characters.`);
};

const stringList = (field, maxItems, maxLen) => [
  body(field)
    .optional()
    .isArray({ max: maxItems })
    .withMessage(`${field} has too many items`),
  body(`${field}.*`)
    .isString()
    .trim()
    .notEmpty()
    .isLength({ max: maxLen })
    .withMessage(`Each ${field} entry must be 1-${maxLen} characters.`),
];

const adminTourValidator = () => [
  text('title', 120),
  text('destination', 80),
  text('location', 120),
  text('description', 2000),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be 0 or more')
    .toFloat(),
  text('duration', 60),
  body('category').isIn(TOUR_CATEGORIES).withMessage('Invalid category'),
  text('image', 500, { required: false }),
  ...stringList('images', 12, 500),
  ...stringList('inclusions', 30, 200),
  ...stringList('exclusions', 30, 200),
  body('itinerary')
    .optional()
    .isArray({ max: 30 })
    .withMessage('Itinerary has too many days'),
  body('itinerary.*.day')
    .isInt({ min: 1 })
    .withMessage('Itinerary day must be 1 or more')
    .toInt(),
  body('itinerary.*.title')
    .isString()
    .trim()
    .notEmpty()
    .isLength({ max: 120 })
    .withMessage('Each itinerary day needs a title'),
  body('itinerary.*.description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 }),
  body('faq')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Too many FAQ entries'),
  body('faq.*.question')
    .isString()
    .trim()
    .notEmpty()
    .isLength({ max: 200 })
    .withMessage('Each FAQ needs a question'),
  body('faq.*.answer')
    .isString()
    .trim()
    .notEmpty()
    .isLength({ max: 1000 })
    .withMessage('Each FAQ needs an answer'),
  body('availableDates')
    .optional()
    .isArray({ max: 100 })
    .withMessage('A tour can have at most 100 available dates'),
  body('availableDates.*')
    .isString()
    .withMessage('Each available date must be text')
    .bail()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Each available date must use YYYY-MM-DD')
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('Each available date must be a valid calendar date')
    .toDate(),
];

const adminToggleActiveValidator = () => [
  body('isActive')
    .isBoolean({ strict: true })
    .withMessage('isActive must be true or false'),
];

const adminBlogValidator = () => [
  text('title', 150),
  body('category').isIn(BLOG_CATEGORIES).withMessage('Invalid category'),
  text('destination', 80, { required: false }),
  text('excerpt', 400),
  text('content', 30000),
  body('coverImage')
    .optional({ values: 'falsy' })
    .isString()
    .trim()
    .matches(/^(\/|https?:\/\/)/)
    .withMessage('Cover image must be a /path or an http(s) URL')
    .isLength({ max: 500 }),
  body('images')
    .optional()
    .isArray({ max: 12 })
    .withMessage('Gallery can have at most 12 images'),
  body('images.*')
    .isString()
    .trim()
    .notEmpty()
    .matches(/^(\/|https?:\/\/)/)
    .withMessage('Each gallery image must be a /path or an http(s) URL')
    .isLength({ max: 500 })
    .withMessage('Gallery image URLs must be at most 500 characters'),
  body('status').optional().isIn(BLOG_STATUS).withMessage('Invalid status'),
];

const adminBlogStatusValidator = () => [
  body('status').isIn(BLOG_STATUS).withMessage('Invalid status'),
  body('reviewNote')
    .optional({ values: 'falsy' })
    .isString()
    .trim()
    .isLength({ max: 500 }),
];

const adminUserRoleValidator = () => [
  body('role').isIn(Object.values(UserRolesEnum)).withMessage('Invalid role'),
];

const inquiryValidator = () => [
  body('name')
    .isString()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid email is required')
    .normalizeEmail({ gmail_remove_dots: false }),
  body('subject')
    .isString()
    .withMessage('Subject is required')
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('Subject must be 3-150 characters'),
  body('message')
    .isString()
    .withMessage('Message is required')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be 10-2000 characters'),
  body('type')
    .optional()
    .isIn(INQUIRY_TYPES)
    .withMessage('Invalid inquiry type'),
  body('bookingId')
    .optional({ values: 'falsy' })
    .isMongoId()
    .withMessage('Invalid booking'),
  body('website').optional().isString().isLength({ max: 200 }), // honeypot
];

const newsletterValidator = () => [
  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid email is required')
    .isLength({ max: 254 })
    .normalizeEmail({ gmail_remove_dots: false }),
];

const adminNewsletterValidator = () => [
  text('subject', 150),
  text('message', 10000),
  body('message')
    .isLength({ min: 20 })
    .withMessage('Write at least 20 characters'),
];

const savedDestinationValidator = () => [
  body('destination')
    .isString()
    .withMessage('Destination is required')
    .trim()
    .isLength({ min: 1, max: 80 })
    .withMessage('Destination must be 1-80 characters'),
];

const httpsUrl = /^https:\/\//;

const userBlogValidator = () => [
  text('title', 150),
  body('category').isIn(BLOG_CATEGORIES).withMessage('Invalid category'),
  text('destination', 80, { required: false }),
  text('excerpt', 400),
  text('content', 30000),
  body('content')
    .if(body('status').not().equals('draft'))
    .isLength({ min: 100 })
    .withMessage('Write at least 100 characters before submitting for review'),
  body('coverImage')
    .optional({ values: 'falsy' })
    .isString()
    .trim()
    .matches(httpsUrl)
    .withMessage('Cover image must be an https:// URL')
    .isLength({ max: 500 }),
  body('images')
    .optional()
    .isArray({ max: 6 })
    .withMessage('You can add at most 6 gallery images'),
  body('images.*')
    .isString()
    .trim()
    .matches(httpsUrl)
    .withMessage('Each gallery image must be an https:// URL')
    .isLength({ max: 500 }),
  body('status')
    .optional()
    .isIn(['draft', 'pending'])
    .withMessage('Status must be draft or pending'),
];

export {
  userRegisterValidator,
  userLoginValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userResetForgotPasswordValidator,
  bookingCreateValidator,
  bookingPaymentValidator,
  adminTourValidator,
  adminToggleActiveValidator,
  adminBlogValidator,
  adminBlogStatusValidator,
  adminUserRoleValidator,
  inquiryValidator,
  newsletterValidator,
  adminNewsletterValidator,
  savedDestinationValidator,
  userBlogValidator,
};
