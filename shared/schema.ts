import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, timestamp, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  apiKey: text("api_key"),
  role: text("role").notNull().default("user"), // user, admin
  isActive: boolean("is_active").default(true),
  plan: text("plan").default("free"), // free, pro, enterprise
  settings: json("settings").$type<{
    defaultModel?: string;
    autoSave?: boolean;
    darkMode?: boolean;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const assistants = pgTable("assistants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  openaiAssistantId: text("openai_assistant_id"),
  name: text("name").notNull(),
  description: text("description"),
  instructions: text("instructions"),
  systemPrompt: text("system_prompt"),
  model: text("model").notNull().default("gpt-4o"),
  temperature: real("temperature").default(0.7),
  tools: json("tools").$type<Array<{ type: string; enabled: boolean }>>().default([]),
  files: json("files").$type<Array<{ id: string; name: string; path: string }>>().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  assistantId: varchar("assistant_id").references(() => assistants.id).notNull(),
  openaiThreadId: text("openai_thread_id"),
  title: text("title"),
  messages: json("messages").$type<Array<{
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: string;
  }>>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const googleDocsDocuments = pgTable("google_docs_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  assistantId: varchar("assistant_id").references(() => assistants.id).notNull(),
  title: varchar("title").notNull(),
  url: varchar("url").notNull(),
  content: text("content"),
  status: varchar("status").notNull().default("completed"), // completed, error
  processedAt: timestamp("processed_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const integrations = pgTable("integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // telegram, vk, whatsapp, openai
  name: text("name").notNull(),
  isActive: boolean("is_active").default(false),
  config: json("config").$type<{
    // Telegram
    botToken?: string;
    botUsername?: string;
    webhookUrl?: string;
    
    // VK
    accessToken?: string;
    groupId?: string;
    confirmationToken?: string;
    
    // WhatsApp
    phoneNumberId?: string;
    verifyToken?: string;
    
    // OpenAI
    apiKey?: string;
    assistantId?: string;
    model?: string;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatLogs = pgTable("chat_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  conversationId: varchar("conversation_id").references(() => conversations.id).notNull(),
  assistantId: varchar("assistant_id").references(() => assistants.id).notNull(),
  sessionId: text("session_id"), // Идентификатор сессии чата
  action: text("action").notNull(), // "message_sent", "message_received", "chat_started", "chat_ended", "pdf_exported"
  messageId: text("message_id"), // ID сообщения если действие связано с сообщением
  messageContent: text("message_content"), // Содержимое сообщения
  messageRole: text("message_role"), // "user" | "assistant" | "system"
  metadata: json("metadata").$type<{
    userAgent?: string;
    ipAddress?: string;
    model?: string;
    temperature?: number;
    tokensUsed?: number;
    responseTime?: number;
    error?: string;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const plans = pgTable("plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  price: real("price").notNull().default(0),
  currency: text("currency").notNull().default("RUB"),
  billingPeriod: text("billing_period").notNull().default("monthly"), // monthly, yearly, lifetime
  features: json("features").$type<{
    maxAssistants?: number;
    maxConversations?: number;
    maxFileUploads?: number;
    maxFileSize?: number; // in MB
    apiAccess?: boolean;
    prioritySupport?: boolean;
    customBranding?: boolean;
    analytics?: boolean;
  }>().default({}),
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),
  sortOrder: real("sort_order").default(0),
  paymentLink: text("payment_link"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull().default("info"), // info, success, warning, error
  priority: text("priority").notNull().default("normal"), // low, normal, high, urgent
  targetUsers: text("target_users").notNull().default("all"), // all, specific, role-based
  targetUserIds: json("target_user_ids").$type<string[]>().default([]),
  targetRoles: json("target_roles").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true),
  isPinned: boolean("is_pinned").default(false),
  expiresAt: timestamp("expires_at"),
  publishedAt: timestamp("published_at"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userAnnouncements = pgTable("user_announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  announcementId: varchar("announcement_id").references(() => announcements.id).notNull(),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Photo Editor схемы
export const photoEditorSessions = pgTable("photo_editor_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title"),
  description: text("description"),
  settings: json("settings").$type<{
    model?: string; // gpt-4o для работы с изображениями
    quality?: string; // standard, hd
    style?: string; // vivid, natural
    size?: string; // 1024x1024, 1792x1024, 1024x1792
    responseFormat?: string; // url, b64_json
  }>().default({
    model: "gpt-4o",
    quality: "standard",
    style: "vivid", 
    size: "1024x1024",
    responseFormat: "url"
  }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const photoEditorImages = pgTable("photo_editor_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => photoEditorSessions.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // original, edited, generated
  url: text("url").notNull(),
  objectPath: text("object_path"), // путь в object storage
  filename: text("filename"),
  mimeType: text("mime_type"),
  size: real("size"), // размер файла в байтах
  width: real("width"),
  height: real("height"),
  prompt: text("prompt"), // промпт для генерации/редактирования
  editInstructions: text("edit_instructions"), // инструкции редактирования
  metadata: json("metadata").$type<{
    aiModel?: string;
    processingTime?: number;
    quality?: string;
    style?: string;
    revisedPrompt?: string; // пересмотренный промпт от AI
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const photoEditorChats = pgTable("photo_editor_chats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => photoEditorSessions.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  messages: json("messages").$type<Array<{
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    imageUrl?: string;
    editedImageUrl?: string;
    timestamp: string;
  }>>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  settings: true,
});

export const loginSchema = z.object({
  email: z.string().email("Неверный формат email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

export const registerSchema = z.object({
  username: z.string().min(2, "Имя пользователя должно содержать минимум 2 символа"),
  email: z.string().email("Неверный формат email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

export const insertAssistantSchema = createInsertSchema(assistants).pick({
  name: true,
  description: true,
  instructions: true,
  systemPrompt: true,
  model: true,
  temperature: true,
  tools: true,
  files: true,
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  assistantId: true,
  title: true,
  messages: true,
});

export const insertGoogleDocsDocumentSchema = createInsertSchema(googleDocsDocuments).pick({
  title: true,
  url: true,
  content: true,
  status: true,
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  token: true,
  expiresAt: true,
});

export const insertIntegrationSchema = createInsertSchema(integrations).pick({
  type: true,
  name: true,
  isActive: true,
  config: true,
});

export const insertChatLogSchema = createInsertSchema(chatLogs).pick({
  conversationId: true,
  assistantId: true,
  sessionId: true,
  action: true,
  messageId: true,
  messageContent: true,
  messageRole: true,
  metadata: true,
});

export const insertPlanSchema = createInsertSchema(plans).pick({
  name: true,
  displayName: true,
  description: true,
  price: true,
  currency: true,
  billingPeriod: true,
  features: true,
  isActive: true,
  isDefault: true,
  sortOrder: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).pick({
  title: true,
  content: true,
  type: true,
  priority: true,
  targetUsers: true,
  targetUserIds: true,
  targetRoles: true,
  isActive: true,
  isPinned: true,
  expiresAt: true,
  publishedAt: true,
});

export const insertUserAnnouncementSchema = createInsertSchema(userAnnouncements).pick({
  userId: true,
  announcementId: true,
  isRead: true,
  readAt: true,
});

// Схемы валидации для AI Photo Editor
export const insertPhotoEditorSessionSchema = createInsertSchema(photoEditorSessions).pick({
  title: true,
  description: true,
  settings: true,
  isActive: true,
});

export const insertPhotoEditorImageSchema = createInsertSchema(photoEditorImages).pick({
  sessionId: true,
  type: true,
  url: true,
  objectPath: true,
  filename: true,
  mimeType: true,
  size: true,
  width: true,
  height: true,
  prompt: true,
  editInstructions: true,
  metadata: true,
});

export const insertPhotoEditorChatSchema = createInsertSchema(photoEditorChats).pick({
  sessionId: true,
  messages: true,
});

export const photoEditorSettingsSchema = z.object({
  model: z.string().default("gpt-4o"),
  quality: z.enum(["standard", "hd"]).default("standard"),
  style: z.enum(["vivid", "natural"]).default("vivid"),
  size: z.enum(["1024x1024", "1792x1024", "1024x1792"]).default("1024x1024"),
  responseFormat: z.enum(["url", "b64_json"]).default("url"),
});

export const photoEditRequestSchema = z.object({
  imageUrl: z.string().url("Некорректный URL изображения"),
  editInstructions: z.string().min(1, "Введите инструкции для редактирования"),
  settings: photoEditorSettingsSchema.optional(),
});

export const imageGenerationRequestSchema = z.object({
  prompt: z.string().min(1, "Введите описание для генерации изображения"),
  settings: photoEditorSettingsSchema.optional(),
});

// Схемы валидации для каждого типа интеграции
export const telegramIntegrationSchema = z.object({
  type: z.literal("telegram"),
  name: z.string().min(1, "Введите название интеграции"),
  config: z.object({
    botToken: z.string().min(1, "Введите токен бота"),
    botUsername: z.string().min(1, "Введите имя пользователя бота"),
    webhookUrl: z.string().url("Введите корректный URL").optional().or(z.literal("")),
  }),
});

export const vkIntegrationSchema = z.object({
  type: z.literal("vk"),
  name: z.string().min(1, "Введите название интеграции"),
  config: z.object({
    accessToken: z.string().min(1, "Введите токен доступа"),
    groupId: z.string().min(1, "Введите ID группы"),
    confirmationToken: z.string().min(1, "Введите токен подтверждения"),
  }),
});

export const whatsappIntegrationSchema = z.object({
  type: z.literal("whatsapp"),
  name: z.string().min(1, "Введите название интеграции"),
  config: z.object({
    phoneNumberId: z.string().min(1, "Введите ID номера телефона"),
    accessToken: z.string().min(1, "Введите токен доступа"),
    verifyToken: z.string().min(1, "Введите токен верификации"),
    webhookUrl: z.string().url("Введите корректный URL").optional().or(z.literal("")),
  }),
});

export const openaiIntegrationSchema = z.object({
  type: z.literal("openai"),
  name: z.string().min(1, "Введите название интеграции"),
  config: z.object({
    apiKey: z.string().min(1, "Введите API ключ OpenAI"),
    assistantId: z.string().min(1, "Введите ID ассистента"),
    model: z.string().default("gpt-4o"),
  }),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type InsertAssistant = z.infer<typeof insertAssistantSchema>;
export type Assistant = typeof assistants.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertGoogleDocsDocument = z.infer<typeof insertGoogleDocsDocumentSchema>;
export type GoogleDocsDocument = typeof googleDocsDocuments.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type Integration = typeof integrations.$inferSelect;
export type TelegramIntegration = z.infer<typeof telegramIntegrationSchema>;
export type VkIntegration = z.infer<typeof vkIntegrationSchema>;
export type WhatsappIntegration = z.infer<typeof whatsappIntegrationSchema>;
export type OpenaiIntegration = z.infer<typeof openaiIntegrationSchema>;
export type InsertChatLog = z.infer<typeof insertChatLogSchema>;
export type ChatLog = typeof chatLogs.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = typeof plans.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertUserAnnouncement = z.infer<typeof insertUserAnnouncementSchema>;
export type UserAnnouncement = typeof userAnnouncements.$inferSelect;

// AI Photo Editor типы
export type PhotoEditorSession = typeof photoEditorSessions.$inferSelect;
export type InsertPhotoEditorSession = z.infer<typeof insertPhotoEditorSessionSchema>;
export type PhotoEditorImage = typeof photoEditorImages.$inferSelect;
export type InsertPhotoEditorImage = z.infer<typeof insertPhotoEditorImageSchema>;
export type PhotoEditorChat = typeof photoEditorChats.$inferSelect;
export type InsertPhotoEditorChat = z.infer<typeof insertPhotoEditorChatSchema>;
export type PhotoEditorSettings = z.infer<typeof photoEditorSettingsSchema>;
export type PhotoEditRequest = z.infer<typeof photoEditRequestSchema>;
export type ImageGenerationRequest = z.infer<typeof imageGenerationRequestSchema>;
