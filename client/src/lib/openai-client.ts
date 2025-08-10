import { apiRequest } from "./queryClient";

export interface Assistant {
  id: string;
  userId: string;
  openaiAssistantId?: string;
  name: string;
  description?: string;
  instructions?: string;
  systemPrompt?: string;
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
    }) as User;
  },

  async getUser(userId: string) {
    return await apiRequest(`/api/users/${userId}`) as User;
  },

  async updateUser(userId: string, updates: Partial<User>) {
    return await apiRequest(`/api/users/${userId}`, {
      method: "PUT", 
      body: JSON.stringify(updates)
    }) as User;
  },

  // Assistant operations
  async createAssistant(assistantData: {
    userId: string;
    name: string;
    description?: string;
    instructions?: string;
    systemPrompt?: string;
    model: string;
    temperature: number;
    tools: Array<{ type: string; enabled: boolean }>;
  }) {
    return await apiRequest("/api/assistants", {
      method: "POST",
      body: JSON.stringify(assistantData)
    }) as Assistant;
  },

  async getAssistantsByUserId(userId: string) {
    return await apiRequest(`/api/assistants/user/${userId}`) as Assistant[];
  },

  async getAssistant(assistantId: string) {
    return await apiRequest(`/api/assistants/${assistantId}`) as Assistant;
  },

  async updateAssistant(assistantId: string, updates: Partial<Assistant>) {
    return await apiRequest(`/api/assistants/${assistantId}`, {
      method: "PUT",
      body: JSON.stringify(updates)
    }) as Assistant;
  },

  async deleteAssistant(assistantId: string) {
    return await apiRequest(`/api/assistants/${assistantId}`, {
      method: "DELETE"
    }) as { success: boolean };
  },

  async exportAssistant(assistantId: string) {
    return await fetch(`/api/assistants/${assistantId}/export`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    }).then(res => res.blob());
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
    }) as Conversation;
  },

  async getConversation(conversationId: string) {
    return await apiRequest(`/api/conversations/${conversationId}`) as Conversation;
  },

  async sendMessage(conversationId: string, message: string) {
    return await apiRequest(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message })
    }) as {
      userMessage: { id: string; role: "user"; content: string; timestamp: string };
      assistantMessage: { id: string; role: "assistant"; content: string; timestamp: string };
    };
  },

  async getConversationsByUserId(userId: string) {
    return await apiRequest(`/api/conversations/user/${userId}`) as Conversation[];
  },

  // File operations
  async getUploadUrl() {
    return await apiRequest("/api/objects/upload", {
      method: "POST"
    }) as { uploadURL: string };
  },

  async uploadFileToAssistant(assistantId: string, fileUrl: string, fileName: string) {
    return await apiRequest(`/api/assistants/${assistantId}/files`, {
      method: "POST",
      body: JSON.stringify({ fileUrl, fileName })
    });
  },

  async getGoogleDriveDocuments(assistantId: string) {
    return await apiRequest(`/api/assistants/${assistantId}/google-drive`);
  },

  async addGoogleDriveDocument(assistantId: string, documentUrl: string, userId: string) {
    return await apiRequest(`/api/assistants/${assistantId}/google-drive`, {
      method: "POST",
      body: JSON.stringify({ documentUrl, userId })
    });
  },
};
