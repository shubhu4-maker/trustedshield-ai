/**
 * Rate limiter for the /api/v1/analyze endpoint.
 * Max 10 requests per minute per IP to prevent Gemini API quota exhaustion.
 */
export declare const analyzeRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * General API rate limiter — more permissive for read endpoints.
 */
export declare const generalRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rateLimiter.d.ts.map