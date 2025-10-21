import pool from './db';

const createTables = async () => {
    try {
        // Create Categories table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Categories table created successfully');

        // Create Expenses table
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

        // Create Groups table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS groups (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Groups table created successfully');

        // Create Guests table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS guests (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                phone_number VARCHAR(20) NOT NULL,
                group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
                number_of_guests INTEGER DEFAULT 1,
                rsvp_status VARCHAR(20) DEFAULT 'pending' 
                  CHECK (rsvp_status IN ('pending', 'confirmed', 'declined', 'maybe')),
                invitation_sent_at TIMESTAMP,
                reminder_sent_at TIMESTAMP,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Guests table created successfully');

        // Create indexes for better query performance
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_guests_group_id ON guests(group_id);
        `);
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_guests_rsvp_status ON guests(rsvp_status);
        `);
        console.log('✅ Indexes created successfully');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating tables:', error);
        process.exit(1);
    }
};

createTables();