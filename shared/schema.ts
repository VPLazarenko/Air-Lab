import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, timestamp, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  apiKey: text("api_key"),
  settings: json("settings").$type<{
    defaultModel?: string;
    autoSave?: boolean;
    darkMode?: boolean;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const assistants = pgTable("assistants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  openaiAssistantId: text("openai_assistant_id"),
  vectorStoreId: text("vector_store_id"),
  name: text("name").notNull(),
  description: text("description"),
  instructions: text("instructions"),
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

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  settings: true,
});

export const insertAssistantSchema = createInsertSchema(assistants).pick({
  name: true,
  description: true,
  instructions: true,
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAssistant = z.infer<typeof insertAssistantSchema>;
export type Assistant = typeof assistants.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
