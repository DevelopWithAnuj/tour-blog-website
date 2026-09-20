import { ApiError } from '../utils/api-error.js';
import { HttpStatus } from '../utils/constants.js';

export function notFoundHandler(req, res, next) {
  next(
    new ApiError(HttpStatus.NOT_FOUND, `Route not found: ${req.originalUrl}`)
  );
}

export function errorHandler(err, req, res, next) {
  const error =
    err instanceof ApiError
      ? err
      : new ApiError(
          err.statusCode && err.statusCode >= HttpStatus.BAD_REQUEST
            ? err.statusCode
            : HttpStatus.INTERNAL_SERVER_ERROR,
          err.message || 'Server error',
          err.errors || []
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
