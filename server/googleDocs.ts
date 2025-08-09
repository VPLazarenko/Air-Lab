import { google } from 'googleapis';

export interface GoogleDocInfo {
  id: string;
  title: string;
  content?: string;
}

export class GoogleDocsService {
  private docs: any;

  constructor() {
    // Используем Google API ключ для доступа к Google Docs API
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY environment variable is required');
    }
    
    this.docs = google.docs({ 
      version: 'v1',
      auth: apiKey
    });
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
        documentId: docId
      });

      return {
        id: response.data.documentId,
        title: response.data.title || 'Untitled Document'
      };
    } catch (error: any) {
      console.error(`Error fetching Google Doc info for ${docId}:`, error.message);
      
      // Если документ недоступен или не найден, возвращаем null
      if (error.code === 404 || error.code === 403 || error.status === 404 || error.status === 403) {
        return null;
      }
      
      throw error;
    }
  }

  // Получает полное содержимое Google Doc документа
  async getDocumentContent(docId: string): Promise<string | null> {
    try {
      const response = await this.docs.documents.get({
        documentId: docId
      });

      if (!response.data.body || !response.data.body.content) {
        return null;
      }

      // Извлекаем текст из структуры документа
      let content = '';
      const extractTextFromContent = (elements: any[]) => {
        for (const element of elements) {
          if (element.paragraph && element.paragraph.elements) {
            for (const paragraphElement of element.paragraph.elements) {
              if (paragraphElement.textRun && paragraphElement.textRun.content) {
                content += paragraphElement.textRun.content;
              } else if (paragraphElement.autoText) {
                content += '[AUTO_TEXT]';
              } else if (paragraphElement.pageBreak) {
                content += '\n[PAGE_BREAK]\n';
              } else if (paragraphElement.columnBreak) {
                content += '\n[COLUMN_BREAK]\n';
              } else if (paragraphElement.horizontalRule) {
                content += '\n---\n';
              }
            }
            content += '\n'; // Добавляем перенос строки после параграфа
          } else if (element.table && element.table.tableRows) {
            // Обработка таблиц
            content += '\n[TABLE]\n';
            for (const row of element.table.tableRows) {
              if (row.tableCells) {
                for (const cell of row.tableCells) {
                  if (cell.content) {
                    extractTextFromContent(cell.content);
                    content += ' | '; // Разделитель ячеек
                  }
                }
                content += '\n'; // Новая строка таблицы
              }
            }
            content += '[/TABLE]\n';
          } else if (element.sectionBreak) {
            content += '\n[SECTION_BREAK]\n';
          } else if (element.tableOfContents) {
            content += '\n[TABLE_OF_CONTENTS]\n';
          }
        }
      };

      extractTextFromContent(response.data.body.content);
      
      // Очищаем и нормализуем текст
      return content.replace(/\n\s*\n/g, '\n').trim();
    } catch (error: any) {
      console.error(`Error fetching Google Doc content for ${docId}:`, error.message);
      
      // Если документ недоступен, возвращаем null
      if (error.code === 404 || error.code === 403 || error.status === 404 || error.status === 403) {
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