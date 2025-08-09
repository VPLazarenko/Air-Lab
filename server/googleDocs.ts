import { google } from 'googleapis';

export interface GoogleDocInfo {
  id: string;
  title: string;
  content?: string;
}

export class GoogleDocsService {
  private docs: any;

  constructor() {
    // Используем публичный доступ к Google Docs через API
    this.docs = google.docs({ version: 'v1' });
  }

  // Извлекает ID документа из Google Docs URL
  extractDocIdFromUrl(url: string): string | null {
    const patterns = [
      /\/document\/d\/([a-zA-Z0-9-_]+)/,
      /\/d\/([a-zA-Z0-9-_]+)/,
      /id=([a-zA-Z0-9-_]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }

  // Получает информацию о Google Doc документе
  async getDocInfo(docId: string): Promise<GoogleDocInfo | null> {
    try {
      const response = await this.docs.documents.get({
        documentId: docId,
        // Получаем только title для базовой информации
        fields: 'title,documentId'
      });

      return {
        id: response.data.documentId,
        title: response.data.title || 'Untitled Document'
      };
    } catch (error: any) {
      console.error(`Error fetching Google Doc info for ${docId}:`, error.message);
      
      // Если документ недоступен, возвращаем null
      if (error.code === 404 || error.code === 403) {
        return null;
      }
      
      throw error;
    }
  }

  // Получает полное содержимое Google Doc документа
  async getDocumentContent(docId: string): Promise<string | null> {
    try {
      const response = await this.docs.documents.get({
        documentId: docId,
        // Получаем полное содержимое документа
        includeTabsContent: true
      });

      if (!response.data.body || !response.data.body.content) {
        return null;
      }

      // Извлекаем текст из структуры документа
      let content = '';
      const extractTextFromContent = (elements: any[]) => {
        for (const element of elements) {
          if (element.paragraph) {
            for (const textElement of element.paragraph.elements || []) {
              if (textElement.textRun) {
                content += textElement.textRun.content || '';
              }
            }
          } else if (element.table) {
            // Обработка таблиц
            for (const row of element.table.tableRows || []) {
              for (const cell of row.tableCells || []) {
                extractTextFromContent(cell.content || []);
              }
            }
          }
        }
      };

      extractTextFromContent(response.data.body.content);
      
      // Очищаем и нормализуем текст
      return content.trim();
    } catch (error: any) {
      console.error(`Error fetching Google Doc content for ${docId}:`, error.message);
      
      // Если документ недоступен, возвращаем null
      if (error.code === 404 || error.code === 403) {
        return null;
      }
      
      throw error;
    }
  }

  // Проверяет доступность документа
  async isDocumentAccessible(docId: string): Promise<boolean> {
    try {
      await this.docs.documents.get({
        documentId: docId,
        fields: 'documentId'
      });
      return true;
    } catch (error: any) {
      console.error(`Document ${docId} not accessible:`, error.message);
      return false;
    }
  }
}