import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface ApiError {
  error: string;
  details?: unknown;
  statusCode: number;
}

/**
 * Global error handler — catches all unhandled errors and returns structured JSON responses.
 * Zod validation errors are formatted with field-level detail.
 */
export function errorHandler(
  err: Error | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json({
      error: 'Validation failed.',
      details: formattedErrors,
      statusCode: 400,
    });
    return;
  }

  // Known API errors with status codes
  if ('statusCode' in err) {
    const apiErr = err as Error & { statusCode: number };
    res.status(apiErr.statusCode).json({
      error: apiErr.message,
      statusCode: apiErr.statusCode,
    });
    return;
  }

  // Unknown server errors — log internally, return generic message
  console.error('[TrustShield Server Error]', err.message, err.stack);
  res.status(500).json({
    error: 'Internal server error. Our team has been notified.',
    statusCode: 500,
  });
}

/**
 * Factory for creating throwable API errors with HTTP status codes.
 */
export function createApiError(message: string, statusCode: number): Error & { statusCode: number } {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
}
