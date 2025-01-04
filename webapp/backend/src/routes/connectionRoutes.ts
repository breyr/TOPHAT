import { Router } from 'express';
import { ConnectionController } from '../controllers/ConnectionController';
import { authenticateToken } from '../middleware/authTokenMiddleware';
import { AuthenticatedRequest } from '../types/types';

const router = Router();
const connectionController = new ConnectionController();

router.post('/', authenticateToken, async (req: AuthenticatedRequest, res, next) => connectionController.createConnection(req, res, next));
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res, next) => connectionController.getAllConnections(req, res, next));
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => connectionController.getConnectionById(req, res, next));
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => connectionController.updateConnection(req, res, next));
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => connectionController.deleteConnection(req, res, next));
router.get('/labDeviceName/:labDeviceName', authenticateToken, async (req: AuthenticatedRequest, res, next) => connectionController.getConnectionsByLabDeviceName(req, res, next));
router.get('/interconnectDeviceName/:interconnectDeviceName', authenticateToken, async (req: AuthenticatedRequest, res, next) => connectionController.getConnectionsByInterconnectDeviceName(req, res, next));

export { router as connectionRouter };
