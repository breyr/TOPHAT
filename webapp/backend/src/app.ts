import * as dotenv from 'dotenv';
import express from 'express';
import authRoutes from './routes/authRoutes';
import topologyRoutes from './routes/topologyRoutes';

dotenv.config();

const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/topology', topologyRoutes);

export default app;