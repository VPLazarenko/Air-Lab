import OpenAI from 'openai';

export class AIAnalyzer {
  private openai: OpenAI | null = null;

  setApiKey(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  // Use OpenAI to analyze document and extract key information
  async analyzeDocument(content: string, title: string): Promise<{
    summary: string;
    keyPoints: string[];
    topics: string[];
    metadata: {
      wordCount: number;
      estimatedReadTime: number;
      documentType: string;
      importance: 'high' | 'medium' | 'low';
    };
  }> {
    if (!this.openai) {
      // Fallback to basic analysis if no API key
      return this.basicAnalysis(content, title);
    }

    try {
      const prompt = `Analyze the following document and extract key information in a structured format.

Document Title: "${title}"
Content: "${content.substring(0, 4000)}" ${content.length > 4000 ? '...(truncated)' : ''}

Please provide:
1. A concise summary (2-3 sentences max)
2. Top 5 key points or main ideas
3. Relevant topics/tags (max 8)
4. Document type classification
5. Overall importance level

Respond in JSON format:
{
  "summary": "Brief summary here",
  "keyPoints": ["point 1", "point 2", ...],
  "topics": ["topic1", "topic2", ...],
  "documentType": "meeting|report|plan|specification|general|proposal",
  "importance": "high|medium|low"
}`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert document analyzer. Extract key information efficiently and provide structured, concise outputs. Focus on the most important content to minimize storage needs."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.3
      });

      const aiResult = response.choices[0]?.message?.content;
      if (aiResult) {
        try {
          const parsed = JSON.parse(aiResult);
          
          return {
            summary: parsed.summary || '',
            keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints.slice(0, 5) : [],
            topics: Array.isArray(parsed.topics) ? parsed.topics.slice(0, 8) : [],
            metadata: {
              wordCount: content.split(/\s+/).length,
              estimatedReadTime: Math.ceil(content.split(/\s+/).length / 200),
              documentType: parsed.documentType || 'general',
              importance: parsed.importance || 'medium'
            }
          };
        } catch (parseError) {
          console.log('Failed to parse AI response, using basic analysis');
          return this.basicAnalysis(content, title);
        }
      }
      
      return this.basicAnalysis(content, title);
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.basicAnalysis(content, title);
    }
  }

  // Fallback basic analysis method
  private basicAnalysis(content: string, title: string): {
    summary: string;
    keyPoints: string[];
    topics: string[];
    metadata: {
      wordCount: number;
      estimatedReadTime: number;
      documentType: string;
      importance: 'high' | 'medium' | 'low';
    };
  } {
    const wordCount = content.split(/\s+/).length;
    const estimatedReadTime = Math.ceil(wordCount / 200);

    // Basic document type detection
    let documentType = 'general';
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('meeting') || lowerContent.includes('agenda')) {
      documentType = 'meeting';
    } else if (lowerContent.includes('requirement') || lowerContent.includes('specification')) {
      documentType = 'specification';
    } else if (lowerContent.includes('report') || lowerContent.includes('analysis')) {
      documentType = 'report';
    } else if (lowerContent.includes('proposal') || lowerContent.includes('plan')) {
      documentType = 'plan';
    }

    // Basic importance assessment
    let importance: 'high' | 'medium' | 'low' = 'medium';
    if (wordCount > 2000 || lowerContent.includes('critical') || lowerContent.includes('urgent')) {
      importance = 'high';
    } else if (wordCount < 500) {
      importance = 'low';
    }

    // Extract first few sentences as summary
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const summary = sentences.slice(0, 2).join('. ').substring(0, 300) + (sentences.length > 2 ? '...' : '');

    // Extract basic key points from structure
    const keyPoints = [];
    const numberedLists = content.match(/\d+[\.\)]\s+[^\n]+/g);
    if (numberedLists) {
      keyPoints.push(...numberedLists.slice(0, 3));
    }
    
    const bulletPoints = content.match(/[-•*]\s+[^\n]+/g);
    if (bulletPoints) {
      keyPoints.push(...bulletPoints.slice(0, 2));
    }

    if (keyPoints.length === 0) {
      keyPoints.push(title);
    }

    // Basic topic extraction
    const topics = this.extractBasicTopics(content);

    return {
      summary,
      keyPoints: keyPoints.slice(0, 5),
      topics: topics.slice(0, 8),
      metadata: {
        wordCount,
        estimatedReadTime,
        documentType,
        importance
      }
    };
  }

  private extractBasicTopics(content: string): string[] {
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
}

export const aiAnalyzer = new AIAnalyzer();