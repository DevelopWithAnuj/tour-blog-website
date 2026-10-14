import { ApiError } from '../utils/api-error.js';
import { Config, HttpStatus } from '../utils/constants.js';

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

export const allowedOrigins = Config.CORS_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export function verifyRequestOrigin(req, res, next) {
  if (safeMethods.has(req.method)) return next();

  const origin = req.get('origin');
  let trustedOrigin = origin && allowedOrigins.includes(origin);

  if (!origin) {
    const referer = req.get('referer');
    if (referer) {
      try {
        trustedOrigin = allowedOrigins.includes(new URL(referer).origin);
      } catch {
        trustedOrigin = false;
      }
    }
  }

  if (!trustedOrigin) {
    return next(
      new ApiError(HttpStatus.FORBIDDEN, 'Untrusted or missing request origin')
    );
  }

  return next();
}
