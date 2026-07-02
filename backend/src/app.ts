import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

// error
import { errorHandler } from './middlewares/error.middleware';

// routes
import authRoutes from './modules/auth/auth.routes';
import projectRoutes from './modules/project/routes/project.routes'
import entryRoutes from './modules/project/routes/entry.routes'
import pocketRoutes from './modules/pocket'
import planRoutes from './modules/plan'

// middlewares
import {
  globalLimiter,
  strictLimiter,
  moderateLimiter,
} from './middlewares/rateLimit.middleware';
import {
  loggerMiddleware,
  errorLoggerMiddleware,
  monitoringMiddleware,
} from './middlewares/logger.middleware';


import { env } from './config/env';

const app = express();

// Security middleware
app.use(helmet());

// CORS (important for cookies)
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

// Basic middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Logging and Monitoring
app.use(loggerMiddleware);
app.use(monitoringMiddleware);
app.use(errorLoggerMiddleware);

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Global rate limiter
app.use(globalLimiter);

// Routes
app.use('/api/auth', strictLimiter, authRoutes);
app.use('/api/projects', moderateLimiter, projectRoutes);
app.use('/api/project/entries', moderateLimiter, entryRoutes)
app.use('/api/pocket', moderateLimiter, pocketRoutes)
app.use('/api/plans', moderateLimiter, planRoutes)


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Error handling middleware (should be last)
app.use(errorHandler);

export default app;
