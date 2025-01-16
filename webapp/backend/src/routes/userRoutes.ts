import express from 'express';
import { UserController } from '../controllers/UserController';

const router = express.Router();
const userController = new UserController();

router.post('/register', (req, res, next) => userController.createUser(req, res, next))
router.post('/register/bulk', (req, res, next) => userController.createUsers(req, res, next));
router.post('/login', (req, res, next) => userController.validateUser(req, res, next))
router.put('/change-password', (req, res, next) => userController.changePassword(req, res, next))

export { router as userRouter };
