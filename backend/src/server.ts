import express from 'express';
import cors from 'cors';
import path from 'path';
import prisma from './config/db';
import categoryRoutes from './routes/categoryRoutes';
import expensesRoutes from './routes/expensesRoutes';
import guestRoutes from './routes/guestRoutes';
import groupRoutes from './routes/groupRoutes';
import importRoutes from './routes/importRoutes';
import weddingRoutes from './routes/weddingRoute';
import tableRoutes from './routes/tableRoutes';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoute';
import { getUploadsPath } from './middleware/uploadMiddleware';

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from uploads directory
app.use('/uploads', express.static(getUploadsPath()));

// routes
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/import', importRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/weddings', weddingRoutes);
app.use('/api/tables', tableRoutes);

// Test database connection
app.get('/api/health', async (req, res) => {
  try {
    // Test Prisma connection with a simple query
    const result = await prisma.$queryRaw<Array<{ now: Date }>>`SELECT NOW()`;
    res.json({
      status: 'OK',
      database: 'Connected with Prisma',
      timestamp: result[0].now
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      database: 'Disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// routes
app.get('/', (req, res) => {
    res.json({ message: 'Hayde backend is running'});
})

// Error handling middleware - MUST be registered AFTER all routes
app.use(errorHandler);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on localhost:${port}`);
});


