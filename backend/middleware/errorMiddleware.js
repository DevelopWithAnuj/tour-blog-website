import { ApiError } from '../utils/api-error.js';
import { HttpStatus } from '../utils/constants.js';

export function notFoundHandler(req, res, next) {
  next(
    new ApiError(HttpStatus.NOT_FOUND, `Route not found: ${req.originalUrl}`)
  );
}

export function errorHandler(err, req, res, next) {
  if (!(err instanceof ApiError)) {
    console.error('Unhandled error:', err);
  }

  let statusCode = err.statusCode;
  let message = err.message || 'Internal server error';
  let errors = err.errors || [];

  if (err && err.code === 11000) {
    statusCode = HttpStatus.CONFLICT;
    message = 'User with same email or username already exists';
    errors = [];
  }

  if (err && err.name === 'ValidationError' && err.errors) {
    statusCode = HttpStatus.BAD_REQUEST;
    message = 'Validation failed';
    errors = Object.entries(err.errors).map(([key, value]) => ({
      [key]: value.message,
    }));
  }

  const error =
    err instanceof ApiError
      ? err
      : new ApiError(
          statusCode && statusCode >= HttpStatus.BAD_REQUEST
            ? statusCode
            : HttpStatus.INTERNAL_SERVER_ERROR,
          err instanceof ApiError ? message : 'Internal server error',
          errors
        );

  res.status(error.statusCode).json({
    statusCode: error.statusCode,
    data: error.data,
    success: error.success,
    message: error.message,
    errors: error.errors,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });
}
