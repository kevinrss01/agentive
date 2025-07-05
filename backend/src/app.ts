import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config/config';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';
import { requestLogger } from './middlewares/requestLogger';
import routes from './routes';

const app: Express = express();

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// Detailed request logging middleware
app.use(requestLogger);

// API routes
app.use('/api', routes);

// Root route
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to Express TypeScript Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware (should be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
