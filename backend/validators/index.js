import { body } from 'express-validator';

const userRegisterValidator = () => {
  return [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required!')
      .isEmail()
      .withMessage('Email is invalid!'),
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required!')
      .isLowercase()
      .withMessage('Username ,ust be in lowercase!')
      .isLength({ min: 4 })
      .withMessage('Username must be at least 4 characters long!'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required!')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters!'),
    body('fullname').trim().optional(),
  ];
};

const userLoginValidator = () => {
  return [
    body('email').trim().optional().isEmail().withMessage('Email is invalid!'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required!')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters!'),
  ];
};

const userChangeCurrentPasswordValidator = () => {
  return [
    body('oldPassword').notEmpty().withMessage('Old password is required!'),
    body('newPassword').notEmpty().withMessage('New password is required!'),
  ];
};

const userForgotPasswordValidator = () => {
  return [
    body('email')
      .notEmpty()
      .withMessage('Email is required!')
      .isEmail()
      .withMessage('Email is Invaild!'),
  ];
};

const userResetForgotPasswordValidator = () => {
  return [body('newPassword').notEmpty().withMessage('Password is required')];
};

export {
    userRegisterValidator,
    userLoginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator,
}
