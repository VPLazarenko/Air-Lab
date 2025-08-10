import { openaiService } from "./openai";
import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import type { InsertAssistant, InsertUser } from "@shared/schema";

// Demo data for initialization
const DEMO_USER_ID = "84ac8242-6c19-42a0-825b-caa01572e5e6";

const DEMO_USER: InsertUser = {
  username: "demo",
  email: "demo@example.com",
  settings: {},
};

const DEMO_ASSISTANTS = [
  {
    name: "Документация",
    instructions: "Ты — помощник по работе с документацией. Ты имеешь доступ к документам Google Docs через API системы. Когда пользователь задает вопросы о документах, используй их содержимое для ответов. Ты можешь помочь найти информацию в документах, ответить на вопросы по содержанию и объяснить сложные концепции простым языком. Всегда отвечай на русском языке. Если нужна информация из документов, она будет автоматически предоставлена в контексте беседы.",
    tools: [{ type: 'file_search', enabled: true }],
    userId: DEMO_USER_ID,
  },
  {
    name: "Чат-ассистент", 
    instructions: "Ты - дружелюбный помощник для общения. Отвечай полезно и вежливо на все вопросы пользователей.",
    tools: [],
    userId: DEMO_USER_ID,
  },
];

/**
 * Initialize database with demo data if empty
 */
export async function initializeDatabase() {
  try {
    console.log("🔄 Инициализация базы данных...");

    // Check if demo user exists
    let existingUser = await storage.getUser(DEMO_USER_ID);
    if (!existingUser) {
      // Also check by email to avoid duplicates
      existingUser = await storage.getUserByEmail(DEMO_USER.email);
      if (!existingUser) {
        console.log("📝 Создание демо-пользователя...");
        await storage.createUser(DEMO_USER);
      } else {
        console.log("📝 Демо-пользователь уже существует (по email)");
      }
    } else {
      console.log("📝 Демо-пользователь уже существует");
    }

    // Check existing assistants
    const existingAssistants = await storage.getAssistantsByUserId(DEMO_USER_ID);
    console.log(`📊 Найдено ассистентов: ${existingAssistants.length}`);

    // Create missing demo assistants
    for (const assistantData of DEMO_ASSISTANTS) {
      const existingAssistant = existingAssistants.find(a => a.name === assistantData.name);
      
      if (!existingAssistant) {
        console.log(`➕ Создание ассистента: ${assistantData.name}`);
        
        try {
          // Set API key first
          const apiKey = process.env.OPENAI_API_KEY;
          if (!apiKey) {
            throw new Error("OpenAI API key not configured");
          }
          openaiService.setApiKey(apiKey);

          // Create assistant in OpenAI with file search capability
          const openaiAssistant = await openaiService.createAssistant({
            name: assistantData.name,
            instructions: assistantData.instructions || "",
            tools: assistantData.tools.map(tool => ({ type: 'file_search' })),
          });

          // Save to database
          await storage.createAssistant({
            name: assistantData.name,
            instructions: assistantData.instructions,
            tools: assistantData.tools,
            userId: assistantData.userId,
            openaiAssistantId: openaiAssistant.id,
          });

          console.log(`✅ Ассистент "${assistantData.name}" создан успешно`);
        } catch (error) {
          console.error(`❌ Ошибка создания ассистента "${assistantData.name}":`, error);
        }
      } else {
        console.log(`✓ Ассистент "${assistantData.name}" уже существует`);
        
        // Verify OpenAI assistant still exists
        if (existingAssistant.openaiAssistantId) {
          try {
            // Try to retrieve assistant to verify it exists
            const assistants = await openaiService.listAssistants();
            const foundAssistant = assistants.find(a => a.id === existingAssistant.openaiAssistantId);
            if (!foundAssistant) {
              throw new Error('Assistant not found');
            }
            console.log(`✓ OpenAI ассистент ${existingAssistant.openaiAssistantId} подтвержден`);
          } catch (error) {
            console.log(`⚠️ OpenAI ассистент ${existingAssistant.openaiAssistantId} не найден, восстанавливаем...`);
            
            try {
              // Set API key first
              const apiKey = process.env.OPENAI_API_KEY;
              if (!apiKey) {
                throw new Error("OpenAI API key not configured");
              }
              openaiService.setApiKey(apiKey);

              // Recreate OpenAI assistant
              const newOpenaiAssistant = await openaiService.createAssistant({
                name: existingAssistant.name,
                instructions: existingAssistant.instructions || "",
                tools: (existingAssistant.tools || []).map(() => ({ type: 'file_search' })),
              });

              // Update database
              await storage.updateAssistant(existingAssistant.id, {
                openaiAssistantId: newOpenaiAssistant.id,
              });

              console.log(`✅ OpenAI ассистент восстановлен: ${newOpenaiAssistant.id}`);
            } catch (recreateError) {
              console.error(`❌ Ошибка восстановления ассистента:`, recreateError);
            }
          }
        }
      }
    }

    // Check Google Drive documents
    const allGoogleDocs = await storage.getGoogleDocsDocumentsByUserId(DEMO_USER_ID);
    console.log(`📄 Найдено Google Docs: ${allGoogleDocs.length}`);
    
    // Create or update admin account for Windows version
    const adminUser = await db.select().from(users).where(eq(users.username, "Admin")).limit(1);
    if (adminUser.length === 0) {
      const hashedPassword = await bcrypt.hash("admin", 10);
      await db.insert(users).values({
        username: "Admin",
        email: "admin@airlab.local",
        password: hashedPassword,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log("🔐 Админский аккаунт создан (Admin/admin)");
    }

    console.log("✅ Инициализация базы данных завершена");
    
    return {
      user: existingUser || DEMO_USER,
      assistantsCount: (await storage.getAssistantsByUserId(DEMO_USER_ID)).length,
      googleDocsCount: allGoogleDocs.length,
    };

  } catch (error) {
    console.error("❌ Ошибка инициализации базы данных:", error);
    throw error;
  }
}

/**
 * Ensure critical data is preserved and restored if missing
 */
export async function ensureDataIntegrity() {
  try {
    const assistants = await storage.getAssistantsByUserId(DEMO_USER_ID);
    
    for (const assistant of assistants) {
      if (!assistant.openaiAssistantId) {
        console.log(`⚠️ Ассистент ${assistant.name} без OpenAI ID, восстанавливаем...`);
        
        try {
          // Set API key first
          const apiKey = process.env.OPENAI_API_KEY;
          if (!apiKey) {
            throw new Error("OpenAI API key not configured");
          }
          openaiService.setApiKey(apiKey);

          const openaiAssistant = await openaiService.createAssistant({
            name: assistant.name,
            instructions: assistant.instructions || "",
            tools: (assistant.tools || []).map(() => ({ type: 'file_search' })),
          });

          await storage.updateAssistant(assistant.id, {
            openaiAssistantId: openaiAssistant.id,
          });

          console.log(`✅ OpenAI ID восстановлен для ${assistant.name}: ${openaiAssistant.id}`);
        } catch (error) {
          console.error(`❌ Ошибка восстановления OpenAI ID для ${assistant.name}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("❌ Ошибка проверки целостности данных:", error);
  }
}