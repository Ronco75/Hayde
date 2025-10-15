import pool from './db';

const createTables = async () => {
    try {
        //Create Categories table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `);
        console.log('✅ Categories table created successfully');

        // Create expenses table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS expenses (
              id SERIAL PRIMARY KEY,
              category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
              name VARCHAR(200) NOT NULL,
              price_per_unit DECIMAL(10, 2) NOT NULL,
              quantity INTEGER DEFAULT 1,
              amount_paid DECIMAL(10, 2) DEFAULT 0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `);
        console.log('✅ Expenses table created successfully');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating tables:', error);
        process.exit(1);
    }
};

createTables();