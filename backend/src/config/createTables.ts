/**
 * Legacy table creation script
 *
 * This script has been replaced by Prisma Migrate.
 *
 * To set up the database using Prisma:
 * 1. Run: npm run prisma:generate (to generate Prisma Client)
 * 2. Run: npm run migrate (to apply migrations)
 *
 * For development with an existing database:
 * - Use: npx prisma db pull (to introspect existing database)
 * - Use: npx prisma migrate dev (to create and apply new migrations)
 *
 * For production deployments:
 * - Use: npx prisma migrate deploy (to apply pending migrations)
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const migrate = async () => {
    try {
        console.log('🔄 Running Prisma migrations...\n');

        // Run Prisma migrate
        const { stdout, stderr } = await execAsync('npx prisma migrate dev --name init');

        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);

        console.log('\n✅ Database migration completed successfully!');
        console.log('✅ Prisma Client generated and ready to use.');

        process.exit(0);
    } catch (error: any) {
        console.error('❌ Error running Prisma migration:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Make sure DATABASE_URL is set in .env file');
        console.error('2. Make sure PostgreSQL is running');
        console.error('3. Make sure the database "hayde" exists');
        console.error('\nFor manual migration, run: npx prisma migrate dev');

        process.exit(1);
    }
};

// Only run if executed directly (not imported)
if (require.main === module) {
    migrate();
}

export default migrate;