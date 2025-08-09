import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const DEFAULT_MODEL = "gpt-4o";

export class OpenAIService {
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY || "",
    });
  }

  async createAssistant(params: {
    name: string;
    description?: string;
    instructions: string;
    model?: string;
    tools?: Array<{ type: string }>;
    file_ids?: string[];
  }) {
    try {
      const assistant = await this.client.beta.assistants.create({
        name: params.name,
        description: params.description,
        instructions: params.instructions,
        model: params.model || DEFAULT_MODEL,
        tools: params.tools || [],
        // Note: file_ids parameter may need to be updated based on current OpenAI API
      });

      return assistant;
    } catch (error) {
      console.error("Error creating assistant:", error);
      throw new Error(`Failed to create assistant: ${error.message}`);
    }
  }

  async updateAssistant(assistantId: string, params: {
    name?: string;
    description?: string;
    instructions?: string;
    model?: string;
    tools?: Array<{ type: string }>;
    file_ids?: string[];
  }) {
    try {
      const assistant = await this.client.beta.assistants.update(assistantId, {
        ...params,
      });

      return assistant;
    } catch (error) {
      console.error("Error updating assistant:", error);
      throw new Error(`Failed to update assistant: ${error.message}`);
    }
  }

  async deleteAssistant(assistantId: string) {
    try {
      await this.client.beta.assistants.del(assistantId);
      return true;
    } catch (error) {
      console.error("Error deleting assistant:", error);
      throw new Error(`Failed to delete assistant: ${error.message}`);
    }
  }

  async createThread() {
    try {
      const thread = await this.client.beta.threads.create();
      return thread;
    } catch (error) {
      console.error("Error creating thread:", error);
      throw new Error(`Failed to create thread: ${error.message}`);
    }
  }

  async sendMessage(threadId: string, message: string) {
    try {
      await this.client.beta.threads.messages.create(threadId, {
        role: "user",
        content: message,
      });

      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  async runAssistant(threadId: string, assistantId: string) {
    try {
      const run = await this.client.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
      });

      // Poll for completion
      let runStatus = run;
      while (runStatus.status === "queued" || runStatus.status === "in_progress") {
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await this.client.beta.threads.runs.retrieve(threadId, run.id);
      }

      if (runStatus.status === "completed") {
        const messages = await this.client.beta.threads.messages.list(threadId);
        return messages.data[0]; // Return the latest message
      } else {
        throw new Error(`Run failed with status: ${runStatus.status}`);
      }
    } catch (error) {
      console.error("Error running assistant:", error);
      throw new Error(`Failed to run assistant: ${error.message}`);
    }
  }

  async uploadFile(file: Buffer, filename: string, purpose: "assistants" = "assistants") {
    try {
      const uploadedFile = await this.client.files.create({
        file: new File([file], filename),
        purpose: purpose,
      });

      return uploadedFile;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async chatCompletion(messages: Array<{ role: string; content: string }>, model?: string, temperature?: number) {
    try {
      const response = await this.client.chat.completions.create({
        model: model || DEFAULT_MODEL,
        messages: messages as any,
        temperature: temperature || 0.7,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error in chat completion:", error);
      throw new Error(`Failed to get chat completion: ${error.message}`);
    }
  }

  setApiKey(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }
}

export const openaiService = new OpenAIService();
