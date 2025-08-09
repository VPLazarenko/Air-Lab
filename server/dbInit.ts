import { openaiService } from "./openai";
import { storage } from "./storage";
import type { InsertAssistant, InsertUser } from "@shared/schema";

// Demo data for initialization
const DEMO_USER_ID = "demo-user-123";

const DEMO_USER: InsertUser = {
  username: "demo",
  email: "demo@example.com",
  settings: {},
};

const DEMO_ASSISTANTS = [
  {
    name: "Документация",
    instructions: "Ты - помощник по работе с документацией. Ты помогаешь пользователям находить информацию в документах и отвечать на вопросы по содержанию.",
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
    const existingUser = await storage.getUser(DEMO_USER_ID);
    if (!existingUser) {
      console.log("📝 Создание демо-пользователя...");
      await storage.createUser(DEMO_USER);
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
          // Create assistant in OpenAI first
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
            openaiId: openaiAssistant.id,
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
            await openaiService.getAssistantById(existingAssistant.openaiAssistantId);
            console.log(`✓ OpenAI ассистент ${existingAssistant.openaiAssistantId} подтвержден`);
          } catch (error) {
            console.log(`⚠️ OpenAI ассистент ${existingAssistant.openaiAssistantId} не найден, восстанавливаем...`);
            
            try {
              // Recreate OpenAI assistant
              const newOpenaiAssistant = await openaiService.createAssistant({
                name: existingAssistant.name,
                instructions: existingAssistant.instructions || "",
                tools: (existingAssistant.tools || []).map(() => ({ type: 'file_search' })),
              });

              // Update database
              await storage.updateAssistant(existingAssistant.id, {
                openaiId: newOpenaiAssistant.id,
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
          const openaiAssistant = await openaiService.createAssistant({
            name: assistant.name,
            instructions: assistant.instructions || "",
            tools: (assistant.tools || []).map(() => ({ type: 'file_search' })),
          });

          await storage.updateAssistant(assistant.id, {
            openaiId: openaiAssistant.id,
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