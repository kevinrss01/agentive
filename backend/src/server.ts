import dotenv from 'dotenv';
import { createServer } from 'http';
import app from './app';
import { config } from './config/config';
import { SocketIOService } from './services/socketio.service';

// Load environment variables
dotenv.config();

const PORT = config.port || 4000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const socketIOService = SocketIOService.getInstance();
socketIOService.initialize(httpServer);

const server = httpServer.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
  console.log(`⚡️[server]: Environment: ${config.env}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
