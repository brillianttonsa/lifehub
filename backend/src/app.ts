import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";

import { env } from "./config/env";
import authRoutes from "./modules/auth/auth.routes";

const app = express();

// CORS (important for cookies)
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Routes
app.use("/api/v1/auth", authRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});



export default app;