import express from 'express';
import { AppConfigController } from '../controllers/AppConfigController';
import { authenticateToken } from '../middleware/authTokenMiddleware';
import { AuthenticatedRequest } from '../types/types';

const router = express.Router();
const appConfigController = new AppConfigController();

router.put('/:key', authenticateToken, (req: AuthenticatedRequest, res, next) => appConfigController.updateConfig(req, res, next));
router.get('/:key', (req, res, next) => appConfigController.getConfigByKey(req, res, next));

export { router as configRouter };
