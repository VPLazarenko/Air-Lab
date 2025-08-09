import { apiRequest } from "./queryClient";

export interface Assistant {
  id: string;
  userId: string;
  openaiAssistantId?: string;
  name: string;
  description?: string;
  instructions?: string;
  model: string;
  temperature: number;
  tools: Array<{ type: string; enabled: boolean }>;
  files: Array<{ id: string; name: string; path: string }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  settings: {
    defaultModel?: string;
    autoSave?: boolean;
    darkMode?: boolean;
  };
}

export interface Conversation {
  id: string;
  userId: string;
  assistantId: string;
  openaiThreadId?: string;
  title?: string;
  messages: Array<{
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export const openaiClient = {
  // User operations
  async createUser(userData: { username: string; email: string; settings?: any }) {
    const response = await apiRequest("POST", "/api/users", userData);
    return await response.json() as User;
  },

  async getUser(userId: string) {
    const response = await apiRequest("GET", `/api/users/${userId}`);
    return await response.json() as User;
  },

  async updateUser(userId: string, updates: Partial<User>) {
    const response = await apiRequest("PUT", `/api/users/${userId}`, updates);
    return await response.json() as User;
  },

  // Assistant operations
  async createAssistant(assistantData: {
    userId: string;
    name: string;
    description?: string;
    instructions?: string;
    model: string;
    temperature: number;
    tools: Array<{ type: string; enabled: boolean }>;
  }) {
    const response = await apiRequest("POST", "/api/assistants", assistantData);
    return await response.json() as Assistant;
  },

  async getAssistantsByUserId(userId: string) {
    const response = await apiRequest("GET", `/api/assistants/user/${userId}`);
    return await response.json() as Assistant[];
  },

  async getAssistant(assistantId: string) {
    const response = await apiRequest("GET", `/api/assistants/${assistantId}`);
    return await response.json() as Assistant;
  },

  async updateAssistant(assistantId: string, updates: Partial<Assistant>) {
    const response = await apiRequest("PUT", `/api/assistants/${assistantId}`, updates);
    return await response.json() as Assistant;
  },

  async deleteAssistant(assistantId: string) {
    const response = await apiRequest("DELETE", `/api/assistants/${assistantId}`);
    return await response.json() as { success: boolean };
  },

  async exportAssistant(assistantId: string) {
    const response = await apiRequest("GET", `/api/assistants/${assistantId}/export`);
    return await response.blob();
  },

  // Conversation operations
  async createConversation(conversationData: {
    userId: string;
    assistantId: string;
    title?: string;
  }) {
    const response = await apiRequest("POST", "/api/conversations", conversationData);
    return await response.json() as Conversation;
  },

  async getConversation(conversationId: string) {
    const response = await apiRequest("GET", `/api/conversations/${conversationId}`);
    return await response.json() as Conversation;
  },

  async sendMessage(conversationId: string, message: string) {
    const response = await apiRequest("POST", `/api/conversations/${conversationId}/messages`, { message });
    return await response.json() as {
      userMessage: { id: string; role: "user"; content: string; timestamp: string };
      assistantMessage: { id: string; role: "assistant"; content: string; timestamp: string };
    };
  },

  async getConversationsByUserId(userId: string) {
    const response = await apiRequest("GET", `/api/conversations/user/${userId}`);
    return await response.json() as Conversation[];
  },

  // File operations
  async getUploadUrl() {
    const response = await apiRequest("POST", "/api/objects/upload");
    return await response.json() as { uploadURL: string };
  },

  async uploadFileToAssistant(assistantId: string, fileUrl: string, fileName: string) {
    const response = await apiRequest("POST", `/api/assistants/${assistantId}/files`, {
      fileUrl,
      fileName,
    });
    return await response.json();
  },

  async getGoogleDriveDocuments(assistantId: string) {
    const response = await apiRequest("GET", `/api/assistants/${assistantId}/google-drive`);
    return await response.json();
  },

  async addGoogleDriveDocument(assistantId: string, documentUrl: string, userId: string) {
    const response = await apiRequest("POST", `/api/assistants/${assistantId}/google-drive`, {
      documentUrl,
      userId,
    });
    return await response.json();
  },
};
