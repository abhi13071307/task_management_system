import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { StatusCodes } from 'http-status-codes';
import { config } from './config/env';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Server is running',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Route not found',
  });
});

// Start server
app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
