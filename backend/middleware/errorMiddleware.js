import { randomUUID } from 'node:crypto';
import { ApiError } from '../utils/api-error.js';
import { HttpStatus } from '../utils/constants.js';
import logger from '../config/logger.js';

export function notFoundHandler(req, res, next) {
  next(
    new ApiError(HttpStatus.NOT_FOUND, 'The requested API route was not found.')
  );
}

export function errorHandler(err, req, res, next) {
  let statusCode =
    err?.statusCode ||
    err?.status ||
    (err?.name === 'CastError' ? HttpStatus.BAD_REQUEST : undefined);
  let message = 'The request could not be processed.';
  let errors = Array.isArray(err?.errors) ? err.errors : [];

  if (err && err.code === 11000) {
    statusCode = HttpStatus.CONFLICT;
    message = 'An account with these details already exists.';
    errors = [];
  } else if (err instanceof ApiError) {
    message = err.message;
  }

  if (err && err.name === 'ValidationError' && err.errors) {
    statusCode = HttpStatus.BAD_REQUEST;
    message = 'Please check the submitted information.';
    errors = Object.entries(err.errors).map(([key, value]) => ({
      [key]: value.message,
    }));
  }

  if (err && err.name === 'CastError') {
    statusCode = HttpStatus.BAD_REQUEST;
    message = 'Invalid resource ID';
    errors = [{ path: err.path, msg: 'Invalid resource ID' }];
  }

  if (!Number.isInteger(statusCode) || statusCode < 400 || statusCode > 599) {
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  }

  if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    message = 'We ran into a problem. Please try again shortly.';
    errors = [];
  } else if (
    !(err instanceof ApiError) &&
    statusCode === HttpStatus.NOT_FOUND
  ) {
    message = 'The requested resource was not found.';
  } else if (
    !(err instanceof ApiError) &&
    statusCode === HttpStatus.TOO_MANY_REQUESTS
  ) {
    message = 'Too many requests. Please try again shortly.';
  }

  const requestId = req.id || randomUUID();
  const error = new ApiError(
    statusCode,
    message,
    errors,
    '',
    err instanceof ApiError ? err.code : undefined
  );
  error.stack = err?.stack || error.stack;

  logger.error('Request failed', {
    requestId,
    method: req.method,
    path: req.path,
    statusCode: error.statusCode,
    errorName: err?.name || 'Error',
    errorMessage: err?.message || 'Unknown error',
    stack: err?.stack,
  });

  const response = {
    statusCode: error.statusCode,
    data: error.data,
    success: error.success,
    message: error.message,
    errors: error.errors,
    ...(error.code ? { code: error.code } : {}),
    requestId,
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(error.statusCode).json(response);
}
