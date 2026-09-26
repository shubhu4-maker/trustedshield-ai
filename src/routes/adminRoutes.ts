import { Router, Response, NextFunction } from 'express';
import { AuthenticatedRequest, requireAuth, requireAdmin } from '../middleware/auth.js';
import { getAdminStats } from '../services/scanService.js';

const router = Router();

/**
 * GET /api/v1/admin/stats
 * System metrics and scam category analytics — admin only.
 */
router.get(
  '/stats',
  requireAuth,
  requireAdmin,
  async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await getAdminStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
