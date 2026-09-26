import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { getAdminStats } from '../services/scanService.js';
const router = Router();
/**
 * GET /api/v1/admin/stats
 * System metrics and scam category analytics — admin only.
 */
router.get('/stats', requireAuth, requireAdmin, async (_req, res, next) => {
    try {
        const stats = await getAdminStats();
        res.status(200).json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        next(error);
    }
});
export default router;
//# sourceMappingURL=adminRoutes.js.map