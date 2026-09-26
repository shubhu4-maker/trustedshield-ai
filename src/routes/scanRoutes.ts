import { Router, Response, NextFunction } from 'express';
import { PublicFeedQuerySchema, ScanIdParamsSchema } from '../validators.js';
import { AuthenticatedRequest, optionalAuth, requireAuth } from '../middleware/auth.js';
import {
  getScanById,
  getPublicFeed,
  getUserHistory,
  toggleUpvote,
  togglePublish,
} from '../services/scanService.js';

const router = Router();

/**
 * GET /api/v1/scans/feed
 * Fetches the public anonymized community threat feed with pagination and filters.
 */
router.get(
  '/feed',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = PublicFeedQuerySchema.parse(req.query);
      const result = await getPublicFeed(query);

      res.status(200).json({
        success: true,
        data: {
          scans: result.scans,
          total: result.total,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(result.total / query.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/scans/user/history
 * Fetches scan history for authenticated user (non-ephemeral only).
 */
router.get(
  '/user/history',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await getUserHistory(req.userId!, page, limit);

      res.status(200).json({
        success: true,
        data: {
          scans: result.scans,
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/scans/:id
 * Fetches a single scan report by UUID.
 */
router.get(
  '/:id',
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = ScanIdParamsSchema.parse(req.params);
      const scan = await getScanById(id);

      if (!scan) {
        res.status(404).json({ error: 'Scan not found.' });
        return;
      }

      // Check access: public scans and anonymous scans (via unguessable UUID) are viewable
      if (!scan.is_public && scan.user_id && scan.user_id !== req.userId) {
        res.status(403).json({ error: 'Access denied. This scan is private.' });
        return;
      }

      res.status(200).json({
        success: true,
        data: scan,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/scans/:id/upvote
 * Toggles upvote on a public threat feed scan.
 */
router.post(
  '/:id/upvote',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = ScanIdParamsSchema.parse(req.params);
      const result = await toggleUpvote(id, req.userId!);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/scans/:id/publish
 * Toggles public visibility for user's own scan.
 */
router.post(
  '/:id/publish',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = ScanIdParamsSchema.parse(req.params);
      const result = await togglePublish(id, req.userId!);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
