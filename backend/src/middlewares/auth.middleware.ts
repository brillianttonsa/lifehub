import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = verifyToken(token, process.env.JWT_ACCESS_SECRET!);
    (req as any).userId = decoded.userId;
    next();

  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};