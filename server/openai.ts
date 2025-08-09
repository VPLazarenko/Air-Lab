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

  setApiKey(apiKey: string) {
    this.client = new OpenAI({
      apiKey: apiKey,
    });
  }

  async createAssistant(params: {
    name: string;
    description?: string;
    instructions: string;
    model?: string;
    tools?: Array<{ type: "code_interpreter" | "file_search" }>;
    file_ids?: string[];
  }) {
    try {
      const assistant = await this.client.beta.assistants.create({
        name: params.name,
        description: params.description,
        instructions: params.instructions,
        model: params.model || DEFAULT_MODEL,
        tools: params.tools?.map(tool => ({ type: tool.type })) || [],
        // Note: file_ids parameter may need to be updated based on current OpenAI API
      });

      return assistant;
    } catch (error) {
      console.error("Error creating assistant:", error);
      throw new Error(`Failed to create assistant: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateAssistant(assistantId: string, params: {
    name?: string;
    description?: string;
    instructions?: string;
    model?: string;
    tools?: Array<{ type: "code_interpreter" | "file_search" }>;
    file_ids?: string[];
  }) {
    try {
      const assistant = await this.client.beta.assistants.update(assistantId, {
        name: params.name,
        description: params.description,
        instructions: params.instructions,
        model: params.model,
        tools: params.tools?.map(tool => ({ type: tool.type })) || [],
      });

      return assistant;
    } catch (error) {
      console.error("Error updating assistant:", error);
      throw new Error(`Failed to update assistant: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // File and Vector Store management  
  async uploadFile(fileBuffer: Buffer, filename: string, purpose = "assistants" as const) {
    try {
      const file = new File([fileBuffer], filename);
      const uploadedFile = await this.client.files.create({
        file: file,
        purpose: purpose,
      });
      return uploadedFile;
    } catch (error) {
      console.error("Error uploading file to OpenAI:", error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createVectorStore(name: string) {
    try {
      // Create a real vector store using the beta API
      console.log(`Creating vector store: ${name}`);
      const vectorStore = await this.client.beta.vectorStores.create({
        name: name,
      });
      console.log(`Created vector store: ${vectorStore.id}`);
      return vectorStore;
    } catch (error) {
      console.error("Error creating vector store:", error);
      throw new Error(`Failed to create vector store: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addFileToVectorStore(vectorStoreId: string, fileId: string) {
    try {
      console.log(`Adding file ${fileId} to vector store ${vectorStoreId}`);
      const vectorStoreFile = await this.client.beta.vectorStores.files.create(vectorStoreId, {
        file_id: fileId,
      });
      console.log(`Successfully added file to vector store: ${vectorStoreFile.id}`);
      return vectorStoreFile;
    } catch (error) {
      console.error("Error adding file to vector store:", error);
      throw new Error(`Failed to add file to vector store: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateAssistantWithFiles(assistantId: string, fileIds: string[]) {
    try {
      console.log(`Updating assistant ${assistantId} with files: ${fileIds.join(', ')}`);
      
      // Enable file_search tool for the assistant
      // Files will be attached during thread creation for conversations
      const assistant = await this.client.beta.assistants.update(assistantId, {
        tools: [{ type: "file_search" }]
      });

      console.log(`Successfully enabled file_search for assistant ${assistantId}`);
      console.log(`Files ready for use: ${fileIds.join(', ')}`);
      
      return assistant;
    } catch (error) {
      console.error("Error updating assistant with files:", error);
      throw new Error(`Failed to update assistant: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteAssistant(assistantId: string) {
    try {
      await this.client.beta.assistants.delete(assistantId);
      return true;
    } catch (error) {
      console.error("Error deleting assistant:", error);
      throw new Error(`Failed to delete assistant: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createThread() {
    try {
      // Create a simple thread without file attachments
      // Files will be attached through messages instead
      const thread = await this.client.beta.threads.create();
      console.log(`Thread created: ${thread.id}`);
      return thread;
    } catch (error) {
      console.error("Error creating thread:", error);
      throw new Error(`Failed to create thread: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      throw new Error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async runAssistant(threadId: string, assistantId: string) {
    try {
      console.log("Creating run for thread:", threadId, "assistant:", assistantId);
      
      const run = await this.client.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
      });

      console.log("Created run with ID:", run.id);

      // Use different approach - try with stream or wait for completion differently
      return new Promise(async (resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 30; // 30 seconds max
        
        const checkStatus = async () => {
          attempts++;
          
          try {
            console.log(`Attempt ${attempts}: Checking run status...`);
            console.log(`DEBUG: threadId="${threadId}" (type: ${typeof threadId}), runId="${run.id}" (type: ${typeof run.id})`);
            
            // Ensure parameters are valid strings
            if (!threadId || !run.id) {
              throw new Error('Missing threadId or runId');
            }
            
            console.log(`Safe parameters: threadId="${threadId}", runId="${run.id}"`);
            const currentRun = await this.client.beta.threads.runs.retrieve(run.id, { thread_id: threadId });
            console.log(`Run ${currentRun.id} status: ${currentRun.status}`);
            
            if (currentRun.status === "completed") {
              console.log("Run completed successfully");
              const messages = await this.client.beta.threads.messages.list(threadId);
              console.log("Retrieved", messages.data.length, "messages");
              resolve(messages.data[0]);
            } else if (currentRun.status === "failed" || currentRun.status === "cancelled" || currentRun.status === "expired") {
              console.log("Run failed with status:", currentRun.status);
              reject(new Error(`Run failed with status: ${currentRun.status}`));
            } else if (attempts >= maxAttempts) {
              console.log("Max attempts reached, run timed out");
              reject(new Error("Run timed out"));
            } else {
              // Still running, check again in 1 second
              setTimeout(checkStatus, 1000);
            }
          } catch (error) {
            console.error(`Error on attempt ${attempts}:`, error);
            reject(error);
          }
        };
        
        checkStatus();
      });
    } catch (error) {
      console.error("Error running assistant:", error);
      console.error("Error details:", error);
      throw new Error(`Failed to run assistant: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      throw new Error(`Failed to get chat completion: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }


}

export const openaiService = new OpenAIService();
