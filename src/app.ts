import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import hpp from "hpp";
import { ENV } from "@/config/env";
import routes from "@/routes";

const app = express();

app.use(helmet());

const builtInOrigins = [
  "https://recipi-frontend-lake.vercel.app",
  "https://recipi-frontend-eta.vercel.app",
];

const allowedOrigins = [
  ...new Set([
    ...builtInOrigins,
    ...ENV.FRONTEND_URL.split(",")
      .map((origin) => origin.trim().replace(/\/$/, ""))
      .filter(Boolean),
  ]),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(hpp());

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: `${ENV.APP_NAME} instance is healthy - 3B - New Features!`,
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV,
  });
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", routes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

app.use(
  (err: any, req: Request, res: Response, _next: NextFunction) => {
    console.error("🔥 Global Error Hook:", err.message);

    const statusCode = err.status || 500;

    res.status(statusCode).json({
      status: "error",
      message:
        ENV.NODE_ENV === "production"
          ? "Internal Server Error"
          : err.message,
      ...(ENV.NODE_ENV !== "production" && { stack: err.stack }),
    });
  }
);

export default app;