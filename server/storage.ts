import { type User, type InsertUser, type Assistant, type InsertAssistant, type Conversation, type InsertConversation, type KnowledgeBase, type InsertKnowledgeBase, users, assistants, conversations, knowledgeBase } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Assistant operations
  getAssistant(id: string): Promise<Assistant | undefined>;
  getAssistantsByUserId(userId: string): Promise<Assistant[]>;
  createAssistant(assistant: InsertAssistant & { userId: string }): Promise<Assistant>;
  updateAssistant(id: string, updates: Partial<Assistant>): Promise<Assistant | undefined>;
  deleteAssistant(id: string): Promise<boolean>;

  // Conversation operations
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationsByUserId(userId: string): Promise<Conversation[]>;
  getConversationsByAssistantId(assistantId: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation & { userId: string }): Promise<Conversation>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined>;
  deleteConversation(id: string): Promise<boolean>;

  // Knowledge Base operations
  getKnowledgeBaseFile(id: string): Promise<KnowledgeBase | undefined>;
  getKnowledgeBaseFilesByUserId(userId: string): Promise<KnowledgeBase[]>;
  getKnowledgeBaseFilesByAssistantId(assistantId: string): Promise<KnowledgeBase[]>;
  createKnowledgeBaseFile(file: InsertKnowledgeBase & { userId: string }): Promise<KnowledgeBase>;
  updateKnowledgeBaseFile(id: string, updates: Partial<KnowledgeBase>): Promise<KnowledgeBase | undefined>;
  deleteKnowledgeBaseFile(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private assistants: Map<string, Assistant>;
  private conversations: Map<string, Conversation>;

  constructor() {
    this.users = new Map();
    this.assistants = new Map();
    this.conversations = new Map();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
      settings: insertUser.settings as { defaultModel?: string; autoSave?: boolean; darkMode?: boolean; } || {}
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Assistant operations
  async getAssistant(id: string): Promise<Assistant | undefined> {
    return this.assistants.get(id);
  }

  async getAssistantsByUserId(userId: string): Promise<Assistant[]> {
    return Array.from(this.assistants.values()).filter(assistant => assistant.userId === userId);
  }

  async createAssistant(assistant: InsertAssistant & { userId: string }): Promise<Assistant> {
    const id = randomUUID();
    const newAssistant: Assistant = {
      ...assistant,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      tools: (assistant.tools as Array<{ type: string; enabled: boolean }>) || [],
      files: (assistant.files as Array<{ id: string; name: string; path: string }>) || []
    };
    this.assistants.set(id, newAssistant);
    return newAssistant;
  }

  async updateAssistant(id: string, updates: Partial<Assistant>): Promise<Assistant | undefined> {
    const assistant = this.assistants.get(id);
    if (!assistant) return undefined;

    const updatedAssistant = { 
      ...assistant, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.assistants.set(id, updatedAssistant);
    return updatedAssistant;
  }

  async deleteAssistant(id: string): Promise<boolean> {
    return this.assistants.delete(id);
  }

  // Conversation operations
  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationsByUserId(userId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(conv => conv.userId === userId);
  }

  async getConversationsByAssistantId(assistantId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(conv => conv.assistantId === assistantId);
  }

  async createConversation(conversation: InsertConversation & { userId: string }): Promise<Conversation> {
    const id = randomUUID();
    const newConversation: Conversation = {
      ...conversation,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: conversation.messages || []
    };
    this.conversations.set(id, newConversation);
    return newConversation;
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;

    const updatedConversation = { 
      ...conversation, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }

  async deleteConversation(id: string): Promise<boolean> {
    return this.conversations.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Assistant operations
  async getAssistant(id: string): Promise<Assistant | undefined> {
    const [assistant] = await db.select().from(assistants).where(eq(assistants.id, id));
    return assistant || undefined;
  }

  async getAssistantsByUserId(userId: string): Promise<Assistant[]> {
    return await db.select().from(assistants).where(eq(assistants.userId, userId));
  }

  async createAssistant(assistant: InsertAssistant & { userId: string }): Promise<Assistant> {
    const [newAssistant] = await db
      .insert(assistants)
      .values(assistant)
      .returning();
    return newAssistant;
  }

  async updateAssistant(id: string, updates: Partial<Assistant>): Promise<Assistant | undefined> {
    const [assistant] = await db
      .update(assistants)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(assistants.id, id))
      .returning();
    return assistant || undefined;
  }

  async deleteAssistant(id: string): Promise<boolean> {
    const result = await db.delete(assistants).where(eq(assistants.id, id));
    return result.rowCount > 0;
  }

  // Conversation operations
  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async getConversationsByUserId(userId: string): Promise<Conversation[]> {
    return await db.select().from(conversations).where(eq(conversations.userId, userId));
  }

  async getConversationsByAssistantId(assistantId: string): Promise<Conversation[]> {
    return await db.select().from(conversations).where(eq(conversations.assistantId, assistantId));
  }

  async createConversation(conversation: InsertConversation & { userId: string }): Promise<Conversation> {
    const [newConversation] = await db
      .insert(conversations)
      .values(conversation)
      .returning();
    return newConversation;
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const [conversation] = await db
      .update(conversations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return conversation || undefined;
  }

  async deleteConversation(id: string): Promise<boolean> {
    const result = await db.delete(conversations).where(eq(conversations.id, id));
    return result.rowCount > 0;
  }

  // Knowledge Base operations
  async getKnowledgeBaseFile(id: string): Promise<KnowledgeBase | undefined> {
    const [file] = await db.select().from(knowledgeBase).where(eq(knowledgeBase.id, id));
    return file || undefined;
  }

  async getKnowledgeBaseFilesByUserId(userId: string): Promise<KnowledgeBase[]> {
    return await db.select().from(knowledgeBase).where(eq(knowledgeBase.userId, userId));
  }

  async getKnowledgeBaseFilesByAssistantId(assistantId: string): Promise<KnowledgeBase[]> {
    return await db.select().from(knowledgeBase).where(eq(knowledgeBase.assistantId, assistantId));
  }

  async createKnowledgeBaseFile(file: InsertKnowledgeBase & { userId: string }): Promise<KnowledgeBase> {
    const [newFile] = await db
      .insert(knowledgeBase)
      .values(file)
      .returning();
    return newFile;
  }

  async updateKnowledgeBaseFile(id: string, updates: Partial<KnowledgeBase>): Promise<KnowledgeBase | undefined> {
    const [file] = await db
      .update(knowledgeBase)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(knowledgeBase.id, id))
      .returning();
    return file || undefined;
  }

  async deleteKnowledgeBaseFile(id: string): Promise<boolean> {
    const result = await db.delete(knowledgeBase).where(eq(knowledgeBase.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
