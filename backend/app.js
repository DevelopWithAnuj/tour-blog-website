import express from 'express';
import { existsSync } from 'node:fs';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import logger from './config/logger.js';
import { Config } from './utils/constants.js';
import passport from './config/passport.js';
import session from 'express-session';
import MongoStore from 'connect-mongo';

const app = express();
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : false);
app.use(helmet());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests, please try again later.',
  },
});

const sessionCheckLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: true, limit: '32kb' }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60,
      autoRemove: 'native',
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 5 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());

// winston & morgan logger format
const morganFormat = ':method :url :status :response-time ms';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        logger.info(message.trim());
      },
    },
  })
);

// cors configuration
app.use(
  cors({
    origin: Config.CORS_ORIGIN?.split(',') || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// import the routes
import healthCheckRouter from './routes/healthCheck.route.js';
import { ApiPath } from './utils/constants.js';
import authRouter from './routes/auth.Routes.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import tourRouter from './routes/tour.Routes.js'
// import bookingRouter from './routes/booking.Routes.js'

app.use(`${ApiPath.BASE}${ApiPath.HEALTHCHECK}`, healthCheckRouter);
app.use(`${ApiPath.BASE}${ApiPath.AUTH}/current-user`, sessionCheckLimiter);
app.use(`${ApiPath.BASE}${ApiPath.AUTH}/refresh-token`, sessionCheckLimiter);
app.use(`${ApiPath.BASE}${ApiPath.AUTH}`, authLimiter, authRouter);

app.use(`${ApiPath.BASE}${ApiPath.TOURS}`, tourRouter)
// app.use(`${ApiPath.BASE}${ApiPath.BOOKINGS}`, bookingRouter)

app.use(`${ApiPath.BASE}`, notFoundHandler);


// frontend build serve
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendBuildPath = path.join(__dirname, '../dist');
const frontendIndexPath = path.join(frontendBuildPath, 'index.html');

app.use(express.static(frontendBuildPath));

// React routes fallback
app.get('/{*splat}', (req, res, next) => {
  if (!existsSync(frontendIndexPath)) return next();
  res.sendFile(frontendIndexPath);
});

app.use(errorHandler);

export default app;
