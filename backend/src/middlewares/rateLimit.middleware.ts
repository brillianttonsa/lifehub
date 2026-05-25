import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * Global rate limiter
 * Limits requests per IP address to prevent abuse
 * - 15 minutes window
 * - 100 requests per window
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => env.NODE_ENV === 'development', // Skip rate limiting in development
});

/**
 * Strict rate limiter for authentication endpoints
 * - 15 minutes window
 * - 5 requests per window
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => env.NODE_ENV === 'development',
});

/**
 * Moderate rate limiter for API endpoints
 * - 15 minutes window
 * - 30 requests per window
 */
export const moderateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // Limit each IP to 30 requests per windowMs
  message: 'Too many requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => env.NODE_ENV === 'development',
});
