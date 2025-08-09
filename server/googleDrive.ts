import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

export interface DriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  content?: string;
}

export class GoogleDriveService {
  private auth: GoogleAuth;
  private drive: any;
  private docs: any;

  constructor() {
    this.auth = new GoogleAuth({
      scopes: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/documents.readonly'
      ],
      // В production нужно будет настроить service account
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
    });
    
    this.drive = google.drive({ version: 'v3', auth: this.auth });
    this.docs = google.docs({ version: 'v1', auth: this.auth });
  }

  // Извлекает ID файла из Google Drive URL
  extractFileIdFromUrl(url: string): string | null {
    const patterns = [
      /\/d\/([a-zA-Z0-9-_]+)/,
      /id=([a-zA-Z0-9-_]+)/,
      /file\/d\/([a-zA-Z0-9-_]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }

  // Получает информацию о файле
  async getFileInfo(fileId: string): Promise<DriveFileInfo | null> {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id,name,mimeType,webViewLink,permissions'
      });

      return {
        id: response.data.id,
        name: response.data.name,
        mimeType: response.data.mimeType,
        webViewLink: response.data.webViewLink
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      return null;
    }
  }

  // Загружает содержимое документа
  async getDocumentContent(fileId: string): Promise<string | null> {
    try {
      const fileInfo = await this.getFileInfo(fileId);
      if (!fileInfo) return null;

      // Обработка разных типов файлов
      if (fileInfo.mimeType === 'application/vnd.google-apps.document') {
        return await this.getGoogleDocsContent(fileId);
      } else if (fileInfo.mimeType === 'text/plain' || 
                 fileInfo.mimeType === 'application/pdf' ||
                 fileInfo.mimeType.includes('text/')) {
        return await this.getFileContent(fileId);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting document content:', error);
      return null;
    }
  }

  // Получает содержимое Google Docs
  private async getGoogleDocsContent(documentId: string): Promise<string | null> {
    try {
      const response = await this.docs.documents.get({
        documentId: documentId
      });

      const content = response.data.body?.content || [];
      let text = '';

      const extractText = (elements: any[]): string => {
        let result = '';
        for (const element of elements) {
          if (element.paragraph) {
            const paragraphElements = element.paragraph.elements || [];
            for (const paragraphElement of paragraphElements) {
              if (paragraphElement.textRun) {
                result += paragraphElement.textRun.content || '';
              }
            }
          } else if (element.table) {
            // Обработка таблиц
            const rows = element.table.tableRows || [];
            for (const row of rows) {
              const cells = row.tableCells || [];
              for (const cell of cells) {
                result += extractText(cell.content || []);
              }
            }
          }
        }
        return result;
      };

      text = extractText(content);
      return text.trim();
    } catch (error) {
      console.error('Error getting Google Docs content:', error);
      return null;
    }
  }

  // Получает содержимое файла (для текстовых файлов)
  private async getFileContent(fileId: string): Promise<string | null> {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media'
      });

      return response.data;
    } catch (error) {
      console.error('Error getting file content:', error);
      return null;
    }
  }

  // Проверяет доступность файла (публичный или пользователь имеет доступ)
  async checkFileAccess(fileId: string): Promise<boolean> {
    try {
      const fileInfo = await this.getFileInfo(fileId);
      return fileInfo !== null;
    } catch (error) {
      console.error('Error checking file access:', error);
      return false;
    }
  }
}