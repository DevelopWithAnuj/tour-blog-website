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
    chain.isLength({ min: minLength }).withMessage(
      `Password must be at least ${minLength} characters!`
    );
  }

  return chain.isLength({ max: maxLength }).withMessage(
    `Password must be at most ${maxLength} characters!`
  );
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
      .withMessage('Email is Invaild!'),
  ];
};

const userResetForgotPasswordValidator = () => {
  return [
    passwordValidationChain('newPassword', { minLength: 6, maxLength: 72 }),
  ];
};

export {
  userRegisterValidator,
  userLoginValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userResetForgotPasswordValidator,
};
