import * as dotenv from 'dotenv';
import express from 'express';
import prismaClient from './prismaClient';
import { DbContext } from './prismaContext';
import createAuthRoutes from './routes/authRoutes';
import topologyRoutes from './routes/topologyRoutes';

dotenv.config();

const app = express();

// create DbContext
const context: DbContext = { prisma: prismaClient };

app.use(express.json());
app.use('/api/auth', createAuthRoutes(context));
app.use('/api/topology', topologyRoutes);

export default app;