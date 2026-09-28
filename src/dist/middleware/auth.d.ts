import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    userId?: string;
    userRole?: string;
    accessToken?: string;
}
/**
 * Optional authentication middleware — extracts user info from Bearer token if present.
 * Does NOT reject unauthenticated requests; downstream handlers decide access policy.
 */
export declare function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void>;
/**
 * Strict authentication middleware — rejects unauthenticated requests with 401.
 */
export declare function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * Admin-only middleware — must be chained after requireAuth.
 */
export declare function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map