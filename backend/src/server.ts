import express from 'express';
import cors from 'cors';
import pool from './config/db';
import categoryRoutes from './routes/categoryRoutes';
import expensesRoutes from './routes/expensesRoutes';

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// routes
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', expensesRoutes);

// Test database connection
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'OK', 
      database: 'Connected',
      timestamp: result.rows[0].now 
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


// Start the server
app.listen(port, () => {
    console.log(`Server is running on localhost:${port}`);
});

