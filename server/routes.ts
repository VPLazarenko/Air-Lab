import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openaiService } from "./openai";
import { ObjectStorageService } from "./objectStorage";
import { GoogleDocsService } from "./googleDocs";
import { AuthService } from "./auth";
import { insertUserSchema, insertAssistantSchema, insertConversationSchema, insertGoogleDocsDocumentSchema, loginSchema, registerSchema, telegramIntegrationSchema, vkIntegrationSchema, whatsappIntegrationSchema, openaiIntegrationSchema, insertChatLogSchema, insertPlanSchema, insertAnnouncementSchema } from "@shared/schema";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

// Authentication middleware
interface AuthenticatedRequest extends Request {
  user?: any;
}

const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Токен авторизации не предоставлен' });
  }

  try {
    const user = await AuthService.authenticate(token);
    if (!user) {
      return res.status(401).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Ошибка авторизации' });
  }
};

const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Требуются права администратора' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      const result = await AuthService.register(data);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Ошибка регистрации' });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const result = await AuthService.login(data);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Ошибка входа' });
    }
  });

  app.post("/api/auth/logout", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        await AuthService.logout(token);
      }
      res.json({ message: 'Выход выполнен успешно' });
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при выходе' });
    }
  });

  app.get("/api/auth/me", authenticateUser, async (req: AuthenticatedRequest, res) => {
    res.json(req.user);
  });

  // Admin routes
  app.get("/api/admin/users", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Ошибка получения пользователей' });
    }
  });

  app.put("/api/admin/users/:id", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Don't allow password updates through this endpoint
      delete updates.password;
      
      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Ошибка обновления пользователя' });
    }
  });

  // User routes (protected)
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Assistant routes (protected)
  app.post("/api/assistants", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const assistantData = insertAssistantSchema.parse(req.body);

      // Use OpenAI API key from environment
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "OpenAI API key not configured on server" });
      }

      // Create assistant with OpenAI
      openaiService.setApiKey(apiKey);

      const openaiAssistant = await openaiService.createAssistant({
        name: assistantData.name,
        description: assistantData.description || undefined,
        instructions: assistantData.instructions || "",
        systemPrompt: assistantData.systemPrompt || undefined,
        model: assistantData.model,
        tools: (assistantData.tools || []).filter((t: any) => t.enabled && (t.type === "code_interpreter" || t.type === "file_search")).map((t: any) => ({ type: t.type as "code_interpreter" | "file_search" })),
      });

      // Save to local storage with OpenAI ID and current user ID
      const assistant = await storage.createAssistant({
        ...assistantData,
        userId: req.user.id,
        openaiAssistantId: openaiAssistant.id,
      });

      res.json(assistant);
    } catch (error) {
      console.error("Error creating assistant:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/assistants/user/:userId", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      // Users can only see their own assistants, admins can see any
      const userId = req.params.userId;
      if (req.user.role !== 'admin' && req.user.id !== userId) {
        return res.status(403).json({ error: 'Доступ запрещен' });
      }
      
      const assistants = await storage.getAssistantsByUserId(userId);
      res.json(assistants);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/assistants/my", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const assistants = await storage.getAssistantsByUserId(req.user.id);
      res.json(assistants);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/assistants/:id", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const assistant = await storage.getAssistant(req.params.id);
      if (!assistant) {
        return res.status(404).json({ error: "Ассистент не найден" });
      }
      
      // Check if user has access to this assistant
      if (req.user.role !== 'admin' && assistant.userId !== req.user.id) {
        return res.status(403).json({ error: 'Доступ запрещен' });
      }
      
      // Sync files from OpenAI if assistant exists there
      if (assistant.openaiAssistantId) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (apiKey) {
          try {
            openaiService.setApiKey(apiKey);
            const openaiAssistant = await openaiService.getAssistant(assistant.openaiAssistantId);
            
            // Get list of files from OpenAI vector stores
            const files = await openaiService.getAssistantFiles(assistant.openaiAssistantId);
            console.log(`Assistant ${assistant.openaiAssistantId} has ${files.length} files in OpenAI`);
            
            // Return assistant with file info
            res.json({
              ...assistant,
              openaiFileIds: files.map((f: any) => f.file_id || f.id),
              openaiFileCount: files.length
            });
            return;
          } catch (syncError) {
            console.error("Error syncing with OpenAI:", syncError);
            // Continue with local data if sync fails
          }
        }
      }
      
      res.json(assistant);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.put("/api/assistants/:id", async (req, res) => {
    try {
      const assistant = await storage.getAssistant(req.params.id);
      if (!assistant) {
        return res.status(404).json({ error: "Assistant not found" });
      }

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "OpenAI API key not configured on server" });
      }

      const updates = req.body;

      // Update with OpenAI if assistant exists there
      if (assistant.openaiAssistantId) {
        openaiService.setApiKey(apiKey);
        await openaiService.updateAssistant(assistant.openaiAssistantId, {
          name: updates.name,
          description: updates.description,
          instructions: updates.instructions,
          systemPrompt: updates.systemPrompt,
          model: updates.model,
          tools: (updates.tools || []).filter((t: any) => t.enabled && (t.type === "code_interpreter" || t.type === "file_search")).map((t: any) => ({ type: t.type as "code_interpreter" | "file_search" })),
        });
      }

      // Update local storage
      const updatedAssistant = await storage.updateAssistant(req.params.id, updates);
      res.json(updatedAssistant);
    } catch (error) {
      console.error("Error updating assistant:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Sync assistant files with OpenAI
  app.post("/api/assistants/:id/sync-files", async (req, res) => {
    try {
      const assistant = await storage.getAssistant(req.params.id);
      if (!assistant) {
        return res.status(404).json({ error: "Assistant not found" });
      }

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "OpenAI API key not configured" });
      }

      if (!assistant.openaiAssistantId) {
        return res.status(400).json({ error: "Assistant not connected to OpenAI" });
      }

      openaiService.setApiKey(apiKey);
      
      // Get current assistant state from OpenAI
      const openaiAssistant = await openaiService.getAssistant(assistant.openaiAssistantId);
      
      // Get all Google Docs for this assistant
      const googleDocs = await storage.getGoogleDocsDocumentsByAssistantId(assistant.id);
      const completedDocs = googleDocs.filter(doc => doc.status === 'completed' && doc.content);
      
      // Upload completed docs as files to OpenAI and attach to assistant
      let uploadedCount = 0;
      const fileIds = [];
      
      for (const doc of completedDocs) {
        if (doc.content) {
          try {
            // Check if this document was already uploaded
            const fileName = `${doc.title}.txt`;
            const buffer = Buffer.from(doc.content, 'utf8');
            
            // Upload file to OpenAI
            const openaiFile = await openaiService.uploadFile(buffer, fileName, 'assistants');
            fileIds.push(openaiFile.id);
            
            uploadedCount++;
            console.log(`Uploaded file: ${fileName} (${openaiFile.id})`);
          } catch (uploadError) {
            console.error(`Failed to upload document ${doc.title}:`, uploadError);
          }
        }
      }
      
      // Attach all files to assistant at once
      if (fileIds.length > 0) {
        for (const fileId of fileIds) {
          await openaiService.attachVectorStoreToAssistant(assistant.openaiAssistantId, fileId);
        }
      }
      
      console.log(`Synced ${uploadedCount} files to assistant ${assistant.openaiAssistantId}`);
      
      res.json({
        success: true,
        filesCount: fileIds.length,
        fileIds: fileIds,
        message: `Assistant synced with ${fileIds.length} files`
      });
      
    } catch (error) {
      console.error("Error syncing assistant files:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.delete("/api/assistants/:id", async (req, res) => {
    try {
      const assistant = await storage.getAssistant(req.params.id);
      if (!assistant) {
        return res.status(404).json({ error: "Assistant not found" });
      }

      const apiKey = process.env.OPENAI_API_KEY;
      
      // Delete from OpenAI if it exists there
      if (assistant.openaiAssistantId && apiKey) {
        openaiService.setApiKey(apiKey);
        await openaiService.deleteAssistant(assistant.openaiAssistantId);
      }

      // Delete from local storage
      const deleted = await storage.deleteAssistant(req.params.id);
      res.json({ success: deleted });
    } catch (error) {
      console.error("Error deleting assistant:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Chat/conversation routes
  app.post("/api/conversations", async (req, res) => {
    try {
      const conversationData = insertConversationSchema.extend({
        userId: z.string()
      }).parse(req.body);

      const conversation = await storage.createConversation(conversationData);
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }
      
      console.log("Processing message:", message, "for conversation:", req.params.id);

      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const assistant = await storage.getAssistant(conversation.assistantId);
      if (!assistant) {
        return res.status(404).json({ error: "Assistant not found" });
      }

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "OpenAI API key not configured on server" });
      }

      openaiService.setApiKey(apiKey);

      // Create thread if doesn't exist
      let threadId = conversation.openaiThreadId;
      console.log("Current threadId:", threadId);
      
      if (!threadId) {
        console.log("Creating new thread...");
        
        const thread = await openaiService.createThread();
        threadId = thread.id;
        console.log("Created thread with ID:", threadId);
        
        // Add Google Docs context to thread
        const googleDocs = await storage.getGoogleDocsDocumentsByAssistantId(assistant.id);
        const completedDocs = googleDocs.filter(doc => doc.status === 'completed' && doc.content);
        
        console.log(`Found ${completedDocs.length} Google Docs to add as context`);
        
        for (const doc of completedDocs) {
          if (doc.content) {
            await openaiService.addGoogleDocContext(threadId, doc.content, doc.title);
            console.log(`Added context for: ${doc.title}`);
          }
        }
        
        await storage.updateConversation(req.params.id, { openaiThreadId: threadId });
      }

      // Send message and get response
      console.log("Sending message to thread:", threadId);
      await openaiService.sendMessage(threadId, message);
      
      let response;
      if (assistant.openaiAssistantId) {
        console.log("Running assistant:", assistant.openaiAssistantId, "on thread:", threadId);
        response = await openaiService.runAssistant(threadId, assistant.openaiAssistantId);
      } else {
        // Fallback to chat completion
        const messages = [
          { role: "system", content: assistant.instructions || "You are a helpful assistant." },
          { role: "user", content: message }
        ];
        const content = await openaiService.chatCompletion(messages, assistant.model, assistant.temperature ?? 0.7);
        response = { content: [{ text: { value: content } }] };
      }

      // Update conversation with new messages
      const userMessage = {
        id: `msg_${Date.now()}_user`,
        role: "user" as const,
        content: message,
        timestamp: new Date().toISOString(),
      };

      const assistantMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: "assistant" as const,
        content: (response as any)?.content?.[0]?.text?.value || "I apologize, but I couldn't generate a response.",
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...(conversation.messages || []), userMessage, assistantMessage];
      await storage.updateConversation(req.params.id, { messages: updatedMessages });

      // Create chat logs
      const sessionId = `session_${Date.now()}`;
      const userAgent = req.headers['user-agent'] || '';
      const ipAddress = req.ip || req.socket.remoteAddress || '';

      try {
        // Log user message
        await storage.createChatLog({
          userId: conversation.userId,
          conversationId: req.params.id,
          assistantId: conversation.assistantId,
          sessionId,
          action: 'message_sent',
          messageId: userMessage.id,
          messageContent: userMessage.content,
          messageRole: 'user',
          metadata: {
            userAgent,
            ipAddress,
            model: assistant.model,
            temperature: assistant.temperature
          }
        });

        // Log assistant response
        await storage.createChatLog({
          userId: conversation.userId,
          conversationId: req.params.id,
          assistantId: conversation.assistantId,
          sessionId,
          action: 'message_received',
          messageId: assistantMessage.id,
          messageContent: assistantMessage.content,
          messageRole: 'assistant',
          metadata: {
            userAgent,
            ipAddress,
            model: assistant.model,
            temperature: assistant.temperature
          }
        });
      } catch (logError) {
        console.error("Error creating chat logs:", logError);
        // Continue without failing the request
      }

      res.json({ userMessage, assistantMessage });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/conversations/user/:userId", async (req, res) => {
    try {
      const conversations = await storage.getConversationsByUserId(req.params.userId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // File upload routes
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(404).json({ error: "File not found" });
    }
  });

  // Upload file to assistant's knowledge base
  app.post("/api/assistants/:assistantId/files", async (req, res) => {
    try {
      const { assistantId } = req.params;
      const { fileUrl, fileName } = req.body;

      if (!fileUrl || !fileName) {
        return res.status(400).json({ error: "File URL and name are required" });
      }

      // Get assistant
      const assistant = await storage.getAssistant(assistantId);
      if (!assistant) {
        return res.status(404).json({ error: "Assistant not found" });
      }

      // Use OpenAI API key from environment
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "OpenAI API key not configured on server" });
      }

      openaiService.setApiKey(apiKey);

      // Download file from storage
      const objectStorageService = new ObjectStorageService();
      const fileResponse = await fetch(fileUrl);
      if (!fileResponse.ok) {
        throw new Error("Failed to download file from storage");
      }
      
      const fileBuffer = Buffer.from(await fileResponse.arrayBuffer());

      // Upload to OpenAI (files will be used directly in conversations)
      console.log(`Uploading file ${fileName} to OpenAI...`);
      const openaiFile = await openaiService.uploadFile(fileBuffer, fileName);
      console.log(`File uploaded to OpenAI with ID: ${openaiFile.id}`);

      // Attach file to assistant if it has OpenAI ID
      if (assistant.openaiAssistantId) {
        try {
          const currentAssistant = await openaiService.getAssistant(assistant.openaiAssistantId);
          
          // Attach file directly to assistant using tool_resources
          await openaiService.attachVectorStoreToAssistant(assistant.openaiAssistantId, openaiFile.id);
          
          console.log(`File ${openaiFile.id} attached to assistant ${assistant.openaiAssistantId}`);
        } catch (attachError) {
          console.error("Error attaching file to assistant:", attachError);
          // Continue even if attachment fails - file is still uploaded
        }
      }

      res.json({ 
        success: true, 
        fileId: openaiFile.id,
        message: "File uploaded successfully and attached to assistant" 
      });

    } catch (error) {
      console.error("Error uploading file to assistant:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Export assistant configuration
  app.get("/api/assistants/:id/export", async (req, res) => {
    try {
      const assistant = await storage.getAssistant(req.params.id);
      if (!assistant) {
        return res.status(404).json({ error: "Assistant not found" });
      }

      const exportData = {
        name: assistant.name,
        description: assistant.description,
        instructions: assistant.instructions,
        model: assistant.model,
        temperature: assistant.temperature,
        tools: assistant.tools,
        exportedAt: new Date().toISOString(),
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${assistant.name}-config.json"`);
      res.json(exportData);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Google Docs integration routes
  const googleDocsService = new GoogleDocsService();

  // Add Google Docs document to assistant knowledge base
  app.post("/api/assistants/:assistantId/google-drive", async (req, res) => {
    try {
      const assistantId = req.params.assistantId;
      const { userId, documentUrl } = req.body;
      
      if (!documentUrl) {
        return res.status(400).json({ error: "Document URL is required" });
      }

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      // Validate assistant exists
      const assistant = await storage.getAssistant(assistantId);
      if (!assistant) {
        return res.status(404).json({ error: "Assistant not found" });
      }

      // Extract document ID from Google Docs URL
      const docId = googleDocsService.extractDocIdFromUrl(documentUrl);
      if (!docId) {
        return res.status(400).json({ error: "Invalid Google Docs URL. Please provide a valid Google Docs link." });
      }

      // Check document access and get info
      const docInfo = await googleDocsService.getDocInfo(docId);
      if (!docInfo) {
        return res.status(404).json({ error: "Document not found or not accessible. Please make sure the document is public or shared with you." });
      }

      // Create document record in database
      const documentRecord = await storage.createGoogleDocsDocument({
        title: docInfo.title,
        url: documentUrl,
        content: null,
        status: "processing",
        userId,
        assistantId
      });

      // Process document in background
      processGoogleDocsDocument(documentRecord.id, assistant, googleDocsService);

      res.json({
        success: true,
        documentId: documentRecord.id,
        title: docInfo.title,
        message: "Document added to processing queue"
      });

    } catch (error) {
      console.error("Error adding Google Docs document:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get Google Docs documents for assistant
  app.get("/api/assistants/:assistantId/google-drive", async (req, res) => {
    try {
      const documents = await storage.getGoogleDocsDocumentsByAssistantId(req.params.assistantId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/assistants/:assistantId/update-files", async (req, res) => {
    try {
      const assistantId = req.params.assistantId;
      const assistant = await storage.getAssistant(assistantId);
      if (!assistant) {
        return res.status(404).json({ error: "Assistant not found" });
      }

      // Get all processed Google Docs files
      const processedDocs = await storage.getGoogleDocsDocumentsByAssistantId(assistantId);
      const completedDocs = processedDocs.filter(doc => doc.status === 'completed' && doc.content);

      res.json({ 
        message: "Google Docs content will be automatically added to conversations", 
        documentCount: completedDocs.length,
        documents: completedDocs.map(doc => ({ id: doc.id, title: doc.title, status: doc.status }))
      });
    } catch (error) {
      console.error("Error updating assistant files:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Delete Google Docs document
  app.delete("/api/google-drive/:documentId", async (req, res) => {
    try {
      const success = await storage.deleteGoogleDocsDocument(req.params.documentId);
      if (!success) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json({ success: true, message: "Document removed" });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Background processing function
  async function processGoogleDocsDocument(documentId: string, assistant: any, docsService: GoogleDocsService) {
    try {
      const document = await storage.getGoogleDocsDocument(documentId);
      if (!document) return;

      // Update status to processing
      await storage.updateGoogleDocsDocument(documentId, { status: "processing" });

      // Extract docId from URL
      const docId = docsService.extractDocIdFromUrl(document.url);
      if (!docId) {
        await storage.updateGoogleDocsDocument(documentId, { 
          status: "error",
          errorMessage: "Invalid document URL"
        });
        return;
      }

      // Get document content
      const content = await docsService.getDocumentContent(docId);
      if (!content) {
        await storage.updateGoogleDocsDocument(documentId, { 
          status: "error",
          errorMessage: "Could not extract content from document. Make sure the document is publicly accessible."
        });
        return;
      }

      // Update document with content
      await storage.updateGoogleDocsDocument(documentId, { content });

      // Upload to OpenAI as a file
      const apiKey = process.env.OPENAI_API_KEY;
      if (apiKey && assistant.openaiAssistantId) {
        openaiService.setApiKey(apiKey);
        
        // Create temporary file from content
        const buffer = Buffer.from(content, 'utf8');
        const fileName = `${document.title}.txt`;
        
        try {
          const openaiFile = await openaiService.uploadFile(buffer, fileName, 'assistants');
          
          // Attach file directly to assistant using tool_resources
          await openaiService.attachVectorStoreToAssistant(assistant.openaiAssistantId, openaiFile.id);
          
          // Update document record - file content will be used directly in conversations
          await storage.updateGoogleDocsDocument(documentId, { 
            status: "completed",
            processedAt: new Date()
          });
          
          console.log(`Successfully processed and attached Google Docs document: ${document.title} to assistant`);
        } catch (openaiError) {
          console.error("Error uploading to OpenAI:", openaiError);
          await storage.updateGoogleDocsDocument(documentId, { 
            status: "error",
            errorMessage: `Failed to upload to OpenAI: ${openaiError instanceof Error ? openaiError.message : 'Unknown error'}`
          });
        }
      } else {
        await storage.updateGoogleDocsDocument(documentId, { 
          status: "completed",
          processedAt: new Date()
        });
      }

    } catch (error) {
      console.error(`Error processing Google Docs document ${documentId}:`, error);
      await storage.updateGoogleDocsDocument(documentId, { 
        status: "error",
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Integration routes (protected)
  app.get("/api/integrations", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const integrations = await storage.getIntegrationsByUserId(req.user.id);
      res.json(integrations);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Ошибка получения интеграций' });
    }
  });

  app.post("/api/integrations/telegram", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const data = telegramIntegrationSchema.parse(req.body);
      const integration = await storage.createIntegration({
        ...data,
        userId: req.user.id,
        isActive: true,
      });
      res.json(integration);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Ошибка создания интеграции Telegram' });
    }
  });

  app.post("/api/integrations/vk", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const data = vkIntegrationSchema.parse(req.body);
      const integration = await storage.createIntegration({
        ...data,
        userId: req.user.id,
        isActive: true,
      });
      res.json(integration);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Ошибка создания интеграции VK' });
    }
  });

  app.post("/api/integrations/whatsapp", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const data = whatsappIntegrationSchema.parse(req.body);
      const integration = await storage.createIntegration({
        ...data,
        userId: req.user.id,
        isActive: true,
      });
      res.json(integration);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Ошибка создания интеграции WhatsApp' });
    }
  });

  app.post("/api/integrations/openai", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const data = openaiIntegrationSchema.parse(req.body);
      const integration = await storage.createIntegration({
        ...data,
        userId: req.user.id,
        isActive: true,
      });
      res.json(integration);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Ошибка создания интеграции OpenAI' });
    }
  });

  app.put("/api/integrations/:id", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Check if user owns this integration
      const integration = await storage.getIntegration(id);
      if (!integration || integration.userId !== req.user.id) {
        return res.status(404).json({ error: "Интеграция не найдена" });
      }
      
      const updatedIntegration = await storage.updateIntegration(id, updates);
      res.json(updatedIntegration);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Ошибка обновления интеграции' });
    }
  });

  app.delete("/api/integrations/:id", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      
      // Check if user owns this integration
      const integration = await storage.getIntegration(id);
      if (!integration || integration.userId !== req.user.id) {
        return res.status(404).json({ error: "Интеграция не найдена" });
      }
      
      await storage.deleteIntegration(id);
      res.json({ message: "Интеграция удалена" });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Ошибка удаления интеграции' });
    }
  });

  // Chat logs routes
  app.get("/api/chat-logs/user/:userId", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { userId } = req.params;
      
      // Check if user can access these logs
      if (req.user.role !== 'admin' && req.user.id !== userId) {
        return res.status(403).json({ error: "Доступ запрещен" });
      }
      
      const logs = await storage.getChatLogsByUserId(userId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Ошибка получения логов чата' });
    }
  });

  app.get("/api/chat-logs/conversation/:conversationId", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { conversationId } = req.params;
      
      // Check if user owns this conversation
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Разговор не найден" });
      }
      
      if (req.user.role !== 'admin' && req.user.id !== conversation.userId) {
        return res.status(403).json({ error: "Доступ запрещен" });
      }
      
      const logs = await storage.getChatLogsByConversationId(conversationId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Ошибка получения логов разговора' });
    }
  });

  app.post("/api/chat-logs", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const logData = insertChatLogSchema.extend({
        userId: z.string()
      }).parse({
        ...req.body,
        userId: req.user.id
      });
      
      const log = await storage.createChatLog(logData);
      res.json(log);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Ошибка создания лога чата' });
    }
  });

  // Plans routes
  app.get("/api/plans", async (req, res) => {
    try {
      const plans = await storage.getActivePlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Ошибка получения планов' });
    }
  });

  app.get("/api/admin/plans", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const plans = await storage.getAllPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Ошибка получения всех планов' });
    }
  });

  app.post("/api/admin/plans", authenticateUser, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const planData = insertPlanSchema.parse(req.body);
      const plan = await storage.createPlan(planData);
      res.json(plan);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Ошибка создания плана' });
    }
  });

  app.put("/api/admin/plans/:id", authenticateUser, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const plan = await storage.updatePlan(id, updates);
      if (!plan) {
        return res.status(404).json({ error: "План не найден" });
      }
      res.json(plan);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Ошибка обновления плана' });
    }
  });

  app.delete("/api/admin/plans/:id", authenticateUser, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deletePlan(id);
      if (!success) {
        return res.status(404).json({ error: "План не найден" });
      }
      res.json({ message: "План удален" });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Ошибка удаления плана' });
    }
  });

  // Announcements routes
  app.get("/api/announcements", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const announcements = await storage.getAnnouncementsForUser(req.user.id, req.user.role);
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Ошибка получения объявлений' });
    }
  });

  app.get("/api/admin/announcements", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const announcements = await storage.getAllAnnouncements();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Ошибка получения всех объявлений' });
    }
  });

  app.post("/api/admin/announcements", authenticateUser, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const announcementData = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement({
        ...announcementData,
        createdBy: req.user.id
      });
      res.json(announcement);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Ошибка создания объявления' });
    }
  });

  app.put("/api/admin/announcements/:id", authenticateUser, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const announcement = await storage.updateAnnouncement(id, updates);
      if (!announcement) {
        return res.status(404).json({ error: "Объявление не найдено" });
      }
      res.json(announcement);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Ошибка обновления объявления' });
    }
  });

  app.delete("/api/admin/announcements/:id", authenticateUser, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteAnnouncement(id);
      if (!success) {
        return res.status(404).json({ error: "Объявление не найдено" });
      }
      res.json({ message: "Объявление удалено" });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Ошибка удаления объявления' });
    }
  });

  app.post("/api/announcements/:id/read", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const success = await storage.markAnnouncementAsRead(req.user.id, id);
      res.json({ success });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Ошибка отметки объявления как прочитанного' });
    }
  });

  // AI Photo Editor routes
  const { photoEditorService } = await import("./photoEditor");
  const { photoEditorSettingsSchema, photoEditRequestSchema, imageGenerationRequestSchema } = await import("@shared/schema");

  // Get photo editor sessions for user
  app.get("/api/photo-editor/sessions", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const sessions = await storage.getPhotoEditorSessionsByUserId(req.user.id);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Ошибка получения сессий фоторедактора' });
    }
  });

  // Create new photo editor session
  app.post("/api/photo-editor/sessions", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { title, description, settings } = req.body;
      const session = await storage.createPhotoEditorSession({
        title: title || "Новая сессия редактирования",
        description,
        settings: settings || {
          model: "gpt-4o",
          quality: "standard",
          style: "vivid",
          size: "1024x1024",
          responseFormat: "url"
        },
        userId: req.user.id
      });
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Ошибка создания сессии фоторедактора' });
    }
  });

  // Get specific session
  app.get("/api/photo-editor/sessions/:sessionId", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const session = await storage.getPhotoEditorSession(req.params.sessionId);
      if (!session || session.userId !== req.user.id) {
        return res.status(404).json({ error: "Сессия не найдена" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Ошибка получения сессии' });
    }
  });

  // Generate new image
  app.post("/api/photo-editor/generate", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const data = imageGenerationRequestSchema.parse(req.body);
      const { sessionId } = req.body;

      // Verify session ownership
      if (sessionId) {
        const session = await storage.getPhotoEditorSession(sessionId);
        if (!session || session.userId !== req.user.id) {
          return res.status(404).json({ error: "Сессия не найдена" });
        }
      }

      const result = await photoEditorService.generateImage(data);
      
      // Save generated image to database
      if (sessionId) {
        await storage.createPhotoEditorImage({
          sessionId,
          userId: req.user.id,
          type: "generated",
          url: result.url,
          prompt: data.prompt,
          metadata: {
            aiModel: "DALL-E 3",
            revisedPrompt: result.revisedPrompt,
            ...data.settings
          }
        });
      }

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Ошибка генерации изображения' });
    }
  });

  // Edit existing image
  app.post("/api/photo-editor/edit", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const data = photoEditRequestSchema.parse(req.body);
      const { sessionId } = req.body;

      // Verify session ownership
      if (sessionId) {
        const session = await storage.getPhotoEditorSession(sessionId);
        if (!session || session.userId !== req.user.id) {
          return res.status(404).json({ error: "Сессия не найдена" });
        }
      }

      const result = await photoEditorService.editImage(data);
      
      // Save edited image to database
      if (sessionId) {
        await storage.createPhotoEditorImage({
          sessionId,
          userId: req.user.id,
          type: "edited",
          url: result.url,
          editInstructions: data.editInstructions,
          metadata: {
            aiModel: "DALL-E 2",
            originalImageUrl: data.imageUrl,
            ...data.settings
          }
        });
      }

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Ошибка редактирования изображения' });
    }
  });

  // Analyze image
  app.post("/api/photo-editor/analyze", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { imageUrl, prompt } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ error: "URL изображения обязателен" });
      }

      const result = await photoEditorService.analyzeImage(imageUrl, prompt);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Ошибка анализа изображения' });
    }
  });

  // Create image variations
  app.post("/api/photo-editor/variations", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { imageUrl, count = 1, sessionId } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ error: "URL изображения обязателен" });
      }

      // Verify session ownership
      if (sessionId) {
        const session = await storage.getPhotoEditorSession(sessionId);
        if (!session || session.userId !== req.user.id) {
          return res.status(404).json({ error: "Сессия не найдена" });
        }
      }

      const result = await photoEditorService.createVariations(imageUrl, count);
      
      // Save variations to database
      if (sessionId && result.urls.length > 0) {
        for (const url of result.urls) {
          await storage.createPhotoEditorImage({
            sessionId,
            userId: req.user.id,
            type: "edited",
            url,
            editInstructions: "Создание вариации изображения",
            metadata: {
              aiModel: "DALL-E 2",
              originalImageUrl: imageUrl,
              variationType: "variation"
            }
          });
        }
      }

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Ошибка создания вариаций изображения' });
    }
  });

  // Chat with image
  app.post("/api/photo-editor/chat", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { imageUrl, message, sessionId } = req.body;
      if (!imageUrl || !message) {
        return res.status(400).json({ error: "URL изображения и сообщение обязательны" });
      }

      // Verify session ownership and get conversation history
      let conversationHistory: any[] = [];
      if (sessionId) {
        const session = await storage.getPhotoEditorSession(sessionId);
        if (!session || session.userId !== req.user.id) {
          return res.status(404).json({ error: "Сессия не найдена" });
        }

        const chat = await storage.getPhotoEditorChatBySessionId(sessionId);
        if (chat) {
          conversationHistory = chat.messages;
        }
      }

      const result = await photoEditorService.chatWithImage(imageUrl, message, conversationHistory);
      
      // Save chat message and response
      if (sessionId) {
        const chat = await storage.getPhotoEditorChatBySessionId(sessionId);
        const newMessages = [
          ...conversationHistory,
          {
            id: Date.now().toString(),
            role: "user" as const,
            content: message,
            imageUrl,
            timestamp: new Date().toISOString()
          },
          {
            id: (Date.now() + 1).toString(),
            role: "assistant" as const,
            content: result.response,
            timestamp: new Date().toISOString()
          }
        ];

        if (chat) {
          await storage.updatePhotoEditorChat(chat.id, { messages: newMessages });
        } else {
          await storage.createPhotoEditorChat({
            sessionId,
            userId: req.user.id,
            messages: newMessages
          });
        }
      }

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Ошибка чата с изображением' });
    }
  });

  // Get session images
  app.get("/api/photo-editor/sessions/:sessionId/images", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const session = await storage.getPhotoEditorSession(req.params.sessionId);
      if (!session || session.userId !== req.user.id) {
        return res.status(404).json({ error: "Сессия не найдена" });
      }

      const images = await storage.getPhotoEditorImagesBySessionId(req.params.sessionId);
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Ошибка получения изображений сессии' });
    }
  });

  // Get session chat
  app.get("/api/photo-editor/sessions/:sessionId/chat", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const session = await storage.getPhotoEditorSession(req.params.sessionId);
      if (!session || session.userId !== req.user.id) {
        return res.status(404).json({ error: "Сессия не найдена" });
      }

      const chat = await storage.getPhotoEditorChatBySessionId(req.params.sessionId);
      res.json(chat || { messages: [] });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Ошибка получения чата сессии' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
