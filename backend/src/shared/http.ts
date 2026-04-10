import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "./errors";

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, "NOT_FOUND"));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: err.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: { code: "INTERNAL_ERROR", message: "Unexpected server error" },
  });
}
