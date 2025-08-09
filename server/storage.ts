import { type User, type InsertUser, type Assistant, type InsertAssistant, type Conversation, type InsertConversation, type GoogleDocsDocument, type InsertGoogleDocsDocument } from "@shared/schema";
import { randomUUID } from "crypto";

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
      processedAt: null,
      vectorStoreFileId: null,
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

export const storage = new MemStorage();
