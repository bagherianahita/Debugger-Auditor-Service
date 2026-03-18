import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { config } from "./config";
import { runBatchAudit, runSingleAudit } from "./controllers/debugController";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigins.includes("*") ? true : config.corsOrigins,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(config.logFormat, { skip: (req) => req.path === "/health" }));

// Health check
//ارتقای Health Check، به جای یک پاسخ ساده، وضعیت اتصال به منابع حیاتی مثل پایگاه‌داده (Database) یا حافظه موقت (Redis)
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "trust-debugger-service",
    env: config.nodeEnv,
  });
});

// Trust Debugger / Auditor endpoints
app.post("/debug/audit", runSingleAudit);
app.post("/debug/batch-audit", runBatchAudit);

// 404
app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Error handling
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(
    `trust-debugger-service listening on http://localhost:${config.port}`
  );
});

