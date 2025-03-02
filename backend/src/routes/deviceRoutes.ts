import { Router } from 'express';
import { DeviceController } from '../controllers/DeviceController';
import { authenticateToken } from '../middleware/authTokenMiddleware';
import { AuthenticatedRequest } from '../types/types';

const router = Router();
const deviceController = new DeviceController();

router.post('/', authenticateToken, async (req: AuthenticatedRequest, res, next) => deviceController.createDevice(req, res, next));
router.post('/bulk', authenticateToken, async (req: AuthenticatedRequest, res, next) => deviceController.createDevices(req, res, next));
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res, next) => deviceController.getAllDevices(req, res, next));
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => deviceController.getDeviceById(req, res, next));
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => deviceController.updateDevice(req, res, next));
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => deviceController.deleteDevice(req, res, next));
router.get('/type/:deviceType', authenticateToken, async (req: AuthenticatedRequest, res, next) => deviceController.getDevicesByType(req, res, next));
router.get('/icon/:deviceIcon', authenticateToken, async (req: AuthenticatedRequest, res, next) => deviceController.getDevicesByIcon(req, res, next));
router.put('/:id/book', authenticateToken, async (req: AuthenticatedRequest, res, next) => deviceController.bookDevice(req, res, next));

export { router as deviceRouter };
