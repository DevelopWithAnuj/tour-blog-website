import { ApiResponse } from '../utils/api-response.js';
import { HttpStatus } from '../utils/constants.js';

export function ignoreHoneypot(req, res, next) {
  if (!req.body?.website) return next();

  return res
    .status(HttpStatus.CREATED)
    .json(
      new ApiResponse(
        HttpStatus.CREATED,
        {},
        'Thanks, we received your message.'
      )
    );
}
