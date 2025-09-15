import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import * as tf from '@tensorflow/tfjs-node';
import photoRoutes from './routes/photoRoutes';

// Initialize TensorFlow.js
tf.ready().then(() => {
  console.log('TensorFlow.js is ready');
});

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', photoRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});