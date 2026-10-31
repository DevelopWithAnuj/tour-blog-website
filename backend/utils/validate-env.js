import './constants.js'; // loads dotenv

const required = [
  'MONGO_URI',
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET',
  'FORGOT_PASSWORD_REDIRECT_URL',
  'MAILTRAP_SMTP_HOST',
  'MAILTRAP_SMTP_PORT',
  'MAILTRAP_SMTP_USER',
  'MAILTRAP_SMTP_PASS',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
];

const isProduction = process.env.NODE_ENV === 'production';

// In production the defaults (localhost) are wrong, so they must be explicit.
const requiredInProduction = ['CLIENT_URL', 'CORS_ORIGIN'];

const missing = [
  ...required,
  ...(isProduction ? requiredInProduction : []),
].filter((k) => !process.env[k]);

if (missing.length) {
  console.error(
    `Missing required environment variables: ${missing.join(', ')}`
  );
  process.exit(1);
}

if (process.env.ACCESS_TOKEN_SECRET === process.env.REFRESH_TOKEN_SECRET) {
  console.error(
    'ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be different.'
  );
  process.exit(1);
}

if (
  isProduction &&
  (process.env.ACCESS_TOKEN_SECRET.length < 32 ||
    process.env.REFRESH_TOKEN_SECRET.length < 32)
) {
  console.error('Token secrets must be at least 32 characters in production.');
  process.exit(1);
}

if (!process.env.NODE_ENV) {
  console.warn(
    'NODE_ENV is not set. Auth cookies will not be marked Secure. ' +
      'Set NODE_ENV=production when you deploy.'
  );
}
