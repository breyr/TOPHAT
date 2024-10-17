import * as dotenv from 'dotenv';
import express from 'express';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);

export default app;