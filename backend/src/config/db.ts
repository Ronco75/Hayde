import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// PrismaClient singleton pattern for optimal connection pooling
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

// Test connection
prisma.$connect()
  .then(() => {
    console.log('✅ Connected to PostgreSQL database successfully with Prisma!');
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;