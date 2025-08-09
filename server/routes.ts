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
      let user;
      if (req.params.id === "demo-user-1") {
        // For demo user, find by username
        user = await storage.getUserByEmail("demo@example.com");
        if (user) {
          // Return user with expected demo-user-1 ID for frontend compatibility
          user = { ...user, id: "demo-user-1" };
        }
      } else {
        user = await storage.getUser(req.params.id);
      }
      
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
      let assistantData = insertAssistantSchema.extend({
        userId: z.string()
      }).parse(req.body);

      // Convert demo user ID to actual UUID
      if (assistantData.userId === "demo-user-1") {
        console.log("Converting demo-user-1 to actual UUID...");
        const user = await storage.getUserByEmail("demo@example.com");
        if (user) {
          console.log("Found user:", user.id);
          assistantData = { ...assistantData, userId: user.id };
        } else {
          console.log("User not found with email demo@example.com");
        }
      }
      console.log("Final userId:", assistantData.userId);

      // Use OpenAI API key from environment
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "OpenAI API key not configured on server" });
      }

      // Create assistant with OpenAI
      openaiService.setApiKey(apiKey);
      
      // Use provided vector store ID or create new one for file search
      let vectorStoreId = assistantData.userProvidedVectorStoreId || null;
      const hasFileSearch = (assistantData.tools || []).some((t: any) => t.enabled && t.type === "file_search");
      
      if (hasFileSearch && !vectorStoreId) {
        console.log("Creating vector store for assistant with file search...");
        const vectorStore = await openaiService.createVectorStore(`${assistantData.name} Knowledge Base`);
        vectorStoreId = vectorStore.id;
        console.log(`Vector store created with ID: ${vectorStoreId}`);
      } else if (vectorStoreId) {
        console.log(`Using provided vector store ID: ${vectorStoreId}`);
      }

      // Create assistant with vector store if provided
      const tools = (assistantData.tools || []).filter((t: any) => t.enabled && (t.type === "code_interpreter" || t.type === "file_search")).map((t: any) => ({ type: t.type as "code_interpreter" | "file_search" }));
      
      const assistantConfig: any = {
        name: assistantData.name,
        description: assistantData.description || undefined,
        instructions: assistantData.instructions || "",
        model: assistantData.model,
        tools,
      };

      // Add vector store if file_search is enabled and vector store ID is provided
      if (vectorStoreId && tools.some(t => t.type === "file_search")) {
        assistantConfig.tool_resources = {
          file_search: {
            vector_store_ids: [vectorStoreId]
          }
        };
      }

      const openaiAssistant = await openaiService.createAssistant(assistantConfig);

      // Vector store is created but files will be attached when uploaded

      // Save to local storage
      const assistant = await storage.createAssistant({
        name: assistantData.name,
        description: assistantData.description,
        instructions: assistantData.instructions,
        model: assistantData.model,
        temperature: assistantData.temperature,
        tools: assistantData.tools,
        files: assistantData.files,
        userId: assistantData.userId,
        openaiAssistantId: openaiAssistant.id,
        vectorStoreId: vectorStoreId || undefined,
        userProvidedVectorStoreId: assistantData.userProvidedVectorStoreId,
      });

      res.json(assistant);
    } catch (error) {
      console.error("Error creating assistant:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/assistants/user/:userId", async (req, res) => {
    try {
      let userId = req.params.userId;
      if (userId === "demo-user-1") {
        // Get real user ID for demo user
        const user = await storage.getUserByEmail("demo@example.com");
        if (user) {
          userId = user.id;
        }
      }
      const assistants = await storage.getAssistantsByUserId(userId);
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
      let conversationData = insertConversationSchema.extend({
        userId: z.string()
      }).parse(req.body);

      // Convert demo user ID to actual UUID
      if (conversationData.userId === "demo-user-1") {
        const user = await storage.getUserByEmail("demo@example.com");
        if (user) {
          conversationData = { ...conversationData, userId: user.id };
        }
      }

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
      let userId = req.params.userId;
      if (userId === "demo-user-1") {
        const user = await storage.getUserByEmail("demo@example.com");
        if (user) {
          userId = user.id;
        }
      }
      const conversations = await storage.getConversationsByUserId(userId);
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

  // Knowledge Base routes
  app.get("/api/knowledge-base/user/:userId", async (req, res) => {
    try {
      const files = await storage.getKnowledgeBaseFilesByUserId(req.params.userId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/knowledge-base/assistant/:assistantId", async (req, res) => {
    try {
      const files = await storage.getKnowledgeBaseFilesByAssistantId(req.params.assistantId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/knowledge-base", async (req, res) => {
    try {
      const { userId, assistantId, vectorStoreId, fileName, originalName, fileSize, fileType, openaiFileId, storagePath, metadata } = req.body;
      
      const file = await storage.createKnowledgeBaseFile({
        userId,
        assistantId,
        vectorStoreId,
        fileName,
        originalName,
        fileSize,
        fileType,
        openaiFileId,
        storagePath,
        metadata
      });
      
      res.json(file);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.delete("/api/knowledge-base/:id", async (req, res) => {
    try {
      const success = await storage.deleteKnowledgeBaseFile(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Knowledge base file not found" });
      }
      res.json({ success: true });
    } catch (error) {
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

  // Upload file directly to default vector store using proper OpenAI SDK methods
  app.post("/api/vector-store/upload", async (req, res) => {
    try {
      const { fileContent, fileName, userId } = req.body;

      if (!fileContent || !fileName) {
        return res.status(400).json({ error: "File content and name are required" });
      }

      // Convert demo user ID to actual UUID
      let actualUserId = userId;
      if (userId === "demo-user-1") {
        const user = await storage.getUserByEmail("demo@example.com");
        if (user) {
          actualUserId = user.id;
        }
      }

      // Use OpenAI API key from environment
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "OpenAI API key not configured on server" });
      }

      openaiService.setApiKey(apiKey);

      // Convert content to buffer
      const fileBuffer = Buffer.from(fileContent, 'utf-8');
      
      console.log(`Uploading file ${fileName} directly to OpenAI...`);

      // Step 1: Upload file to OpenAI Files API
      const uploadedFile = await openaiService.uploadFile(fileBuffer, fileName);
      console.log(`File uploaded with ID: ${uploadedFile.id}`);

      // Step 2: Add file to default vector store
      const DEFAULT_VECTOR_STORE_ID = "vs_6871906566a48191aa3376db251c9d0d";
      console.log(`Adding file to vector store ${DEFAULT_VECTOR_STORE_ID}...`);
      
      const vectorStoreFile = await openaiService.addFileToVectorStore(DEFAULT_VECTOR_STORE_ID, uploadedFile.id);
      console.log(`File added to vector store successfully`);

      // Save to knowledge base
      const knowledgeFile = await storage.createKnowledgeBaseFile({
        userId: actualUserId,
        fileName,
        originalName: fileName,
        fileSize: fileBuffer.length.toString(),
        fileType: fileName.split('.').pop() || 'txt',
        openaiFileId: uploadedFile.id,
        vectorStoreId: DEFAULT_VECTOR_STORE_ID,
        storagePath: '',
        metadata: { 
          description: `File uploaded to vector store`,
          tags: [`direct-upload`, `vector-store`],
          isActive: true
        }
      });

      res.json({
        success: true,
        file: uploadedFile,
        vectorStoreFile,
        knowledgeFile,
        vectorStoreId: DEFAULT_VECTOR_STORE_ID
      });

    } catch (error) {
      console.error("Error uploading file to vector store:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get files from default vector store
  app.get("/api/vector-store/files", async (req, res) => {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "OpenAI API key not configured on server" });
      }

      openaiService.setApiKey(apiKey);

      const DEFAULT_VECTOR_STORE_ID = "vs_6871906566a48191aa3376db251c9d0d";
      const files = await openaiService.listVectorStoreFiles(DEFAULT_VECTOR_STORE_ID);

      res.json(files);
    } catch (error) {
      console.error("Error getting vector store files:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Add Google Docs content to specific assistant's knowledge base with analysis
  app.post("/api/assistants/:assistantId/add-google-doc", async (req, res) => {
    try {
      const { assistantId } = req.params;
      const { documentId, userId, title, analysisPrompt } = req.body;

      if (!documentId) {
        return res.status(400).json({ error: "Google Docs document ID is required" });
      }

      // Get assistant
      const assistant = await storage.getAssistant(assistantId);
      if (!assistant) {
        return res.status(404).json({ error: "Assistant not found" });
      }

      // Convert demo user ID to actual UUID
      let actualUserId = userId;
      if (userId === "demo-user-1") {
        const user = await storage.getUserByEmail("demo@example.com");
        if (user) {
          actualUserId = user.id;
        }
      }

      // Use OpenAI API key from environment
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "OpenAI API key not configured on server" });
      }

      openaiService.setApiKey(apiKey);

      console.log(`Fetching Google Docs content: ${documentId} for assistant: ${assistant.name}`);

      // Try to fetch Google Docs content via public export URL
      const exportUrl = `https://docs.google.com/document/d/${documentId}/export?format=txt`;
      
      let textContent;
      try {
        const response = await fetch(exportUrl);
        if (!response.ok) {
          throw new Error(`Google Docs not publicly accessible: ${response.status}`);
        }
        textContent = await response.text();
      } catch (fetchError) {
        // If direct export fails, try HTML export and parse
        try {
          const htmlUrl = `https://docs.google.com/document/d/${documentId}/export?format=html`;
          const htmlResponse = await fetch(htmlUrl);
          if (!htmlResponse.ok) {
            throw new Error(`Google Docs HTML export failed: ${htmlResponse.status}`);
          }
          const html = await htmlResponse.text();
          
          // Extract text content from HTML
          textContent = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        } catch (htmlError) {
          throw new Error(`Unable to access Google Docs. Document may be private or ID incorrect. Please ensure document is publicly viewable or use "Anyone with the link" sharing.`);
        }
      }

      if (!textContent || textContent.length < 100) {
        throw new Error("Google Docs content is too short or empty");
      }

      // Analyze content using OpenAI for better understanding
      const defaultAnalysisPrompt = `Analyze this Google Docs content and create a structured summary:
      
      Document ID: ${documentId}
      Content Length: ${textContent.length} characters
      
      Please provide:
      1. Main topic and purpose of the document
      2. Key information, sections, and insights
      3. Important facts, data, and conclusions
      4. Structured summary for assistant knowledge base
      5. Action items or next steps if any
      
      Content to analyze:
      ${textContent.substring(0, 12000)}`;

      console.log(`Analyzing Google Docs content using GPT-4...`);
      
      // Analyze content with OpenAI
      const analysis = await openaiService.analyzeContent(analysisPrompt || defaultAnalysisPrompt);
      
      // Create enhanced content with both original and analysis
      const enhancedContent = `# Google Docs Analysis: ${title || `Document ${documentId}`}

## Source Information
- Document ID: ${documentId}
- Google Docs URL: https://docs.google.com/document/d/${documentId}
- Analyzed: ${new Date().toISOString()}
- Content Length: ${textContent.length} characters

## AI Analysis Summary
${analysis}

## Original Document Content
${textContent}`;

      // Create filename from document ID and assistant
      const fileName = title 
        ? `${assistant.name}_${title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`
        : `${assistant.name}_google_doc_${documentId}_${Date.now()}.txt`;

      // Convert enhanced content to buffer
      const fileBuffer = Buffer.from(enhancedContent, 'utf-8');
      
      console.log(`Uploading analyzed Google Docs content as file: ${fileName}`);

      // Step 1: Upload file to OpenAI Files API
      const uploadedFile = await openaiService.uploadFile(fileBuffer, fileName);
      console.log(`Analyzed Google Docs content uploaded with ID: ${uploadedFile.id}`);

      // Step 2: Add file to default vector store
      const DEFAULT_VECTOR_STORE_ID = "vs_6871906566a48191aa3376db251c9d0d";
      console.log(`Adding analyzed Google Docs content to vector store ${DEFAULT_VECTOR_STORE_ID}...`);
      
      const vectorStoreFile = await openaiService.addFileToVectorStore(DEFAULT_VECTOR_STORE_ID, uploadedFile.id);
      console.log(`Analyzed Google Docs content added to vector store successfully`);

      // Save to knowledge base linked to specific assistant
      const knowledgeFile = await storage.createKnowledgeBaseFile({
        userId: actualUserId,
        assistantId: assistantId,
        fileName,
        originalName: title || `Google Doc ${documentId}`,
        fileSize: fileBuffer.length.toString(),
        fileType: 'google_docs',
        openaiFileId: uploadedFile.id,
        vectorStoreId: DEFAULT_VECTOR_STORE_ID,
        storagePath: `https://docs.google.com/document/d/${documentId}`,
        metadata: { 
          description: `AI-analyzed Google Docs content for ${assistant.name}: ${documentId}`,
          tags: [`google-docs`, `analyzed`, `assistant:${assistant.name}`, `document:${documentId}`],
          isActive: true
        }
      });

      res.json({
        success: true,
        message: `Google Docs ${documentId} analyzed and added to ${assistant.name}'s knowledge base`,
        file: uploadedFile,
        vectorStoreFile,
        knowledgeFile,
        assistant: { id: assistant.id, name: assistant.name },
        analysis: {
          originalLength: textContent.length,
          enhancedLength: enhancedContent.length,
          documentId: documentId,
          documentUrl: `https://docs.google.com/document/d/${documentId}`
        }
      });

    } catch (error) {
      console.error("Error adding Google Docs to assistant knowledge base:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get knowledge files for a specific assistant
  app.get("/api/assistants/:assistantId/knowledge-files", async (req, res) => {
    try {
      const { assistantId } = req.params;
      
      // Get assistant to verify it exists
      const assistant = await storage.getAssistant(assistantId);
      if (!assistant) {
        return res.status(404).json({ error: "Assistant not found" });
      }

      // Get knowledge files for this assistant
      const knowledgeFiles = await storage.getAssistantKnowledgeFiles(assistantId);
      
      res.json(knowledgeFiles);
    } catch (error) {
      console.error("Error getting assistant knowledge files:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Upload file to assistant's knowledge base (legacy endpoint)
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

      // Upload to OpenAI
      console.log(`Uploading file ${fileName} to OpenAI...`);
      const openaiFile = await openaiService.uploadFile(fileBuffer, fileName);
      console.log(`File uploaded to OpenAI with ID: ${openaiFile.id}`);

      // Create or get vector store for this assistant
      let vectorStoreId = assistant.vectorStoreId;
      if (!vectorStoreId && assistant.openaiAssistantId) {
        console.log(`Creating vector store for assistant ${assistant.name}...`);
        const vectorStore = await openaiService.createVectorStore(`${assistant.name} Knowledge Base`);
        vectorStoreId = vectorStore.id;
        
        // Update local storage with vector store ID
        await storage.updateAssistant(assistantId, { vectorStoreId });
        console.log(`Vector store created with ID: ${vectorStoreId}`);
      }

      if (vectorStoreId) {
        // Add file to vector store
        console.log(`Adding file to vector store ${vectorStoreId}...`);
        await openaiService.addFileToVectorStore(vectorStoreId, openaiFile.id);
        
        // No need to update assistant - files in vector store are automatically accessible
        console.log(`File ${openaiFile.id} is now available in vector store ${vectorStoreId} for assistant ${assistant.openaiAssistantId}`);
        
        // Verify the assistant has the vector store linked
        if (assistant.openaiAssistantId && !assistant.vectorStoreId) {
          await openaiService.updateAssistantWithFiles(assistant.openaiAssistantId, [], vectorStoreId);
          await storage.updateAssistant(assistantId, { vectorStoreId });
          console.log(`Assistant ${assistant.openaiAssistantId} linked to vector store ${vectorStoreId}`);
        }
      }

      res.json({ 
        success: true, 
        fileId: openaiFile.id,
        vectorStoreId,
        message: "File uploaded to assistant's knowledge base successfully" 
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

  const httpServer = createServer(app);
  return httpServer;
}
