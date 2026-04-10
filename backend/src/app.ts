import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { authRouter } from "./modules/auth/auth.routes";
import { habitsRouter } from "./modules/habits/habits.routes";
import { pocketRouter } from "./modules/pocket/pocket.routes";
import { plansRouter } from "./modules/plans/plans.routes";
import { projectsRouter } from "./modules/projects/projects.routes";
import { workspaceRouter } from "./modules/workspace/workspace.routes";
import { errorHandler, notFoundHandler } from "./shared/http";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan("combined"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/workspaces", workspaceRouter);
app.use("/api/v1/pocket", pocketRouter);
app.use("/api/v1/habits", habitsRouter);
app.use("/api/v1/projects", projectsRouter);
app.use("/api/v1/plans", plansRouter);

app.use(notFoundHandler);
app.use(errorHandler);
