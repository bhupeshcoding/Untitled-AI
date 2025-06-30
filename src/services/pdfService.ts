import { ChatMessage } from './geminiChat';

export interface PDFAnalysisResult {
  summary: string;
  keyPoints: string[];
  wordCount: number;
  pageCount: number;
  topics: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  complexity?: 'low' | 'medium' | 'high';
}

export interface PDFProcessingOptions {
  generateSummary: boolean;
  extractKeyPoints: boolean;
  analyzeSentiment: boolean;
  detectTopics: boolean;
  maxSummaryLength?: number;
}

class PDFService {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = '/api') {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Extract text content from PDF file
   */
  async extractTextFromPDF(file: File): Promise<{ text: string; pageCount: number }> {
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch(`${this.apiBaseUrl}/pdf/extract`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`PDF extraction failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        text: result.text,
        pageCount: result.pageCount
      };
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive analysis of PDF content
   */
  async analyzePDF(
    file: File, 
    options: PDFProcessingOptions = { generateSummary: true, extractKeyPoints: true, analyzeSentiment: false, detectTopics: true }
  ): Promise<PDFAnalysisResult> {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('options', JSON.stringify(options));

    try {
      const response = await fetch(`${this.apiBaseUrl}/pdf/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`PDF analysis failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing PDF:', error);
      throw error;
    }
  }

  /**
   * Generate summary using AI
   */
  async generateSummary(text: string, maxLength: number = 500): Promise<string> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          maxLength,
          type: 'document'
        }),
      });

      if (!response.ok) {
        throw new Error(`Summarization failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      throw error;
    }
  }

  /**
   * Stream summary generation for real-time updates
   */
  async *streamSummary(text: string): AsyncGenerator<string, void, unknown> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai/summarize/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Stream summarization failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.token) {
                  yield data.token;
                } else if (data.done) {
                  return;
                }
              } catch (e) {
                console.warn('Failed to parse SSE data:', line);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Error streaming summary:', error);
      throw error;
    }
  }

  /**
   * Extract key points from document
   */
  async extractKeyPoints(text: string, maxPoints: number = 5): Promise<string[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai/extract-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          maxPoints
        }),
      });

      if (!response.ok) {
        throw new Error(`Key point extraction failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.keyPoints;
    } catch (error) {
      console.error('Error extracting key points:', error);
      throw error;
    }
  }

  /**
   * Detect topics in the document
   */
  async detectTopics(text: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai/detect-topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Topic detection failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.topics;
    } catch (error) {
      console.error('Error detecting topics:', error);
      throw error;
    }
  }

  /**
   * Convert PDF analysis to chat message format
   */
  convertAnalysisToMessage(analysis: PDFAnalysisResult, fileName: string): ChatMessage {
    const content = `# 📄 PDF Analysis: ${fileName}

## 📊 Document Overview
- **Pages:** ${analysis.pageCount}
- **Words:** ${analysis.wordCount.toLocaleString()}
- **Complexity:** ${analysis.complexity || 'Medium'}

## 🎯 Key Summary
${analysis.summary}

## 💡 Key Points
${analysis.keyPoints.map((point, index) => `${index + 1}. ${point}`).join('\n')}

## 🏷️ Topics Identified
${analysis.topics.map(topic => `• ${topic}`).join('\n')}

${analysis.sentiment ? `\n## 😊 Document Sentiment\n**${analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1)}** tone detected` : ''}

---
*Analysis powered by Netlify AI 🤖*`;

    return {
      role: 'assistant',
      content,
      timestamp: Date.now(),
      messageId: `pdf_analysis_${Date.now()}`
    };
  }

  /**
   * Validate PDF file
   */
  validatePDFFile(file: File, maxSizeMB: number = 10): { valid: boolean; error?: string } {
    // Check file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return { valid: false, error: 'File must be a PDF document' };
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
    }

    // Check if file is empty
    if (file.size === 0) {
      return { valid: false, error: 'File cannot be empty' };
    }

    return { valid: true };
  }

  /**
   * Get file information
   */
  getFileInfo(file: File) {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified),
      sizeFormatted: this.formatFileSize(file.size)
    };
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const pdfService = new PDFService();
export default PDFService;