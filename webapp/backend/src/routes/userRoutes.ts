import express from 'express';
import { UserController } from '../controllers/UserController';
import { AuthenticatedRequest } from '../types/types';

const router = express.Router();
const userController = new UserController();

router.get('/users', (req: AuthenticatedRequest, res, next) => userController.getAllUsers(req, res, next));
router.get('/users/email/:email', (req: AuthenticatedRequest, res, next) => userController.getUserByEmail(req, res, next));
router.delete('/users/:id', (req: AuthenticatedRequest, res, next) => userController.deleteUser(req, res, next));
router.put('/users/:id', (req: AuthenticatedRequest, res, next) => userController.updateUser(req, res, next));
router.post('/register', (req, res, next) => userController.createUser(req, res, next));
router.post('/login', (req, res, next) => userController.validateUser(req, res, next));

export { router as userRouter };
