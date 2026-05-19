import { ZodSchema } from 'zod';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AppError } from '../utils/AppError';

export const validate =
  (schema: ZodSchema): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => issue.message)
        .join(', ');

      return next(new AppError(message, 400));
    }

    req.body = result.data;
    next();
  };
