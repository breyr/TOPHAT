import express from 'express';
import { UserController } from '../controllers/UserController';

const router = express.Router();
const userController = new UserController();

router.post('/register', (req, res, next) => userController.createUser(req, res, next))
router.post('/login', (req, res, next) => userController.validateUser(req, res, next))

export { router as userRouter };
