import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";
import { cache } from "react";

// In-memory storage for when database is not configured
let inMemoryStorage: {
  chats: any[];
  messages: any[];
} = {
  chats: [],
  messages: [],
};

export const getPrisma = cache(() => {
  // If DATABASE_URL is not set, use in-memory storage
  if (!process.env.DATABASE_URL) {
    return {
      chat: {
        create: async (data: any) => {
          const chat = { id: `mem_${Date.now()}`, ...data.data };
          inMemoryStorage.chats.push(chat);
          return chat;
        },
        update: async (data: any) => {
          const chatIndex = inMemoryStorage.chats.findIndex((c) => c.id === data.where.id);
          if (chatIndex === -1) throw new Error("Chat not found");
          
          // Handle messages creation if included in update
          if (data.data.messages?.createMany) {
            const messages = data.data.messages.createMany.data.map((msg: any) => ({
              id: `mem_${Date.now()}_${Math.random()}`,
              ...msg,
              chatId: data.where.id
            }));
            inMemoryStorage.messages.push(...messages);
          }
          
          // Update chat
          const updatedChat = {
            ...inMemoryStorage.chats[chatIndex],
            ...data.data,
            messages: inMemoryStorage.messages.filter((m) => m.chatId === data.where.id)
          };
          inMemoryStorage.chats[chatIndex] = updatedChat;
          return updatedChat;
        },
        findUnique: async (data: any) => {
          const chat = inMemoryStorage.chats.find((c) => c.id === data.where.id);
          if (!chat) return null;
          if (data.include?.messages) {
            return {
              ...chat,
              messages: inMemoryStorage.messages.filter((m) => m.chatId === data.where.id)
            };
          }
          return chat;
        }
      },
      message: {
        create: async (data: any) => {
          const message = { id: `mem_${Date.now()}_${Math.random()}`, ...data };
          inMemoryStorage.messages.push(message);
          return message;
        }
      }
    };
  }

  // If DATABASE_URL is set, use actual database
  try {
    const neon = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaNeon(neon);
    return new PrismaClient({ adapter });
  } catch (error) {
    console.warn("Failed to connect to database, falling back to in-memory storage:", error);
    // Reset storage and return in-memory client
    inMemoryStorage = { chats: [], messages: [] };
    return getPrisma();
  }
});
