import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import adminRoutes from './routes/admin';
import userRoutes from './routes/user';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log('HallmarkHub backend running');
});
