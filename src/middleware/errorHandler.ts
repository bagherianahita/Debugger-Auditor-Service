import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("Unhandled error in trust-debugger-service:", err);

  if (res.headersSent) {
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Invalid payload",
      errors: err.issues,
    });
    return;
  }

  res.status(500).json({
    message: "Internal server error in trust-debugger-service",
    error:
      process.env.NODE_ENV === "development"
        ? String(err?.message || err)
        : "An unexpected error occurred",
  });
}