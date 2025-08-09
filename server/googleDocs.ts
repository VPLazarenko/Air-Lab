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
      
      const content = await textResponse.text();

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
      
      return {
        id: documentId,
        title: title,
        content: content.trim(),
        lastModified: new Date().toISOString(), // We can't get exact modification time without API
        url: `https://docs.google.com/document/d/${documentId}`,
        exportUrl: this.getExportUrl(documentId, 'txt')
      };
    } catch (error) {
      console.error('Error fetching Google Doc:', error);
      throw new Error(`Failed to fetch document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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