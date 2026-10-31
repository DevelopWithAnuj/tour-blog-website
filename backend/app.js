import express from 'express';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import mongoose from 'mongoose';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { redactUrl } from './utils/redact-url.js';
import rateLimit from 'express-rate-limit';
import logger from './config/logger.js';
import passport from './config/passport.js';
import {
  allowedOrigins,
  verifyRequestOrigin,
} from './middleware/csrf.Middleware.js';

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

app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true, limit: '32kb' }));
app.use(cookieParser());
app.use(passport.initialize());

// winston & morgan logger format
morgan.token('safe-url', (req) => {
  const url = req.originalUrl || req.url;
  return redactUrl(url); 
});

const morganFormat = ':method :safe-url :status :response-time ms';

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
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(verifyRequestOrigin);

// import the routes
import healthCheckRouter from './routes/healthCheck.route.js';
import { ApiPath } from './utils/constants.js';
import authRouter from './routes/auth.Routes.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import tourRouter from './routes/tour.Routes.js';
import bookingRouter from './routes/booking.Routes.js';
import blogRouter from './routes/blog.Routes.js';
import adminRouter from './routes/admin.Routes.js';
import contactRouter from './routes/contact.Routes.js';
import newsletterRouter from './routes/newsletter.Routes.js';
import myPostRouter from './routes/myPost.Routes.js';
import { BlogPost } from './models/Blog.models.js';
import { Tour } from './models/Tour.models.js';
import {
  buildRobots,
  buildSitemap,
  getSiteUrl,
  getRouteSeoMetadata,
  renderSeoHead,
} from './utils/seo.js';

app.use(`${ApiPath.BASE}${ApiPath.HEALTHCHECK}`, healthCheckRouter);
app.use(`${ApiPath.BASE}${ApiPath.AUTH}/current-user`, sessionCheckLimiter);
app.use(`${ApiPath.BASE}${ApiPath.AUTH}/refresh-token`, sessionCheckLimiter);
app.use(`${ApiPath.BASE}${ApiPath.AUTH}`, authLimiter, authRouter);

app.use(`${ApiPath.BASE}${ApiPath.TOURS}`, tourRouter);
app.use(`${ApiPath.BASE}${ApiPath.BOOKINGS}`, bookingRouter);
app.use(`${ApiPath.BASE}${ApiPath.MY_POSTS}`, myPostRouter);
app.use(`${ApiPath.BASE}${ApiPath.BLOGS}`, blogRouter);
app.use(`${ApiPath.BASE}${ApiPath.ADMIN}`, adminRouter);
app.use(`${ApiPath.BASE}${ApiPath.CONTACT}`, contactRouter);
app.use(`${ApiPath.BASE}${ApiPath.NEWSLETTER}`, newsletterRouter);

app.use(`${ApiPath.BASE}`, notFoundHandler);

app.use((req, res, next) => {
  if (
    /^\/(?:admin(?:-|\/|$)|dashboard(?:\/|$)|my-posts(?:\/|$)|booking(?:\/|$)|login(?:\/|$)|register(?:\/|$)|forgot-password(?:\/|$)|reset-password(?:\/|$)|unsubscribe(?:\/|$)|inquiry-tracker(?:\/|$))/.test(
      req.path
    )
  ) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  }
  next();
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(buildRobots(getSiteUrl(req)));
});

app.get('/sitemap.xml', async (req, res, next) => {
  try {
    const [tours, posts] = await Promise.all([
      Tour.find({ isActive: true }).select('_id updatedAt').lean(),
      BlogPost.find({ status: 'published' })
        .select('slug updatedAt publishedAt')
        .lean(),
    ]);
    res
      .type('application/xml')
      .send(buildSitemap({ siteUrl: getSiteUrl(req), tours, posts }));
  } catch (error) {
    next(error);
  }
});

app.get('/', async (req, res, next) => {
  try {
    if (!existsSync(frontendIndexPath)) return next();
    const siteUrl = getSiteUrl(req);
    const html = await readFile(frontendIndexPath, 'utf8');
    const url = new URL('/', siteUrl).href;
    res.type('html').send(
      renderSeoHead(html, {
        title: 'Hand-built tours and travel stories',
        description:
          'Discover hand-built tours, practical destination guides, and travel stories for your next journey.',
        image: new URL('/img/login-hero.webp', siteUrl).href,
        type: 'website',
        url,
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Drimora',
          url,
          description:
            'Discover hand-built tours, practical destination guides, and travel stories for your next journey.',
        },
      })
    );
  } catch (error) {
    next(error);
  }
});

app.get(['/tours/:id', '/blog/:slug'], async (req, res, next) => {
  try {
    const postPath = req.path.startsWith('/blog/');
    if (!postPath && !mongoose.isValidObjectId(req.params.id)) return next();

    const document = postPath
      ? await BlogPost.findOne({
          slug: req.params.slug,
          status: 'published',
        }).lean()
      : await Tour.findOne({ _id: req.params.id, isActive: true }).lean();
    if (!document || !existsSync(frontendIndexPath)) return next();

    const html = await readFile(frontendIndexPath, 'utf8');
    const siteUrl = getSiteUrl(req);
    const url = new URL(req.originalUrl.split('?')[0], siteUrl).href;
    const image = postPath
      ? document.coverImage || document.images?.[0] || '/img/login-hero.webp'
      : document.image || document.images?.[0] || '/img/login-hero.webp';
    const imageUrl = new URL(image, siteUrl).href;
    const description = postPath
      ? document.excerpt || document.title
      : document.description || document.title;
    const structuredData = postPath
      ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: document.title,
          description,
          image: imageUrl,
          datePublished: document.publishedAt,
          dateModified: document.updatedAt || document.publishedAt,
          author: { '@type': 'Person', name: 'Drimora' },
          publisher: { '@type': 'Organization', name: 'Drimora' },
          mainEntityOfPage: url,
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: document.title,
          description,
          image: imageUrl,
          category: document.category,
          offers: {
            '@type': 'Offer',
            price: document.price,
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
            url,
          },
        };

    res.type('html').send(
      renderSeoHead(html, {
        title: postPath
          ? document.title
          : `${document.title} in ${document.destination || document.location}`,
        description: description.slice(0, 300),
        image: imageUrl,
        type: postPath ? 'article' : 'product',
        url,
        structuredData,
      })
    );
  } catch (error) {
    next(error);
  }
});

// frontend build serve
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendBuildPath = path.join(__dirname, '../dist');
const frontendIndexPath = path.join(frontendBuildPath, 'index.html');

app.use(compression());
app.use(
  express.static(frontendBuildPath, {
    setHeaders: (res, filePath) => {
      const relativePath = path.relative(frontendBuildPath, filePath);
      if (relativePath.startsWith(`assets${path.sep}`)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  })
);

// React routes fallback
app.get('/{*splat}', (req, res, next) => {
  if (!existsSync(frontendIndexPath)) return next();
  const siteUrl = getSiteUrl(req);
  const url = new URL(req.path, siteUrl).href;
  readFile(frontendIndexPath, 'utf8')
    .then((html) => {
      res.type('html').send(
        renderSeoHead(html, {
          ...getRouteSeoMetadata(req.path),
          image: new URL('/img/login-hero.webp', siteUrl).href,
          url,
        })
      );
    })
    .catch(next);
});

app.use(errorHandler);

export default app;
