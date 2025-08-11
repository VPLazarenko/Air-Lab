import { type User, type InsertUser, type Assistant, type InsertAssistant, type Conversation, type InsertConversation, type GoogleDocsDocument, type InsertGoogleDocsDocument, type Session, type InsertSession, type Integration, type InsertIntegration, type ChatLog, type InsertChatLog, type Plan, type InsertPlan, type Announcement, type InsertAnnouncement, type UserAnnouncement, type InsertUserAnnouncement } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { users, assistants, conversations, googleDocsDocuments, sessions, integrations, chatLogs, plans, announcements, userAnnouncements } from "@shared/schema";
import { eq, and, gt, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Session operations
  createSession(session: InsertSession & { userId: string }): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<boolean>;
  deleteExpiredSessions(): Promise<void>;

  // Assistant operations
  getAssistant(id: string): Promise<Assistant | undefined>;
  getAssistantsByUserId(userId: string): Promise<Assistant[]>;
  createAssistant(assistant: InsertAssistant & { userId: string; openaiAssistantId?: string }): Promise<Assistant>;
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

  // Integration operations
  getIntegration(id: string): Promise<Integration | undefined>;
  getIntegrationsByUserId(userId: string): Promise<Integration[]>;
  createIntegration(integration: InsertIntegration & { userId: string }): Promise<Integration>;
  updateIntegration(id: string, updates: Partial<Integration>): Promise<Integration | undefined>;
  deleteIntegration(id: string): Promise<boolean>;

  // Chat Log operations
  getChatLogsByUserId(userId: string): Promise<ChatLog[]>;
  getChatLogsByConversationId(conversationId: string): Promise<ChatLog[]>;
  createChatLog(log: InsertChatLog & { userId: string }): Promise<ChatLog>;
  deleteChatLogsByConversationId(conversationId: string): Promise<boolean>;

  // Plan operations
  getPlan(id: string): Promise<Plan | undefined>;
  getAllPlans(): Promise<Plan[]>;
  getActivePlans(): Promise<Plan[]>;
  createPlan(plan: InsertPlan): Promise<Plan>;
  updatePlan(id: string, updates: Partial<Plan>): Promise<Plan | undefined>;
  deletePlan(id: string): Promise<boolean>;

  // Announcement operations
  getAnnouncement(id: string): Promise<Announcement | undefined>;
  getAllAnnouncements(): Promise<Announcement[]>;
  getActiveAnnouncements(): Promise<Announcement[]>;
  getAnnouncementsForUser(userId: string, userRole: string): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement & { createdBy: string }): Promise<Announcement>;
  updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: string): Promise<boolean>;

  // User Announcement operations
  getUserAnnouncement(userId: string, announcementId: string): Promise<UserAnnouncement | undefined>;
  getUserAnnouncements(userId: string): Promise<UserAnnouncement[]>;
  createUserAnnouncement(userAnnouncement: InsertUserAnnouncement): Promise<UserAnnouncement>;
  markAnnouncementAsRead(userId: string, announcementId: string): Promise<boolean>;

  // Plan Activation operations
  activatePlan(userId: string, planName: string): Promise<User>;
  checkAccountStatus(userId: string): Promise<{ isActive: boolean; shouldFreeze: boolean; message?: string }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private assistants: Map<string, Assistant>;
  private conversations: Map<string, Conversation>;
  private googleDocsDocuments: Map<string, GoogleDocsDocument>;
  private sessions: Map<string, Session>;
  private integrations: Map<string, Integration>;
  private chatLogs: Map<string, ChatLog>;

  constructor() {
    this.users = new Map();
    this.assistants = new Map();
    this.conversations = new Map();
    this.googleDocsDocuments = new Map();
    this.sessions = new Map();
    this.integrations = new Map();
    this.chatLogs = new Map();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      apiKey: null,
      role: "user",
      isActive: true,
      plan: "free",
      createdAt: new Date(),
      updatedAt: new Date(),
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

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Session operations
  async createSession(sessionData: InsertSession & { userId: string }): Promise<Session> {
    const id = randomUUID();
    const session: Session = {
      id,
      userId: sessionData.userId,
      token: sessionData.token,
      expiresAt: sessionData.expiresAt,
      createdAt: new Date()
    };
    this.sessions.set(sessionData.token, session);
    return session;
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    const session = this.sessions.get(token);
    if (!session || session.expiresAt < new Date()) {
      if (session) this.sessions.delete(token);
      return undefined;
    }
    return session;
  }

  async deleteSession(token: string): Promise<boolean> {
    return this.sessions.delete(token);
  }

  async deleteExpiredSessions(): Promise<void> {
    const now = new Date();
    for (const [token, session] of this.sessions) {
      if (session.expiresAt < now) {
        this.sessions.delete(token);
      }
    }
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
    // Delete all related data
    
    // 1. Find and delete conversations related to this assistant
    const relatedConversations = Array.from(this.conversations.values())
      .filter(conv => conv.assistantId === id);
    
    for (const conversation of relatedConversations) {
      // Delete chat logs for this conversation
      const relatedChatLogs = Array.from(this.chatLogs.values())
        .filter(log => log.conversationId === conversation.id);
      
      for (const log of relatedChatLogs) {
        this.chatLogs.delete(log.id);
      }
      
      this.conversations.delete(conversation.id);
    }
    
    // 2. Delete Google Docs documents related to this assistant
    const relatedDocs = Array.from(this.googleDocsDocuments.values())
      .filter(doc => doc.assistantId === id);
    
    for (const doc of relatedDocs) {
      this.googleDocsDocuments.delete(doc.id);
    }
    
    // 3. Finally, delete the assistant itself
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

  // Integration operations
  async getIntegration(id: string): Promise<Integration | undefined> {
    return this.integrations.get(id);
  }

  async getIntegrationsByUserId(userId: string): Promise<Integration[]> {
    return Array.from(this.integrations.values()).filter(integration => integration.userId === userId);
  }

  async createIntegration(integrationData: InsertIntegration & { userId: string }): Promise<Integration> {
    const id = randomUUID();
    const newIntegration: Integration = {
      ...integrationData,
      id,
      isActive: integrationData.isActive ?? false,
      config: integrationData.config || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.integrations.set(id, newIntegration);
    return newIntegration;
  }

  async updateIntegration(id: string, updates: Partial<Integration>): Promise<Integration | undefined> {
    const integration = this.integrations.get(id);
    if (!integration) return undefined;

    const updatedIntegration = { 
      ...integration, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.integrations.set(id, updatedIntegration);
    return updatedIntegration;
  }

  async deleteIntegration(id: string): Promise<boolean> {
    return this.integrations.delete(id);
  }

  // Chat Log operations (stub implementations for memory storage)
  async getChatLogsByUserId(userId: string): Promise<ChatLog[]> {
    return [];
  }

  async getChatLogsByConversationId(conversationId: string): Promise<ChatLog[]> {
    return [];
  }

  async createChatLog(logData: InsertChatLog & { userId: string }): Promise<ChatLog> {
    const id = randomUUID();
    return {
      ...logData,
      id,
      createdAt: new Date()
    } as ChatLog;
  }

  async deleteChatLogsByConversationId(conversationId: string): Promise<boolean> {
    return true;
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

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
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

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Session operations
  async createSession(sessionData: InsertSession & { userId: string }): Promise<Session> {
    const id = randomUUID();
    const [session] = await db
      .insert(sessions)
      .values({ ...sessionData, id })
      .returning();
    return session;
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    // Clean up expired sessions first
    await this.deleteExpiredSessions();
    
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())));
    return session || undefined;
  }

  async deleteSession(token: string): Promise<boolean> {
    const result = await db.delete(sessions).where(eq(sessions.token, token));
    return result.rowCount > 0;
  }

  async deleteExpiredSessions(): Promise<void> {
    await db.delete(sessions).where(gt(new Date(), sessions.expiresAt));
  }

  // Assistant operations
  async getAssistant(id: string): Promise<Assistant | undefined> {
    const [assistant] = await db.select().from(assistants).where(eq(assistants.id, id));
    return assistant || undefined;
  }

  async getAssistantsByUserId(userId: string): Promise<Assistant[]> {
    return await db.select().from(assistants).where(eq(assistants.userId, userId));
  }

  async createAssistant(assistantData: InsertAssistant & { userId: string; openaiAssistantId?: string }): Promise<Assistant> {
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
    try {
      // Delete all related data in the correct order (due to foreign key constraints)
      
      // 1. Delete chat logs for conversations related to this assistant
      const assistantConversations = await db.select({ id: conversations.id }).from(conversations).where(eq(conversations.assistantId, id));
      for (const conversation of assistantConversations) {
        await db.delete(chatLogs).where(eq(chatLogs.conversationId, conversation.id));
      }
      
      // 2. Delete conversations related to this assistant
      await db.delete(conversations).where(eq(conversations.assistantId, id));
      
      // 3. Delete Google Docs documents related to this assistant
      await db.delete(googleDocsDocuments).where(eq(googleDocsDocuments.assistantId, id));
      
      // 4. Finally, delete the assistant itself
      const result = await db.delete(assistants).where(eq(assistants.id, id));
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting assistant and related data:', error);
      return false;
    }
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

  // Integration operations
  async getIntegration(id: string): Promise<Integration | undefined> {
    const [integration] = await db.select().from(integrations).where(eq(integrations.id, id));
    return integration || undefined;
  }

  async getIntegrationsByUserId(userId: string): Promise<Integration[]> {
    return await db.select().from(integrations).where(eq(integrations.userId, userId));
  }

  async createIntegration(integrationData: InsertIntegration & { userId: string }): Promise<Integration> {
    const id = randomUUID();
    const [integration] = await db
      .insert(integrations)
      .values({ ...integrationData, id })
      .returning();
    return integration;
  }

  async updateIntegration(id: string, updates: Partial<Integration>): Promise<Integration | undefined> {
    const [integration] = await db
      .update(integrations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(integrations.id, id))
      .returning();
    return integration || undefined;
  }

  async deleteIntegration(id: string): Promise<boolean> {
    const result = await db.delete(integrations).where(eq(integrations.id, id));
    return result.rowCount > 0;
  }

  // Chat Log operations
  async getChatLogsByUserId(userId: string): Promise<ChatLog[]> {
    return await db.select().from(chatLogs).where(eq(chatLogs.userId, userId));
  }

  async getChatLogsByConversationId(conversationId: string): Promise<ChatLog[]> {
    return await db.select().from(chatLogs).where(eq(chatLogs.conversationId, conversationId));
  }

  async createChatLog(logData: InsertChatLog & { userId: string }): Promise<ChatLog> {
    const [log] = await db
      .insert(chatLogs)
      .values(logData)
      .returning();
    return log;
  }

  async deleteChatLogsByConversationId(conversationId: string): Promise<boolean> {
    const result = await db.delete(chatLogs).where(eq(chatLogs.conversationId, conversationId));
    return result.rowCount > 0;
  }

  // Plan operations
  async getPlan(id: string): Promise<Plan | undefined> {
    const [plan] = await db.select().from(plans).where(eq(plans.id, id));
    return plan || undefined;
  }

  async getAllPlans(): Promise<Plan[]> {
    return await db.select().from(plans).orderBy(asc(plans.sortOrder));
  }

  async getActivePlans(): Promise<Plan[]> {
    return await db.select().from(plans).where(eq(plans.isActive, true)).orderBy(asc(plans.sortOrder));
  }

  async createPlan(planData: InsertPlan): Promise<Plan> {
    const id = randomUUID();
    const [plan] = await db
      .insert(plans)
      .values({ ...planData, id })
      .returning();
    return plan;
  }

  async updatePlan(id: string, updates: Partial<Plan>): Promise<Plan | undefined> {
    const [plan] = await db
      .update(plans)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(plans.id, id))
      .returning();
    return plan || undefined;
  }

  async deletePlan(id: string): Promise<boolean> {
    const result = await db.delete(plans).where(eq(plans.id, id));
    return result.rowCount > 0;
  }

  // Announcement operations
  async getAnnouncement(id: string): Promise<Announcement | undefined> {
    const [announcement] = await db.select().from(announcements).where(eq(announcements.id, id));
    return announcement || undefined;
  }

  async getAllAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async getActiveAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements)
      .where(and(
        eq(announcements.isActive, true),
        gt(announcements.expiresAt, new Date())
      ))
      .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));
  }

  async getAnnouncementsForUser(userId: string, userRole: string): Promise<Announcement[]> {
    const currentDate = new Date();
    
    // Get all active announcements (without expiry filter for now)
    const allAnnouncements = await db.select().from(announcements)
      .where(eq(announcements.isActive, true))
      .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));
    
    // Filter announcements based on targeting and expiry
    const filteredAnnouncements = allAnnouncements.filter(announcement => {
      // Check if announcement is expired (if expiresAt is set)
      if (announcement.expiresAt && announcement.expiresAt <= currentDate) {
        return false;
      }
      
      // Check targeting
      switch (announcement.targetUsers) {
        case 'all':
          return true;
          
        case 'specific':
          return announcement.targetUserIds?.includes(userId) || false;
          
        case 'role-based':
          return announcement.targetRoles?.includes(userRole) || false;
          
        default:
          return true; // Default to showing all if not specified
      }
    });
    
    return filteredAnnouncements;
  }

  async createAnnouncement(announcementData: InsertAnnouncement & { createdBy: string }): Promise<Announcement> {
    const id = randomUUID();
    const [announcement] = await db
      .insert(announcements)
      .values({ ...announcementData, id })
      .returning();
    return announcement;
  }

  async updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<Announcement | undefined> {
    const [announcement] = await db
      .update(announcements)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(announcements.id, id))
      .returning();
    return announcement || undefined;
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    // Delete related user_announcements first
    await db.delete(userAnnouncements).where(eq(userAnnouncements.announcementId, id));
    
    const result = await db.delete(announcements).where(eq(announcements.id, id));
    return result.rowCount > 0;
  }

  // User Announcement operations
  async getUserAnnouncement(userId: string, announcementId: string): Promise<UserAnnouncement | undefined> {
    const [userAnnouncement] = await db.select().from(userAnnouncements)
      .where(and(
        eq(userAnnouncements.userId, userId),
        eq(userAnnouncements.announcementId, announcementId)
      ));
    return userAnnouncement || undefined;
  }

  async getUserAnnouncements(userId: string): Promise<UserAnnouncement[]> {
    return await db.select().from(userAnnouncements).where(eq(userAnnouncements.userId, userId));
  }

  async createUserAnnouncement(userAnnouncementData: InsertUserAnnouncement): Promise<UserAnnouncement> {
    const id = randomUUID();
    const [userAnnouncement] = await db
      .insert(userAnnouncements)
      .values({ ...userAnnouncementData, id })
      .returning();
    return userAnnouncement;
  }

  async markAnnouncementAsRead(userId: string, announcementId: string): Promise<boolean> {
    // Try to find existing record first
    const existing = await this.getUserAnnouncement(userId, announcementId);
    
    if (existing) {
      // Update existing record
      const result = await db
        .update(userAnnouncements)
        .set({ isRead: true, readAt: new Date() })
        .where(and(
          eq(userAnnouncements.userId, userId),
          eq(userAnnouncements.announcementId, announcementId)
        ));
      return result.rowCount > 0;
    } else {
      // Create new record
      await this.createUserAnnouncement({
        userId,
        announcementId,
        isRead: true,
        readAt: new Date()
      });
      return true;
    }
  }

  // Plan Activation operations
  async activatePlan(userId: string, planName: string): Promise<User> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    const [user] = await db
      .update(users)
      .set({
        plan: planName,
        planActivatedAt: now,
        planExpiresAt: expiresAt,
        isAccountFrozen: false,
        updatedAt: now
      })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async checkAccountStatus(userId: string): Promise<{ isActive: boolean; shouldFreeze: boolean; message?: string }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return { isActive: false, shouldFreeze: false, message: "User not found" };
    }

    // If account is already frozen
    if (user.isAccountFrozen) {
      return { isActive: false, shouldFreeze: false, message: "Account is frozen" };
    }

    // If user has a paid plan and it's still active
    if (user.plan !== 'free' && user.planExpiresAt && user.planExpiresAt > new Date()) {
      return { isActive: true, shouldFreeze: false };
    }

    // Check if account should be frozen (3 days since registration without plan activation)
    const daysSinceRegistration = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const shouldFreeze = daysSinceRegistration >= 3 && user.plan === 'free';

    if (shouldFreeze) {
      // Freeze the account
      await db
        .update(users)
        .set({ isAccountFrozen: true, updatedAt: new Date() })
        .where(eq(users.id, userId));

      return { isActive: false, shouldFreeze: true, message: "Account has been frozen due to inactivity" };
    }

    // Account is active but may need attention
    const daysUntilFreeze = Math.max(0, 3 - daysSinceRegistration);
    return { 
      isActive: true, 
      shouldFreeze: false, 
      message: daysUntilFreeze > 0 ? `Account will be frozen in ${daysUntilFreeze} days` : undefined
    };
  }
}

export const storage = new DatabaseStorage();
