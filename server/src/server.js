import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import connectDB from './config/db.js';
import { setupSocketHandlers } from './sockets/socketHandler.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect database
  await connectDB();

  const server = http.createServer(app);

  // Initialize Socket.IO
  const io = new SocketIOServer(server, {
    cors: {
      origin: [
        process.env.CLIENT_URL || 'http://localhost:3000',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
      ],
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  // Attach socket handlers
  setupSocketHandlers(io);

  // Listen
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 LocalTrust Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`📡 API Base: http://localhost:${PORT}/api/v1`);
    console.log(`🩺 Health:   http://localhost:${PORT}/api/v1/health`);
    console.log(`=======================================================`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\n[Server] Received kill signal, shutting down gracefully...');
    server.close(() => {
      console.log('[Server] HTTP and Socket connections closed.');
      process.exit(0);
    });

    setTimeout(() => {
      console.error('[Server] Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
