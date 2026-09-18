import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from "cookie-parser"

const app = express();

app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: true, limit: '32kb' }));
app.use(cookieParser())

// cors configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// import the routes
import { ApiPath } from './utils/constants.js';
import { adminRoutes } from './routes/adminRoutes.js';
import { authRoutes } from './routes/authRoutes.js';
import { blogRoutes } from './routes/blogRoutes.js';
import { bookingRoutes } from './routes/bookingRoutes.js';
import { tourRoutes } from './routes/tourRoutes.js';
import healthCheckRouter from './routes/healthCheck.route.js';

app.use(`${ApiPath.BASE}${ApiPath.HEALTHCHECK}`, healthCheckRouter);




// frontend build serve
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../dist')));

// React routes fallback
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.get('/', (req, res) => {
  res.send('Welcome to Tour & travel');
});
export default app;

