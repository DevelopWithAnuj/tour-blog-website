import app from './app.js';
import connectDB from './db/db-connection.js';
import { Config } from './utils/constants.js';

const requiredEnv = [
  'MONGO_URI',
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET',
  'FORGOT_PASSWORD_REDIRECT_URL',
  'MAILTRAP_SMTP_HOST',
  'MAILTRAP_SMTP_PORT',
  'MAILTRAP_SMTP_USER',
  'MAILTRAP_SMTP_PASS',
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length) {
  console.error(
    `Missing required environment variables: ${missingEnv.join(', ')}`
  );
  process.exit(1);
}

connectDB()
  .then(() => {
    app.listen(Config.PORT, Config.HOST, () => {
      console.log(
        `Backend app listening on port http://${Config.HOST}:${Config.PORT}`
      );
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error', err);
    process.exit(1);
  });
