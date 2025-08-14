import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/index';

const app = express();

// CORS configuration for React frontend
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));

// JSON body parser middleware
app.use(express.json());

// Cookie parser middleware
app.use(cookieParser());

// API routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;