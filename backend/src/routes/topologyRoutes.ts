import { Router } from 'express';
import { TopologyController } from '../controllers/TopologyController';
import { authenticateToken } from '../middleware/authTokenMiddleware';
import { AuthenticatedRequest } from '../types/types';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();
const topologyController = new TopologyController();

router.get('/all', authenticateToken, adminAuth, async (req: AuthenticatedRequest, res, next) =>  topologyController.getAllUsersTopologies(req, res, next));
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res, next) => topologyController.createTopology(req, res, next));
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res, next) => topologyController.getAllTopologies(req, res, next));
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => topologyController.getTopologyById(req, res, next));
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => topologyController.updateTopology(req, res, next));
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => topologyController.deleteTopology(req, res, next));

export { router as topologyRouter };
