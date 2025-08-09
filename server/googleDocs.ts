// Удалена зависимость от googleapis, используем fetch для работы с публичными документами

export interface GoogleDocInfo {
  id: string;
  title: string;
  content?: string;
}

export class GoogleDocsService {
  constructor() {
    console.log('GoogleDocsService initialized for public document access');
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

  // Получает информацию о Google Doc документе через публичный экспорт
  async getDocInfo(docId: string): Promise<GoogleDocInfo | null> {
    try {
      // Для публичных документов можем попробовать получить заголовок через HTTP запрос
      const publicUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
      
      const response = await fetch(publicUrl, {
        method: 'HEAD',
        follow: 0 // Не следуем редиректам
      });

      if (response.status === 200) {
        // Документ доступен публично
        return {
          id: docId,
          title: `Google Docs Document ${docId}` // Базовое название, так как заголовок сложно извлечь без API
        };
      } else {
        console.log(`Document ${docId} is not publicly accessible (status: ${response.status})`);
        return null;
      }
    } catch (error: any) {
      console.error(`Error checking Google Doc accessibility for ${docId}:`, error.message);
      return null;
    }
  }

  // Получает полное содержимое Google Doc документа через публичный экспорт
  async getDocumentContent(docId: string): Promise<string | null> {
    try {
      // Используем публичный экспорт в текстовом формате
      const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
      
      const response = await fetch(exportUrl);
      
      if (!response.ok) {
        console.log(`Failed to fetch document content: ${response.status} ${response.statusText}`);
        return null;
      }

      const content = await response.text();
      
      if (!content || content.trim().length === 0) {
        console.log(`Document ${docId} appears to be empty`);
        return null;
      }

      // Очищаем и нормализуем текст
      return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
      
    } catch (error: any) {
      console.error(`Error fetching Google Doc content for ${docId}:`, error.message);
      return null;
    }
  }

  // Проверяет доступность документа через публичный экспорт
  async isDocumentAccessible(docId: string): Promise<boolean> {
    try {
      const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
      const response = await fetch(exportUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error: any) {
      console.error(`Document ${docId} not accessible:`, error.message);
      return false;
    }
  }
}