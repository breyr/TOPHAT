import express from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken } from '../middleware/authTokenMiddleware';
import { AuthenticatedRequest } from '../types/types';

const router = express.Router();
const userController = new UserController();

router.put('/change-password', (req, res, next) => userController.changePassword(req, res, next));
router.post('/refresh-token', authenticateToken, (req: AuthenticatedRequest, res, next) => userController.refreshToken(req, res, next));
router.get('/users', authenticateToken, (req: AuthenticatedRequest, res, next) => userController.getAllUsers(req, res, next));
router.get('/users/email/:email', authenticateToken, (req: AuthenticatedRequest, res, next) => userController.getUserByEmail(req, res, next));
router.delete('/users/:id', authenticateToken, (req: AuthenticatedRequest, res, next) => userController.deleteUser(req, res, next));
router.put('/users/:id', authenticateToken, (req: AuthenticatedRequest, res, next) => userController.updateUser(req, res, next));
router.post('/register', (req, res, next) => userController.createUser(req, res, next));
router.post('/login', (req, res, next) => userController.validateUser(req, res, next));

export { router as userRouter };

