import assert from 'node:assert/strict';
import test from 'node:test';
import logger from '../config/logger.js';
import { errorHandler } from '../middleware/errorMiddleware.js';
import { ApiError } from '../utils/api-error.js';

const runHandler = (error) => {
  const originalLogger = logger.error;
  let statusCode;
  let body;
  const res = {
    status(status) {
      statusCode = status;
      return this;
    },
    json(response) {
      body = response;
      return this;
    },
  };

  logger.error = () => {};
  try {
    errorHandler(
      error,
      { method: 'GET', path: '/api/v1/example' },
      res,
      () => {}
    );
  } finally {
    logger.error = originalLogger;
  }

  return { statusCode, body };
};

test('hides internal 500 messages from API clients', () => {
  const previousEnvironment = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  try {
    const { statusCode, body } = runHandler(
      new ApiError(500, 'Database credentials were rejected.')
    );

    assert.equal(statusCode, 500);
    assert.equal(
      body.message,
      'We ran into a problem. Please try again shortly.'
    );
    assert.equal('stack' in body, false);
    assert.match(body.requestId, /^[0-9a-f-]{36}$/i);
  } finally {
    if (previousEnvironment === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previousEnvironment;
    }
  }
});

test('uses a safe 500 response for errors without a status code', () => {
  const { statusCode, body } = runHandler(
    new Error('Internal implementation detail')
  );

  assert.equal(statusCode, 500);
  assert.equal(
    body.message,
    'We ran into a problem. Please try again shortly.'
  );
});

test('preserves intended client messages for known API errors', () => {
  const { statusCode, body } = runHandler(
    new ApiError(404, 'The requested API route was not found.')
  );

  assert.equal(statusCode, 404);
  assert.equal(body.message, 'The requested API route was not found.');
});

test('includes the original stack in development responses', () => {
  const previousEnvironment = process.env.NODE_ENV;
  process.env.NODE_ENV = 'development';

  try {
    const error = new Error('Development diagnostic');
    const { body } = runHandler(error);

    assert.match(body.stack, /Development diagnostic/);
  } finally {
    if (previousEnvironment === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previousEnvironment;
    }
  }
});
