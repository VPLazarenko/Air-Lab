import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openaiService } from "./openai";
import { ObjectStorageService } from "./objectStorage";
import { GoogleDocsService } from "./googleDocs";
import { insertUserSchema, insertAssistantSchema, insertConversationSchema, insertGoogleDocsDocumentSchema } from "@shared/schema";
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
      
      // If we have file search enabled, create a vector store first
      let vectorStoreId = null;
      const hasFileSearch = (assistantData.tools || []).some((t: any) => t.enabled && t.type === "file_search");
      
      if (hasFileSearch) {
        console.log("Creating vector store for assistant with file search...");
        const vectorStore = await openaiService.createVectorStore(`${assistantData.name} Knowledge Base`);
        vectorStoreId = vectorStore.id;
        console.log(`Vector store created with ID: ${vectorStoreId}`);
      }

      const openaiAssistant = await openaiService.createAssistant({
        name: assistantData.name,
        description: assistantData.description || undefined,
        instructions: assistantData.instructions || "",
        model: assistantData.model,
        tools: (assistantData.tools || []).filter((t: any) => t.enabled && (t.type === "code_interpreter" || t.type === "file_search")).map((t: any) => ({ type: t.type as "code_interpreter" | "file_search" })),
      });

      // Vector store is created but files will be attached when uploaded

      // Save to local storage
      const assistant = await storage.createAssistant(assistantData);
      
      // Update with OpenAI data
      await storage.updateAssistant(assistant.id, {
        openaiAssistantId: openaiAssistant.id,
        vectorStoreId: vectorStoreId,
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
        
        // Get Google Docs files for this assistant to attach to the thread
        const googleDocs = await storage.getGoogleDocsDocumentsByAssistantId(assistant.id);
        const fileIds = googleDocs
          .filter(doc => doc.status === 'completed' && doc.vectorStoreFileId)
          .map(doc => doc.vectorStoreFileId)
          .filter((id): id is string => id !== null && id !== undefined);
        
        console.log(`Found ${fileIds.length} processed files to attach to thread`);
        
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
        
        // Update OpenAI assistant with the uploaded file
        if (assistant.openaiAssistantId) {
          await openaiService.updateAssistantWithFiles(assistant.openaiAssistantId, [openaiFile.id]);
          console.log(`Assistant ${assistant.openaiAssistantId} updated with file ${openaiFile.id}`);
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
        docId: docId,
        documentUrl: documentUrl,
        title: docInfo.title,
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
      const fileIds = processedDocs
        .filter(doc => doc.status === 'completed' && doc.fileId)
        .map(doc => doc.fileId!)
        .filter(Boolean);

      if (fileIds.length === 0) {
        return res.json({ message: "No files to update", fileCount: 0 });
      }

      // Initialize OpenAI service
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "OpenAI API key not configured" });
      }
      
      openaiService.setApiKey(apiKey);

      // Update assistant with files if it has OpenAI ID
      if (assistant.openaiAssistantId) {
        try {
          await openaiService.updateAssistantWithFiles(assistant.openaiAssistantId, fileIds);
          res.json({ 
            message: "Assistant files updated successfully", 
            fileCount: fileIds.length,
            fileIds: fileIds
          });
        } catch (error) {
          console.error("Error updating assistant files:", error);
          res.status(500).json({ error: "Failed to update assistant files" });
        }
      } else {
        res.status(400).json({ error: "Assistant has no OpenAI ID" });
      }
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

      // Get document content
      const content = await docsService.getDocumentContent(document.docId);
      if (!content) {
        await storage.updateGoogleDocsDocument(documentId, { 
          status: "error",
          errorMessage: "Could not extract content from document"
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
          
          // Update assistant with the new file
          await openaiService.updateAssistantWithFiles(assistant.openaiAssistantId, [openaiFile.id]);
          
          // Update document record
          await storage.updateGoogleDocsDocument(documentId, { 
            status: "completed",
            vectorStoreFileId: openaiFile.id,
            processedAt: new Date()
          });
          
          console.log(`Successfully processed Google Docs document: ${document.title}`);
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

  const httpServer = createServer(app);
  return httpServer;
}
