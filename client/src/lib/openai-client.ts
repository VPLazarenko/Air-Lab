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
    return await apiRequest("/api/users", {
      method: "POST",
      body: JSON.stringify(userData)
    });
  },

  async getUser(userId: string) {
    return await apiRequest(`/api/users/${userId}`);
  },

  async updateUser(userId: string, updates: Partial<User>) {
    return await apiRequest(`/api/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(updates)
    });
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
    return await apiRequest("/api/assistants", {
      method: "POST",
      body: JSON.stringify(assistantData)
    });
  },

  async getAssistantsByUserId(userId: string) {
    return await apiRequest(`/api/assistants/user/${userId}`);
  },

  async getAssistant(assistantId: string) {
    return await apiRequest(`/api/assistants/${assistantId}`);
  },

  async updateAssistant(assistantId: string, updates: Partial<Assistant>) {
    return await apiRequest(`/api/assistants/${assistantId}`, {
      method: "PUT",
      body: JSON.stringify(updates)
    });
  },

  async deleteAssistant(assistantId: string) {
    return await apiRequest(`/api/assistants/${assistantId}`, {
      method: "DELETE"
    });
  },

  async exportAssistant(assistantId: string) {
    const response = await fetch(`/api/assistants/${assistantId}/export`);
    return await response.blob();
  },

  // Conversation operations
  async createConversation(conversationData: {
    userId: string;
    assistantId: string;
    title?: string;
  }) {
    return await apiRequest("/api/conversations", {
      method: "POST",
      body: JSON.stringify(conversationData)
    });
  },

  async getConversation(conversationId: string) {
    return await apiRequest(`/api/conversations/${conversationId}`);
  },

  async sendMessage(conversationId: string, message: string) {
    return await apiRequest(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message })
    });
  },

  async getConversationsByUserId(userId: string) {
    return await apiRequest(`/api/conversations/user/${userId}`);
  },

  // File operations
  async getUploadUrl() {
    return await apiRequest("/api/objects/upload", {
      method: "POST"
    });
  },

  async uploadFileToAssistant(assistantId: string, fileUrl: string, fileName: string) {
    return await apiRequest(`/api/assistants/${assistantId}/files`, {
      method: "POST",
      body: JSON.stringify({
        fileUrl,
        fileName,
      })
    });
  },

  async getGoogleDriveDocuments(assistantId: string) {
    return await apiRequest(`/api/assistants/${assistantId}/google-drive`);
  },

  async addGoogleDriveDocument(assistantId: string, documentUrl: string, userId: string) {
    return await apiRequest(`/api/assistants/${assistantId}/google-drive`, {
      method: "POST",
      body: JSON.stringify({
        documentUrl,
        userId,
      })
    });
  },
};
