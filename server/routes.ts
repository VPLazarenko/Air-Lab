import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openaiService } from "./openai";
import { ObjectStorageService } from "./objectStorage";
import { insertUserSchema, insertAssistantSchema, insertConversationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
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

  // Assistant routes
  app.post("/api/assistants", async (req, res) => {
    try {
      const assistantData = insertAssistantSchema.extend({
        userId: z.string()
      }).parse(req.body);

      // Use OpenAI API key from environment
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "OpenAI API key not configured on server" });
      }

      // Create assistant with OpenAI
      openaiService.setApiKey(apiKey);
      const openaiAssistant = await openaiService.createAssistant({
        name: assistantData.name,
        description: assistantData.description,
        instructions: assistantData.instructions || "",
        model: assistantData.model,
        tools: (assistantData.tools || []).filter(t => t.enabled).map(t => ({ type: t.type as "code_interpreter" | "retrieval" | "function" })),
      });

      // Save to local storage
      const assistant = await storage.createAssistant({
        ...assistantData,
        // openaiAssistantId: openaiAssistant.id, // This field may not exist in the schema
      });

      res.json(assistant);
    } catch (error) {
      console.error("Error creating assistant:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/assistants/user/:userId", async (req, res) => {
    try {
      const assistants = await storage.getAssistantsByUserId(req.params.userId);
      res.json(assistants);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/assistants/:id", async (req, res) => {
    try {
      const assistant = await storage.getAssistant(req.params.id);
      if (!assistant) {
        return res.status(404).json({ error: "Assistant not found" });
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
          model: updates.model,
          tools: (updates.tools || []).filter((t: any) => t.enabled).map((t: any) => ({ type: t.type as "code_interpreter" | "retrieval" | "function" })),
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

  const httpServer = createServer(app);
  return httpServer;
}
