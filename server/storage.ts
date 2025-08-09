import { type User, type InsertUser, type Assistant, type InsertAssistant, type Conversation, type InsertConversation, type GoogleDocsDocument, type InsertGoogleDocsDocument } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { users, assistants, conversations, googleDocsDocuments } from "@shared/schema";
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

  // Google Docs Document operations
  getGoogleDocsDocument(id: string): Promise<GoogleDocsDocument | undefined>;
  getGoogleDocsDocumentsByAssistantId(assistantId: string): Promise<GoogleDocsDocument[]>;
  getGoogleDocsDocumentsByUserId(userId: string): Promise<GoogleDocsDocument[]>;
  createGoogleDocsDocument(document: InsertGoogleDocsDocument & { userId: string; assistantId: string }): Promise<GoogleDocsDocument>;
  updateGoogleDocsDocument(id: string, updates: Partial<GoogleDocsDocument>): Promise<GoogleDocsDocument | undefined>;
  deleteGoogleDocsDocument(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private assistants: Map<string, Assistant>;
  private conversations: Map<string, Conversation>;
  private googleDocsDocuments: Map<string, GoogleDocsDocument>;

  constructor() {
    this.users = new Map();
    this.assistants = new Map();
    this.conversations = new Map();
    this.googleDocsDocuments = new Map();
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
      apiKey: null,
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

  async createAssistant(assistant: InsertAssistant & { userId: string; openaiAssistantId?: string }): Promise<Assistant> {
    const id = randomUUID();
    const newAssistant: Assistant = {
      ...assistant,
      id,
      openaiAssistantId: assistant.openaiAssistantId || null,
      description: assistant.description || null,
      instructions: assistant.instructions || null,
      model: assistant.model || 'gpt-4o',
      temperature: assistant.temperature || null,
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
      openaiThreadId: null,
      title: conversation.title || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: (conversation.messages as Array<{ id: string; role: "user" | "assistant" | "system"; content: string; timestamp: string }>) || []
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

  // Google Docs Document operations
  async getGoogleDocsDocument(id: string): Promise<GoogleDocsDocument | undefined> {
    return this.googleDocsDocuments.get(id);
  }

  async getGoogleDocsDocumentsByAssistantId(assistantId: string): Promise<GoogleDocsDocument[]> {
    return Array.from(this.googleDocsDocuments.values()).filter(doc => doc.assistantId === assistantId);
  }

  async getGoogleDocsDocumentsByUserId(userId: string): Promise<GoogleDocsDocument[]> {
    return Array.from(this.googleDocsDocuments.values()).filter(doc => doc.userId === userId);
  }

  async createGoogleDocsDocument(document: InsertGoogleDocsDocument & { userId: string; assistantId: string }): Promise<GoogleDocsDocument> {
    const id = randomUUID();
    const newDocument: GoogleDocsDocument = {
      ...document,
      id,
      status: document.status || 'completed',
      content: document.content || null,
      processedAt: null,
      errorMessage: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.googleDocsDocuments.set(id, newDocument);
    return newDocument;
  }

  async updateGoogleDocsDocument(id: string, updates: Partial<GoogleDocsDocument>): Promise<GoogleDocsDocument | undefined> {
    const document = this.googleDocsDocuments.get(id);
    if (!document) return undefined;

    const updatedDocument = { 
      ...document, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.googleDocsDocuments.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteGoogleDocsDocument(id: string): Promise<boolean> {
    return this.googleDocsDocuments.delete(id);
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

  async createUser(userData: InsertUser): Promise<User> {
    const id = randomUUID();
    const [user] = await db
      .insert(users)
      .values({ ...userData, id })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
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

  async createAssistant(assistantData: InsertAssistant & { userId: string }): Promise<Assistant> {
    const id = randomUUID();
    const [assistant] = await db
      .insert(assistants)
      .values({ ...assistantData, id })
      .returning();
    return assistant;
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

  async createConversation(conversationData: InsertConversation & { userId: string }): Promise<Conversation> {
    const id = randomUUID();
    const [conversation] = await db
      .insert(conversations)
      .values({ ...conversationData, id })
      .returning();
    return conversation;
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

  // Google Docs Document operations
  async getGoogleDocsDocument(id: string): Promise<GoogleDocsDocument | undefined> {
    const [document] = await db.select().from(googleDocsDocuments).where(eq(googleDocsDocuments.id, id));
    return document || undefined;
  }

  async getGoogleDocsDocumentsByAssistantId(assistantId: string): Promise<GoogleDocsDocument[]> {
    return await db.select().from(googleDocsDocuments).where(eq(googleDocsDocuments.assistantId, assistantId));
  }

  async getGoogleDocsDocumentsByUserId(userId: string): Promise<GoogleDocsDocument[]> {
    return await db.select().from(googleDocsDocuments).where(eq(googleDocsDocuments.userId, userId));
  }

  async createGoogleDocsDocument(documentData: InsertGoogleDocsDocument & { userId: string; assistantId: string }): Promise<GoogleDocsDocument> {
    const id = randomUUID();
    const [document] = await db
      .insert(googleDocsDocuments)
      .values({ 
        ...documentData, 
        id,
        status: documentData.status || 'completed',
        processedAt: null,
        errorMessage: null
      })
      .returning();
    return document;
  }

  async updateGoogleDocsDocument(id: string, updates: Partial<GoogleDocsDocument>): Promise<GoogleDocsDocument | undefined> {
    const [document] = await db
      .update(googleDocsDocuments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(googleDocsDocuments.id, id))
      .returning();
    return document || undefined;
  }

  async deleteGoogleDocsDocument(id: string): Promise<boolean> {
    const result = await db.delete(googleDocsDocuments).where(eq(googleDocsDocuments.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
