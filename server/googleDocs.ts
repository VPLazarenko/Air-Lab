import { aiAnalyzer } from './aiAnalyzer';

export class GoogleDocsService {
  constructor() {}

  // Extract document ID from various Google Docs URL formats
  private extractDocumentId(url: string): string | null {
    const patterns = [
      /\/document\/d\/([a-zA-Z0-9-_]+)/,
      /docs\.google\.com\/document\/d\/([a-zA-Z0-9-_]+)/,
      /drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    // If it's already just an ID
    if (/^[a-zA-Z0-9-_]+$/.test(url)) {
      return url;
    }

    return null;
  }

  // Convert Google Docs URL to export URL for plain text
  private getExportUrl(documentId: string, format: 'txt' | 'html' = 'txt'): string {
    return `https://docs.google.com/document/d/${documentId}/export?format=${format}`;
  }

  // Check if document is publicly accessible
  private async isDocumentPublic(documentId: string): Promise<boolean> {
    try {
      const response = await fetch(this.getExportUrl(documentId, 'txt'), {
        method: 'HEAD'
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Get document content by URL or ID (public documents only)
  async getDocument(urlOrId: string) {
    try {
      const documentId = this.extractDocumentId(urlOrId);
      if (!documentId) {
        throw new Error('Invalid Google Docs URL or document ID');
      }

      // Check if document is publicly accessible
      const isPublic = await this.isDocumentPublic(documentId);
      if (!isPublic) {
        throw new Error('Document is not publicly accessible. Please make sure the document is shared publicly or with "Anyone with the link can view" permission.');
      }

      // Fetch document content as plain text
      const textResponse = await fetch(this.getExportUrl(documentId, 'txt'));
      if (!textResponse.ok) {
        throw new Error('Failed to fetch document content');
      }
      
      const fullContent = await textResponse.text().then(text => text.trim());

      // Try to get document title from HTML export (more reliable for metadata)
      let title = `Document ${documentId}`;
      try {
        const htmlResponse = await fetch(this.getExportUrl(documentId, 'html'));
        if (htmlResponse.ok) {
          const html = await htmlResponse.text();
          const titleMatch = html.match(/<title>(.*?)<\/title>/);
          if (titleMatch && titleMatch[1]) {
            title = titleMatch[1].replace(' - Google Docs', '').trim();
          }
        }
      } catch {
        // If HTML fetch fails, keep default title
      }

      // Extract key information using AI analysis instead of storing full content
      const keyInfo = await aiAnalyzer.analyzeDocument(fullContent, title);
      
      return {
        id: documentId,
        title: title,
        content: fullContent, // Keep original for preview
        keyInformation: keyInfo, // Processed summary for storage
        lastModified: new Date().toISOString(),
        url: `https://docs.google.com/document/d/${documentId}`,
        exportUrl: this.getExportUrl(documentId, 'txt')
      };
    } catch (error) {
      console.error('Error fetching Google Doc:', error);
      throw new Error(`Failed to fetch document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Extract key information from document content using AI analysis
  async extractKeyInformation(content: string, title: string): Promise<{
    summary: string;
    keyPoints: string[];
    topics: string[];
    metadata: {
      wordCount: number;
      estimatedReadTime: number;
      documentType: string;
    };
  }> {
    try {
      // Basic text analysis
      const wordCount = content.split(/\s+/).length;
      const estimatedReadTime = Math.ceil(wordCount / 200); // 200 words per minute

      // Determine document type based on content patterns
      let documentType = 'general';
      if (content.toLowerCase().includes('meeting') || content.toLowerCase().includes('agenda')) {
        documentType = 'meeting';
      } else if (content.toLowerCase().includes('requirement') || content.toLowerCase().includes('specification')) {
        documentType = 'specification';
      } else if (content.toLowerCase().includes('report') || content.toLowerCase().includes('analysis')) {
        documentType = 'report';
      } else if (content.toLowerCase().includes('proposal') || content.toLowerCase().includes('plan')) {
        documentType = 'plan';
      }

      // Extract key sentences (first and last paragraphs, sentences with keywords)
      const paragraphs = content.split('\n\n').filter(p => p.trim().length > 20);
      const keyParagraphs = [];
      
      if (paragraphs.length > 0) {
        keyParagraphs.push(paragraphs[0]); // First paragraph
        if (paragraphs.length > 1) {
          keyParagraphs.push(paragraphs[paragraphs.length - 1]); // Last paragraph
        }
      }

      // Extract sentences with important keywords
      const importantKeywords = ['важно', 'главное', 'цель', 'задача', 'результат', 'выводы', 'решение', 
                               'important', 'main', 'goal', 'objective', 'result', 'conclusion', 'decision',
                               'ключевые', 'основные', 'принципы', 'требования', 'критерии'];
      
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
      const keyContainingSentences = sentences.filter(sentence => 
        importantKeywords.some(keyword => 
          sentence.toLowerCase().includes(keyword.toLowerCase())
        )
      ).slice(0, 3); // Top 3 key sentences

      // Create summary from key paragraphs and sentences
      const summaryParts = [...keyParagraphs, ...keyContainingSentences];
      const summary = summaryParts.join('\n').substring(0, 500) + '...';

      // Extract potential topics/tags
      const topics = this.extractTopics(content);

      // Generate key points
      const keyPoints = this.extractKeyPoints(content);

      return {
        summary,
        keyPoints: keyPoints.slice(0, 5), // Top 5 key points
        topics: topics.slice(0, 8), // Top 8 topics
        metadata: {
          wordCount,
          estimatedReadTime,
          documentType
        }
      };
    } catch (error) {
      console.error('Error extracting key information:', error);
      // Fallback to basic extraction
      return {
        summary: content.substring(0, 300) + '...',
        keyPoints: [title],
        topics: ['document'],
        metadata: {
          wordCount: content.split(/\s+/).length,
          estimatedReadTime: Math.ceil(content.split(/\s+/).length / 200),
          documentType: 'general'
        }
      };
    }
  }

  // Extract topics/tags from content
  private extractTopics(content: string): string[] {
    const text = content.toLowerCase();
    const commonTopics = [
      'проект', 'планирование', 'разработка', 'дизайн', 'техническое', 'документация',
      'meeting', 'project', 'planning', 'development', 'design', 'technical', 'documentation',
      'бизнес', 'стратегия', 'анализ', 'исследование', 'отчет', 'презентация',
      'business', 'strategy', 'analysis', 'research', 'report', 'presentation',
      'управление', 'процесс', 'workflow', 'задачи', 'цели', 'результаты',
      'management', 'process', 'tasks', 'goals', 'results', 'requirements'
    ];

    return commonTopics.filter(topic => text.includes(topic));
  }

  // Extract key points from content
  private extractKeyPoints(content: string): string[] {
    const points = [];
    
    // Look for numbered lists
    const numberedLists = content.match(/\d+[\.\)]\s+[^\n]+/g);
    if (numberedLists) {
      points.push(...numberedLists.slice(0, 3));
    }

    // Look for bullet points
    const bulletPoints = content.match(/[-•*]\s+[^\n]+/g);
    if (bulletPoints) {
      points.push(...bulletPoints.slice(0, 3));
    }

    // Look for headers (lines that are shorter and might be titles)
    const lines = content.split('\n').filter(line => line.trim().length > 5);
    const potentialHeaders = lines.filter(line => 
      line.length < 80 && 
      line.length > 10 && 
      !line.includes('.') && 
      line.trim() === line.trim().toUpperCase() ||
      line.includes(':')
    );
    
    if (potentialHeaders.length > 0) {
      points.push(...potentialHeaders.slice(0, 2));
    }

    return points.map(point => point.trim()).filter(point => point.length > 0);
  }

  // Validate and parse multiple document URLs
  async validateDocuments(urls: string[]) {
    const results = [];
    
    for (const url of urls) {
      try {
        const documentId = this.extractDocumentId(url);
        if (!documentId) {
          results.push({
            url,
            valid: false,
            error: 'Invalid URL format'
          });
          continue;
        }

        const isPublic = await this.isDocumentPublic(documentId);
        results.push({
          url,
          documentId,
          valid: isPublic,
          error: isPublic ? null : 'Document not publicly accessible'
        });
      } catch (error) {
        results.push({
          url,
          valid: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  // Get multiple documents by URLs
  async getMultipleDocuments(urls: string[]) {
    const documents = [];
    
    for (const url of urls) {
      try {
        const doc = await this.getDocument(url);
        documents.push({
          ...doc,
          success: true
        });
      } catch (error) {
        documents.push({
          url,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return documents;
  }

  // Generate shareable link for a document
  getShareableLink(documentId: string): string {
    return `https://docs.google.com/document/d/${documentId}/edit`;
  }

  // Get document preview link
  getPreviewLink(documentId: string): string {
    return `https://docs.google.com/document/d/${documentId}/preview`;
  }

  // Check if URL is a valid Google Docs link
  isValidGoogleDocsUrl(url: string): boolean {
    return this.extractDocumentId(url) !== null;
  }
}

export const googleDocsService = new GoogleDocsService();