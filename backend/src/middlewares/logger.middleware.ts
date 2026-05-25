import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

interface RequestMetrics {
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  userAgent: string;
  userId?: string;
  timestamp: string;
  ipAddress: string;
}

/**
 * Custom logger middleware for tracking request metrics
 * Logs: method, URL, status code, response time, user info
 */
export const loggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const startTime = Date.now();

  // Capture the original res.json to intercept responses
  const originalJson = res.json.bind(res);

  res.json = function (data: any) {
    const responseTime = Date.now() - startTime;
    const ipAddress =
      (req.headers['x-forwarded-for'] as string) ||
      req.connection.remoteAddress ||
      'unknown';

    const metrics: RequestMetrics = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get('user-agent') || 'unknown',
      userId: (req as any).userId,
      timestamp: new Date().toISOString(),
      ipAddress,
    };

    // Log the metrics
    if (env.NODE_ENV === 'development') {
      console.log(`[${metrics.timestamp}] ${metrics.method} ${metrics.url}`);
      console.log(`Status: ${metrics.statusCode} | Time: ${responseTime}ms`);
      if (metrics.userId) {
        console.log(`User ID: ${metrics.userId}`);
      }
      console.log('---');
    } else {
      // Production: Log to a more structured format
      logToProductionFormat(metrics);
    }

    // Attach metrics to response for potential middleware use
    (res as any).metrics = metrics;

    return originalJson(data);
  };

  next();
};

/**
 * Structured logging for production environments
 */
function logToProductionFormat(metrics: RequestMetrics) {
  const logEntry = {
    level: metrics.statusCode >= 400 ? 'warn' : 'info',
    timestamp: metrics.timestamp,
    method: metrics.method,
    path: metrics.url,
    statusCode: metrics.statusCode,
    responseTimeMs: metrics.responseTime,
    userAgent: metrics.userAgent,
    userId: metrics.userId,
    ipAddress: metrics.ipAddress,
  };

  console.log(JSON.stringify(logEntry));
}

/**
 * Error logging middleware for tracking errors
 */
export const errorLoggerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const timestamp = new Date().toISOString();
  const ipAddress =
    (req.headers['x-forwarded-for'] as string) ||
    req.connection.remoteAddress ||
    'unknown';

  const errorLog = {
    timestamp,
    method: req.method,
    path: req.originalUrl,
    statusCode: res.statusCode || 500,
    error: {
      message: err.message,
      name: err.name,
      stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    },
    userId: (req as any).userId,
    ipAddress,
  };

  console.error(JSON.stringify(errorLog));

  next(err);
};

/**
 * Request/Response interceptor for monitoring
 * Tracks request/response sizes and patterns
 */
export const monitoringMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Track request size
  const requestSize = JSON.stringify(req.body || {}).length;

  // Store start time for response tracking
  const startTime = Date.now();

  // Override res.send to track response
  const originalSend = res.send.bind(res);
  res.send = function (data: any) {
    const responseSize = JSON.stringify(data).length;
    const duration = Date.now() - startTime;

    // Store monitoring data
    (res as any).monitoring = {
      requestSize,
      responseSize,
      duration,
      totalSize: requestSize + responseSize,
    };

    // Log slow requests (> 1000ms)
    if (duration > 1000) {
      console.warn(
        `[SLOW REQUEST] ${req.method} ${req.originalUrl} took ${duration}ms`,
      );
    }

    return originalSend(data);
  };

  next();
};
