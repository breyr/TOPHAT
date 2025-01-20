import * as dotenv from 'dotenv';
import express from 'express';
import { DIContainer } from './config/DIContainer';
import { errorHandler } from './middleware/errorHandler';
import { configRouter } from './routes/appconfigRoutes';
import { connectionRouter } from './routes/connectionRoutes';
import { deviceRouter } from './routes/deviceRoutes';
import { topologyRouter } from './routes/TopologyRoutes';
import { userRouter } from './routes/userRoutes';

dotenv.config();

const app = express();

// initialize dependency inject container
DIContainer.initialize();

// middleware 
app.use(express.json());

// base router
const baseRouter = express.Router();
baseRouter.use('/auth', userRouter);
baseRouter.use('/topology', topologyRouter);
baseRouter.use('/devices', deviceRouter);
baseRouter.use('/connections', connectionRouter);
baseRouter.use('/config', configRouter);

// mount base router
app.use('/api', baseRouter);

// error handling middleware
app.use(errorHandler);

export default app;