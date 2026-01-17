import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { config } from './config';
import path from 'path';
import { setupSwagger } from './config/swagger';

import warehouseRoutes from './routes/warehouseRoutes';
import authRoutes from './routes/authRoutes';

const app: Express = express();

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads/warehouses', express.static(path.join(process.cwd(), 'uploads/warehouses')));

// Swagger API docs
setupSwagger(app);

app.use('/api/auth', authRoutes);
app.use('/api/warehouses', warehouseRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Server is running' });
});

app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Global error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = config.port || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
