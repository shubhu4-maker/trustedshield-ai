import rateLimit from 'express-rate-limit';
/**
 * Rate limiter for the /api/v1/analyze endpoint.
 * Max 10 requests per minute per IP to prevent Gemini API quota exhaustion.
 */
export const analyzeRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: process.env.NODE_ENV === 'production' ? 15 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many analysis requests. Please wait a minute before trying again.',
        retryAfterSeconds: 60,
    },
    keyGenerator: (req) => {
        return req.ip || req.socket.remoteAddress || 'unknown';
    },
});
/**
 * General API rate limiter — more permissive for read endpoints.
 */
export const generalRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many requests. Please slow down.',
        retryAfterSeconds: 60,
    },
});
//# sourceMappingURL=rateLimiter.js.map