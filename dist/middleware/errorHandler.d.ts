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
export declare function errorHandler(err: Error | ZodError, _req: Request, res: Response, _next: NextFunction): void;
/**
 * Factory for creating throwable API errors with HTTP status codes.
 */
export declare function createApiError(message: string, statusCode: number): Error & {
    statusCode: number;
};
//# sourceMappingURL=errorHandler.d.ts.map