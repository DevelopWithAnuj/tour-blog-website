import { validationResult } from 'express-validator';
import { ApiError } from '../utils/api-error.js';
import { HttpStatus } from '../utils/constants.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().forEach((err) => {
    extractedErrors.push({ [err.path]: err.msg });
  });

  throw new ApiError(
    HttpStatus.UNPROCESSABLE_ENTITY,
    'Received data is not valid',
    extractedErrors
  );
};
