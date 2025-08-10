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
