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

  let statusCode =
    err?.statusCode ||
    err?.status ||
    (err?.name === 'CastError' ? HttpStatus.BAD_REQUEST : undefined);
  let message = err?.message || 'Internal server error';
  let errors = Array.isArray(err?.errors) ? err.errors : [];

  if (err && err.code === 11000) {
    statusCode = HttpStatus.CONFLICT;
    message = err.message || 'User with same email or username already exists';
    errors = [];
  }

  if (err && err.name === 'ValidationError' && err.errors) {
    statusCode = HttpStatus.BAD_REQUEST;
    message = err.message || 'Validation failed';
    errors = Object.entries(err.errors).map(([key, value]) => ({
      [key]: value.message,
    }));
  }

  if (err && err.name === 'CastError') {
    statusCode = HttpStatus.BAD_REQUEST;
    message = 'Invalid resource ID';
    errors = [{ path: err.path, msg: 'Invalid resource ID' }];
  }

  if (statusCode && statusCode < HttpStatus.INTERNAL_SERVER_ERROR) {
    message = err?.message || message;
  } else {
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    message = 'Internal server error';
  }

  const error =
    err instanceof ApiError
      ? err
      : new ApiError(statusCode, message, errors);

  res.status(error.statusCode).json({
    statusCode: error.statusCode,
    data: error.data,
    success: error.success,
    message: error.message,
    errors: error.errors,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });
}
