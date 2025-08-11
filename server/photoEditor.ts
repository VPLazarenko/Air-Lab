import OpenAI from "openai";
import type { 
  PhotoEditorSettings, 
  PhotoEditRequest, 
  ImageGenerationRequest 
} from "@shared/schema";

// Отдельный сервис для AI фоторедактора с моделью gpt-4o
export class PhotoEditorService {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({ 
      apiKey: apiKey || process.env.OPENAI_API_KEY 
    });
  }

  // Генерация нового изображения с помощью DALL-E 3
  async generateImage(request: ImageGenerationRequest): Promise<{
    url: string;
    revisedPrompt?: string;
  }> {
    try {
      const settings = request.settings || {
        model: "gpt-4o",
        quality: "standard",
        style: "vivid",
        size: "1024x1024",
        responseFormat: "url"
      };

      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: request.prompt,
        n: 1,
        size: settings.size as "1024x1024" | "1792x1024" | "1024x1792",
        quality: settings.quality as "standard" | "hd",
        style: settings.style as "vivid" | "natural",
        response_format: settings.responseFormat as "url" | "b64_json",
      });

      const imageData = response.data?.[0];
      if (!imageData) {
        throw new Error("Не удалось получить данные изображения");
      }
      return {
        url: imageData.url || "",
        revisedPrompt: imageData.revised_prompt,
      };
    } catch (error: any) {
      console.error("Ошибка генерации изображения:", error);
      throw new Error(`Не удалось сгенерировать изображение: ${error?.message || "Неизвестная ошибка"}`);
    }
  }

  // Редактирование изображения с помощью DALL-E 2 (edit)
  async editImage(request: PhotoEditRequest): Promise<{
    url: string;
  }> {
    try {
      // Для редактирования изображений используем DALL-E 2
      // Нужно скачать оригинальное изображение и создать маску
      const imageFile = await this.downloadImageAsFile(request.imageUrl);
      
      const response = await this.openai.images.edit({
        image: imageFile,
        prompt: request.editInstructions,
        n: 1,
        size: "1024x1024",
        response_format: "url",
      });

      const imageData = response.data?.[0];
      if (!imageData) {
        throw new Error("Не удалось получить отредактированное изображение");
      }

      return {
        url: imageData.url || "",
      };
    } catch (error: any) {
      console.error("Ошибка редактирования изображения:", error);
      throw new Error(`Не удалось отредактировать изображение: ${error?.message || "Неизвестная ошибка"}`);
    }
  }

  // Анализ изображения с помощью GPT-4o (vision)
  async analyzeImage(imageUrl: string, prompt: string = "Опишите это изображение подробно"): Promise<{
    description: string;
    suggestions: string[];
  }> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `${prompt}. Также предложите несколько вариантов улучшения или редактирования этого изображения. Ответьте в формате JSON: {"description": "описание", "suggestions": ["вариант1", "вариант2", "вариант3"]}`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                  detail: "high"
                }
              }
            ],
          },
        ],
        max_tokens: 1000,
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        description: result.description || "Описание недоступно",
        suggestions: result.suggestions || [],
      };
    } catch (error: any) {
      console.error("Ошибка анализа изображения:", error);
      throw new Error(`Не удалось проанализировать изображение: ${error?.message || "Неизвестная ошибка"}`);
    }
  }

  // Создание вариаций изображения с помощью DALL-E 2
  async createVariations(imageUrl: string, count: number = 1): Promise<{
    urls: string[];
  }> {
    try {
      const imageFile = await this.downloadImageAsFile(imageUrl);
      
      const response = await this.openai.images.createVariation({
        image: imageFile,
        n: Math.min(count, 4), // максимум 4 вариации
        size: "1024x1024",
        response_format: "url",
      });

      return {
        urls: response.data?.map(img => img.url || "") || [],
      };
    } catch (error: any) {
      console.error("Ошибка создания вариаций:", error);
      throw new Error(`Не удалось создать вариации изображения: ${error?.message || "Неизвестная ошибка"}`);
    }
  }

  // Интеллектуальный чат с контекстом изображения
  async chatWithImage(
    imageUrl: string, 
    userMessage: string, 
    conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = []
  ): Promise<{
    response: string;
    suggestions?: string[];
  }> {
    try {
      const messages: any[] = [
        {
          role: "system",
          content: "Вы - профессиональный фоторедактор и дизайнер. Помогайте пользователям с редактированием, анализом и улучшением изображений. Предлагайте конкретные техники редактирования и креативные решения. Отвечайте на русском языке."
        }
      ];

      // Добавляем историю разговора
      conversationHistory.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });

      // Добавляем текущее сообщение с изображением
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: userMessage
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
              detail: "high"
            }
          }
        ],
      });

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        max_tokens: 1500,
        temperature: 0.7,
      });

      return {
        response: response.choices[0].message.content || "Ответ недоступен",
      };
    } catch (error: any) {
      console.error("Ошибка чата с изображением:", error);
      throw new Error(`Ошибка обработки сообщения: ${error?.message || "Неизвестная ошибка"}`);
    }
  }

  // Вспомогательная функция для скачивания изображения как File
  private async downloadImageAsFile(url: string): Promise<File> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Создаем File объект из буфера
      const filename = url.split('/').pop()?.split('?')[0] || 'image.png';
      const mimeType = response.headers.get('content-type') || 'image/png';
      
      return new File([buffer], filename, { type: mimeType });
    } catch (error: any) {
      console.error("Ошибка скачивания изображения:", error);
      throw new Error(`Не удалось скачать изображение: ${error?.message || "Неизвестная ошибка"}`);
    }
  }

  // Получение информации о модели
  getModelInfo(): {
    imageGeneration: string;
    imageEditing: string;
    imageAnalysis: string;
    chat: string;
  } {
    return {
      imageGeneration: "DALL-E 3",
      imageEditing: "DALL-E 2",
      imageAnalysis: "GPT-4o Vision",
      chat: "GPT-4o"
    };
  }
}

export const photoEditorService = new PhotoEditorService();