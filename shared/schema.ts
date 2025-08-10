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
