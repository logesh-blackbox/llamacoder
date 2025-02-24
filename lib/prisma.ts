import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";
import { cache } from "react";

export const getPrisma = cache(() => {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set. Running in no-DB mode. Some features may be limited.');
    // Return a mock client that implements PrismaClient interface but does nothing
    return {
      generatedApp: {
        create: async () => ({}),
        findMany: async () => [],
        findUnique: async () => null,
      },
      chat: {
        create: async () => ({}),
        findMany: async () => [],
        findUnique: async () => null,
      },
      message: {
        create: async () => ({}),
        findMany: async () => [],
        findUnique: async () => null,
      },
      $connect: async () => {},
      $disconnect: async () => {},
    };
  }
  
  const neon = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaNeon(neon);
  return new PrismaClient({ adapter });
});
