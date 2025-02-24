import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";
import { cache } from "react";

// Mock data for when database is not configured
const mockDb = {
  chats: new Map(),
  messages: new Map(),
  generateId: () => `mock_${Date.now()}_${Math.random().toString(36).slice(2)}`,
};

// Mock implementation of PrismaClient
const mockPrismaClient = {
  chat: {
    findFirst: async ({ where, include }) => {
      const chat = mockDb.chats.get(where.id);
      if (!chat) return null;
      
      if (include?.messages) {
        const messages = Array.from(mockDb.messages.values())
          .filter(m => m.chatId === where.id)
          .sort((a, b) => a.position - b.position);
        return { ...chat, messages };
      }
      return chat;
    },
    create: async ({ data }) => {
      const id = mockDb.generateId();
      const chat = { ...data, id, createdAt: new Date() };
      mockDb.chats.set(id, chat);
      return chat;
    },
    update: async (params) => {
      const chat = mockDb.chats.get(params.where.id);
      if (!chat) throw new Error("Chat not found");

      // Handle messages creation if included in update
      if (params.data.messages?.createMany) {
        const newMessages = params.data.messages.createMany.data.map(msg => ({
          id: mockDb.generateId(),
          ...msg,
          chatId: params.where.id,
          createdAt: new Date()
        }));
        newMessages.forEach(msg => mockDb.messages.set(msg.id, msg));
      }

      // Update chat
      const updatedChat = { 
        ...chat, 
        ...params.data,
      };
      mockDb.chats.set(params.where.id, updatedChat);
      
      // Get messages for this chat
      const messages = Array.from(mockDb.messages.values())
        .filter(m => m.chatId === params.where.id)
        .sort((a, b) => a.position - b.position);
      
      // Always return with messages array
      const result = {
        ...updatedChat,
        messages: messages || []  // Ensure messages is always an array
      };
      
      delete result.messages?.createMany; // Remove createMany from response
      return result;
    }
  },
  message: {
    findUnique: async ({ where }) => {
      return mockDb.messages.get(where.id) || null;
    },
    findMany: async ({ where, orderBy }) => {
      let messages = Array.from(mockDb.messages.values())
        .filter(m => m.chatId === where.chatId);
      
      if (where?.position?.lte !== undefined) {
        messages = messages.filter(m => m.position <= where.position.lte);
      }
      
      return orderBy?.position === "asc" 
        ? messages.sort((a, b) => a.position - b.position)
        : messages;
    },
    create: async ({ data }) => {
      const id = mockDb.generateId();
      const message = { ...data, id, createdAt: new Date() };
      mockDb.messages.set(id, message);
      return message;
    }
  }
};

export const getPrisma = cache(() => {
  if (!process.env.DATABASE_URL) {
    console.warn(
      "DATABASE_URL not set. Using in-memory mock database. Data will not persist between restarts."
    );
    return mockPrismaClient;
  }

  try {
    const neon = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaNeon(neon);
    const client = new PrismaClient({ adapter });
    return client;
  } catch (error) {
    console.warn(
      "Failed to connect to database. Using in-memory mock database. Data will not persist between restarts.",
      error
    );
    return mockPrismaClient;
  }
});
