import { body } from 'express-validator';

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
    passwordValidationChain('password', { minLength: 6, maxLength: 72 }),
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
    passwordValidationChain('password', { minLength: 6, maxLength: 72 }),
  ];
};

const userChangeCurrentPasswordValidator = () => {
  return [
    body('oldPassword').notEmpty().withMessage('Old password is required!'),
    passwordValidationChain('newPassword', { minLength: 6, maxLength: 72 }),
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
    passwordValidationChain('newPassword', { minLength: 6, maxLength: 72 }),
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
  body('method').isIn(['card', 'upi', 'netbanking']).withMessage('Invalid payment method'),
  body('cardNumber')
    .if(body('method').equals('card'))
    .customSanitizer((v) => String(v || '').replace(/\s/g, ''))
    .matches(/^\d{16}$/)
    .withMessage('Card number must be 16 digits'),
];

export {
  userRegisterValidator,
  userLoginValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userResetForgotPasswordValidator,
  bookingCreateValidator,
  bookingPaymentValidator
};
