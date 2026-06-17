export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const badRequest = (msg = 'Bad request') =>
  new AppError(msg, 400)

export const unauthorized = (msg = 'Unauthorized') =>
  new AppError(msg, 401)

export const forbidden = (msg = 'Forbidden') =>
  new AppError(msg, 403)

export const notFound = (msg = 'Not found') =>
  new AppError(msg, 404)

export const conflict = (msg = 'Conflict') =>
  new AppError(msg, 409)

import type { Request } from 'express'
/**
 * Express 5 types route params as `string | string[]`. Our routes only use
 * single-value params, so this narrows them back to plain strings.
 */
export function params(req: Request): Record<string, string> {
  return req.params as Record<string, string>
}