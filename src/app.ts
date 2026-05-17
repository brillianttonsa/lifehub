import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';

// error
import { errorHandler } from './middlewares/error.middleware';

import { env } from './config/env';

const app = express();

// CORS (important for cookies)
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}


// Error handling middleware (should be last)
app.use(errorHandler);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

export default app;