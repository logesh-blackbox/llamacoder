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
        findFirst: async (data: any) => {
          const chat = inMemoryStorage.chats.find((c) => c.id === data.where.id);
          if (!chat) return null;
          if (data.include?.messages) {
            return {
              ...chat,
              messages: inMemoryStorage.messages
                .filter((m) => m.chatId === data.where.id)
                .sort((a, b) => a.position - b.position),
            };
          }
          return chat;
        },
        create: async (data: any) => {
          const chat = { 
            id: `mem_${Date.now()}`, 
            ...data.data,
            createdAt: new Date()
          };
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
              chatId: data.where.id,
              createdAt: new Date()
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
        }
      },
      message: {
        findUnique: async (data: any) => {
          return inMemoryStorage.messages.find((m) => m.id === data.where.id) || null;
        },
        findMany: async (data: any) => {
          let messages = inMemoryStorage.messages;
          
          if (data.where?.chatId) {
            messages = messages.filter((m) => m.chatId === data.where.chatId);
          }
          
          if (data.where?.position?.lte) {
            messages = messages.filter((m) => m.position <= data.where.position.lte);
          }
          
          if (data.orderBy?.position === "asc") {
            messages.sort((a, b) => a.position - b.position);
          }
          
          return messages;
        },
        create: async (data: any) => {
          const message = { 
            id: `mem_${Date.now()}_${Math.random()}`, 
            ...data,
            createdAt: new Date()
          };
          inMemoryStorage.messages.push(message);
          return message;
        }
      }
    };
  }

  // If DATABASE_URL is set, use real database connection
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
