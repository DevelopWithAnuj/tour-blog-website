import './constants.js'; // loads dotenv
const required = [
  'MONGO_URI',
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET',
  'SESSION_SECRET',
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
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(
    `Missing required environment variables: ${missing.join(', ')}`
  );
  process.exit(1);
}
