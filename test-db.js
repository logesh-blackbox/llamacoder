
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log('Database connection successful!');
    await prisma.$disconnect();
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

testConnection();
