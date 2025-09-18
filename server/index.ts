import "dotenv/config";

// TLS safety guard: never disable verification in production
if (process.env.NODE_ENV !== "production" && process.env.ALLOW_INSECURE_TLS === "true") {
  // eslint-disable-next-line no-process-env
  (process as any).env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  console.warn("⚠️  TLS verification is disabled for local development. Do NOT use this in production.");
}

import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { pool } from "./db";

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ['Content-Type', 'X-Admin-Email'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PgSession = connectPgSimple(session);

app.use(
  session({
    store: new PgSession({ pool }),
    secret: process.env.SESSION_SECRET ?? "changeme",
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req, _res, next) => {
  console.log(`📥 Received request: ${req.method} ${req.path}`);
  console.log(`🧾 Headers:`, req.headers);
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app); // ✅ routes are loaded here

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number(process.env.PORT ?? 5000);
  server.listen(port, () => {
    log(`serving on http://localhost:${port}`);
  });
})();
