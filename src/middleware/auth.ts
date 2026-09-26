import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
  accessToken?: string;
}

/**
 * Optional authentication middleware — extracts user info from Bearer token if present.
 * Does NOT reject unauthenticated requests; downstream handlers decide access policy.
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return next();
    }

    req.userId = user.id;
    req.accessToken = token;

    // Fetch user role from profiles table
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    req.userRole = profile?.role || 'user';
    next();
  } catch {
    next();
  }
}

/**
 * Strict authentication middleware — rejects unauthenticated requests with 401.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. Please sign in.' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Invalid or expired authentication token.' });
      return;
    }

    req.userId = user.id;
    req.accessToken = token;

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    req.userRole = profile?.role || 'user';
    next();
  } catch {
    res.status(500).json({ error: 'Authentication service error.' });
  }
}

/**
 * Admin-only middleware — must be chained after requireAuth.
 */
export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (req.userRole !== 'admin') {
    res.status(403).json({ error: 'Administrative access required.' });
    return;
  }
  next();
}
