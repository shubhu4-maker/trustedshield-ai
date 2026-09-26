import { ZodError } from 'zod';
/**
 * Global error handler — catches all unhandled errors and returns structured JSON responses.
 * Zod validation errors are formatted with field-level detail.
 */
export function errorHandler(err, _req, res, _next) {
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
        const apiErr = err;
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
export function createApiError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}
//# sourceMappingURL=errorHandler.js.map