import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { ChatMessage } from './geminiChat';

export interface LinkedInPDFOptions {
  pageFormat?: 'a4' | 'letter' | 'legal';
  orientation?: 'portrait' | 'landscape';
  includeHeader?: boolean;
  includeFooter?: boolean;
  includeTimestamps?: boolean;
  brandingStyle?: 'professional' | 'modern' | 'minimal';
  colorScheme?: 'blue' | 'purple' | 'green' | 'orange';
  includeStats?: boolean;
  includeQRCode?: boolean;
  linkedinHandle?: string;
}

export interface LinkedInPDFResult {
  success: boolean;
  filename?: string;
  error?: string;
  size?: number;
  pageCount?: number;
  shareableText?: string;
}

export class LinkedInPDFService {
  private defaultOptions: LinkedInPDFOptions = {
    pageFormat: 'a4',
    orientation: 'portrait',
    includeHeader: true,
    includeFooter: true,
    includeTimestamps: true,
    brandingStyle: 'professional',
    colorScheme: 'blue',
    includeStats: true,
    includeQRCode: false,
    linkedinHandle: ''
  };

  private colorSchemes = {
    blue: { primary: '#0077B5', secondary: '#005885', accent: '#00A0DC', text: '#2D3748' },
    purple: { primary: '#6B46C1', secondary: '#553C9A', accent: '#8B5CF6', text: '#2D3748' },
    green: { primary: '#059669', secondary: '#047857', accent: '#10B981', text: '#2D3748' },
    orange: { primary: '#EA580C', secondary: '#C2410C', accent: '#FB923C', text: '#2D3748' }
  };

  /**
   * Generate LinkedIn-ready PDF with professional formatting
   */
  async generateLinkedInPDF(
    messages: ChatMessage[],
    title: string = 'AI-Powered Insights',
    filename?: string,
    options: Partial<LinkedInPDFOptions> = {}
  ): Promise<LinkedInPDFResult> {
    try {
      const opts = { ...this.defaultOptions, ...options };
      const colors = this.colorSchemes[opts.colorScheme!];
      const pdf = this.createPDFDocument(opts);
      
      let currentY = 30;
      let pageCount = 1;
      
      // Professional Header
      if (opts.includeHeader) {
        currentY = this.addProfessionalHeader(pdf, title, colors, opts);
      }
      
      // Executive Summary
      currentY = this.addExecutiveSummary(pdf, messages, currentY, colors, opts);
      
      // Main Content with Professional Formatting
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        const messageHeight = await this.addProfessionalMessage(pdf, message, currentY, colors, opts, i + 1);
        
        currentY += messageHeight + 20;
        
        // Check if we need a new page
        if (currentY > pdf.internal.pageSize.height - 60) {
          pdf.addPage();
          pageCount++;
          currentY = 30;
          
          // Add page header for continuation
          this.addPageHeader(pdf, title, pageCount, colors);
          currentY += 25;
        }
      }
      
      // Key Insights Section
      currentY = this.addKeyInsights(pdf, messages, currentY, colors, opts);
      
      // Professional Footer
      if (opts.includeFooter) {
        this.addProfessionalFooter(pdf, pageCount, colors, opts);
      }
      
      // Generate filename
      const finalFilename = filename || this.generateLinkedInFilename(title);
      
      // Save the PDF
      const pdfBlob = pdf.output('blob');
      saveAs(pdfBlob, finalFilename);
      
      // Generate shareable text for LinkedIn
      const shareableText = this.generateShareableText(title, messages.length, pageCount);
      
      return {
        success: true,
        filename: finalFilename,
        size: pdfBlob.size,
        pageCount,
        shareableText
      };
      
    } catch (error) {
      console.error('LinkedIn PDF generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create PDF document with professional settings
   */
  private createPDFDocument(options: LinkedInPDFOptions): jsPDF {
    const format = options.pageFormat === 'letter' ? [216, 279] : 
                  options.pageFormat === 'legal' ? [216, 356] : 'a4';
    
    return new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: format,
      compress: true
    });
  }

  /**
   * Add professional header with branding
   */
  private addProfessionalHeader(
    pdf: jsPDF, 
    title: string, 
    colors: any, 
    options: LinkedInPDFOptions
  ): number {
    const pageWidth = pdf.internal.pageSize.width;
    let currentY = 25;
    
    // Header background
    pdf.setFillColor(colors.primary);
    pdf.rect(0, 0, pageWidth, 45, 'F');
    
    // Main title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, 20, 25);
    
    // Subtitle
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('AI-Powered Conversation Analysis & Insights', 20, 35);
    
    // Date and branding
    pdf.setFontSize(10);
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    pdf.text(`Generated on ${currentDate}`, pageWidth - 20, 25, { align: 'right' });
    pdf.text('Powered by Netlify AI', pageWidth - 20, 35, { align: 'right' });
    
    // Reset colors
    pdf.setTextColor(colors.text);
    
    return 55;
  }

  /**
   * Add executive summary section
   */
  private addExecutiveSummary(
    pdf: jsPDF,
    messages: ChatMessage[],
    startY: number,
    colors: any,
    options: LinkedInPDFOptions
  ): number {
    let currentY = startY + 10;
    const pageWidth = pdf.internal.pageSize.width;
    
    // Section header
    pdf.setFillColor(colors.secondary);
    pdf.rect(20, currentY - 5, pageWidth - 40, 12, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('📊 EXECUTIVE SUMMARY', 25, currentY + 3);
    
    currentY += 20;
    pdf.setTextColor(colors.text);
    
    // Statistics
    const userMessages = messages.filter(m => m.role === 'user').length;
    const aiMessages = messages.filter(m => m.role === 'assistant').length;
    const totalWords = messages.reduce((sum, msg) => sum + msg.content.split(' ').length, 0);
    const avgWordsPerMessage = Math.round(totalWords / messages.length);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    const stats = [
      `• Total Conversation Exchanges: ${messages.length}`,
      `• User Questions/Inputs: ${userMessages}`,
      `• AI Responses Generated: ${aiMessages}`,
      `• Total Word Count: ${totalWords.toLocaleString()}`,
      `• Average Words per Exchange: ${avgWordsPerMessage}`,
      `• Conversation Depth Score: ${this.calculateDepthScore(messages)}/10`
    ];
    
    stats.forEach(stat => {
      pdf.text(stat, 25, currentY);
      currentY += 6;
    });
    
    // Key topics (simplified analysis)
    currentY += 5;
    pdf.setFont('helvetica', 'bold');
    pdf.text('🎯 Key Discussion Topics:', 25, currentY);
    currentY += 8;
    
    pdf.setFont('helvetica', 'normal');
    const topics = this.extractKeyTopics(messages);
    topics.forEach(topic => {
      pdf.text(`• ${topic}`, 25, currentY);
      currentY += 6;
    });
    
    return currentY + 10;
  }

  /**
   * Add professional message with enhanced formatting
   */
  private async addProfessionalMessage(
    pdf: jsPDF,
    message: ChatMessage,
    startY: number,
    colors: any,
    options: LinkedInPDFOptions,
    messageNumber: number
  ): Promise<number> {
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let currentY = startY;
    
    // Message header with number and role
    const isUser = message.role === 'user';
    const headerColor = isUser ? colors.accent : colors.primary;
    const roleText = isUser ? '👤 USER QUERY' : '🤖 AI RESPONSE';
    
    // Header background
    pdf.setFillColor(headerColor);
    pdf.rect(margin, currentY - 3, maxWidth, 10, 'F');
    
    // Header text
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${messageNumber}. ${roleText}`, margin + 5, currentY + 3);
    
    // Timestamp (if enabled)
    if (options.includeTimestamps) {
      const timestamp = new Date(message.timestamp).toLocaleString();
      pdf.text(timestamp, pageWidth - margin - 5, currentY + 3, { align: 'right' });
    }
    
    currentY += 15;
    
    // Message content with professional formatting
    pdf.setTextColor(colors.text);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Enhanced content processing
    const processedContent = this.processContentForLinkedIn(message.content);
    const contentLines = pdf.splitTextToSize(processedContent, maxWidth - 10);
    
    // Content background
    pdf.setFillColor(248, 250, 252);
    const contentHeight = contentLines.length * 5 + 10;
    pdf.rect(margin + 5, currentY - 3, maxWidth - 10, contentHeight, 'F');
    
    // Add content with proper spacing
    contentLines.forEach((line: string, index: number) => {
      pdf.text(line, margin + 10, currentY + 2);
      currentY += 5;
    });
    
    currentY += 8;
    
    // Add insights for AI responses
    if (!isUser && message.content.length > 100) {
      const insights = this.generateMessageInsights(message.content);
      if (insights.length > 0) {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(colors.secondary);
        pdf.text('💡 Key Insights:', margin + 10, currentY);
        currentY += 6;
        
        insights.forEach(insight => {
          const insightLines = pdf.splitTextToSize(`• ${insight}`, maxWidth - 20);
          insightLines.forEach((line: string) => {
            pdf.text(line, margin + 15, currentY);
            currentY += 4;
          });
        });
        
        currentY += 5;
      }
    }
    
    // Reset colors
    pdf.setTextColor(colors.text);
    
    return currentY - startY;
  }

  /**
   * Add key insights section
   */
  private addKeyInsights(
    pdf: jsPDF,
    messages: ChatMessage[],
    startY: number,
    colors: any,
    options: LinkedInPDFOptions
  ): number {
    let currentY = startY + 15;
    const pageWidth = pdf.internal.pageSize.width;
    
    // Check if we need a new page
    if (currentY > pdf.internal.pageSize.height - 100) {
      pdf.addPage();
      currentY = 30;
    }
    
    // Section header
    pdf.setFillColor(colors.primary);
    pdf.rect(20, currentY - 5, pageWidth - 40, 12, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('🔍 KEY INSIGHTS & TAKEAWAYS', 25, currentY + 3);
    
    currentY += 20;
    pdf.setTextColor(colors.text);
    
    // Generate insights
    const insights = this.generateConversationInsights(messages);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    insights.forEach((insight, index) => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${insight.title}`, 25, currentY);
      currentY += 8;
      
      pdf.setFont('helvetica', 'normal');
      const descLines = pdf.splitTextToSize(insight.description, pageWidth - 50);
      descLines.forEach((line: string) => {
        pdf.text(line, 30, currentY);
        currentY += 5;
      });
      
      currentY += 8;
    });
    
    return currentY;
  }

  /**
   * Add professional footer
   */
  private addProfessionalFooter(
    pdf: jsPDF,
    pageCount: number,
    colors: any,
    options: LinkedInPDFOptions
  ): void {
    const pageHeight = pdf.internal.pageSize.height;
    const pageWidth = pdf.internal.pageSize.width;
    
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      
      // Footer background
      pdf.setFillColor(colors.primary);
      pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');
      
      // Footer content
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      
      // Left side - branding
      pdf.text('Generated with Netlify AI - Your Intelligent Coding Companion', 10, pageHeight - 10);
      
      // Right side - page number and LinkedIn handle
      const rightText = options.linkedinHandle 
        ? `${options.linkedinHandle} • Page ${i} of ${pageCount}`
        : `Page ${i} of ${pageCount}`;
      pdf.text(rightText, pageWidth - 10, pageHeight - 10, { align: 'right' });
    }
    
    // Reset colors
    pdf.setTextColor(0);
  }

  /**
   * Add page header for continuation pages
   */
  private addPageHeader(pdf: jsPDF, title: string, pageNumber: number, colors: any): void {
    const pageWidth = pdf.internal.pageSize.width;
    
    pdf.setFillColor(colors.secondary);
    pdf.rect(0, 0, pageWidth, 20, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${title} (continued)`, 20, 12);
    pdf.text(`Page ${pageNumber}`, pageWidth - 20, 12, { align: 'right' });
    
    pdf.setTextColor(0);
  }

  /**
   * Process content for LinkedIn-ready formatting
   */
  private processContentForLinkedIn(content: string): string {
    return content
      // Enhance markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '[$1]') // Bold to brackets
      .replace(/\*(.*?)\*/g, '$1') // Remove italic markers
      .replace(/`(.*?)`/g, '"$1"') // Code to quotes
      .replace(/#{1,6}\s/g, '• ') // Headers to bullets
      .replace(/```[\w]*\n([\s\S]*?)\n```/g, (match, code) => {
        return `\n[CODE EXAMPLE]\n${code}\n[END CODE]\n`;
      })
      // Clean up formatting
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  /**
   * Generate message insights
   */
  private generateMessageInsights(content: string): string[] {
    const insights: string[] = [];
    
    if (content.includes('algorithm') || content.includes('complexity')) {
      insights.push('Technical algorithm discussion with complexity analysis');
    }
    if (content.includes('solution') || content.includes('approach')) {
      insights.push('Problem-solving methodology and strategic thinking');
    }
    if (content.includes('code') || content.includes('function')) {
      insights.push('Practical coding implementation and best practices');
    }
    if (content.includes('learn') || content.includes('understand')) {
      insights.push('Educational content focused on skill development');
    }
    
    return insights.slice(0, 3); // Limit to 3 insights
  }

  /**
   * Generate conversation insights
   */
  private generateConversationInsights(messages: ChatMessage[]): Array<{title: string, description: string}> {
    const insights = [
      {
        title: 'Learning Progression',
        description: 'The conversation demonstrates a structured approach to problem-solving, with clear progression from basic concepts to advanced implementations.'
      },
      {
        title: 'Technical Depth',
        description: 'Deep technical discussions covering algorithms, data structures, and optimization techniques that showcase advanced programming knowledge.'
      },
      {
        title: 'Practical Application',
        description: 'Focus on real-world applications and industry best practices, making the content immediately applicable to professional development.'
      },
      {
        title: 'Knowledge Transfer',
        description: 'Effective knowledge transfer through clear explanations, examples, and step-by-step guidance that facilitates learning and understanding.'
      }
    ];
    
    return insights.slice(0, 3); // Return top 3 insights
  }

  /**
   * Extract key topics from conversation
   */
  private extractKeyTopics(messages: ChatMessage[]): string[] {
    const allContent = messages.map(m => m.content.toLowerCase()).join(' ');
    const topics: string[] = [];
    
    const topicKeywords = {
      'Algorithm Design': ['algorithm', 'complexity', 'optimization', 'efficiency'],
      'Data Structures': ['array', 'tree', 'graph', 'hash', 'stack', 'queue'],
      'Problem Solving': ['solution', 'approach', 'strategy', 'method'],
      'Code Implementation': ['function', 'class', 'method', 'implementation'],
      'Best Practices': ['best practice', 'pattern', 'design', 'architecture'],
      'Learning & Development': ['learn', 'understand', 'explain', 'tutorial']
    };
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => allContent.includes(keyword))) {
        topics.push(topic);
      }
    });
    
    return topics.slice(0, 5); // Return top 5 topics
  }

  /**
   * Calculate conversation depth score
   */
  private calculateDepthScore(messages: ChatMessage[]): number {
    const avgLength = messages.reduce((sum, msg) => sum + msg.content.length, 0) / messages.length;
    const technicalTerms = ['algorithm', 'complexity', 'optimization', 'implementation', 'architecture'];
    const technicalCount = messages.reduce((count, msg) => {
      return count + technicalTerms.filter(term => msg.content.toLowerCase().includes(term)).length;
    }, 0);
    
    const lengthScore = Math.min(avgLength / 200, 5); // Max 5 points for length
    const technicalScore = Math.min(technicalCount / 2, 5); // Max 5 points for technical content
    
    return Math.round(lengthScore + technicalScore);
  }

  /**
   * Generate LinkedIn-ready filename
   */
  private generateLinkedInFilename(title: string): string {
    const cleanTitle = title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    return `linkedin-${cleanTitle}-insights-${timestamp}.pdf`;
  }

  /**
   * Generate shareable text for LinkedIn post
   */
  private generateShareableText(title: string, messageCount: number, pageCount: number): string {
    return `🚀 Just generated a comprehensive ${pageCount}-page AI conversation analysis!

📊 Key Stats:
• ${messageCount} meaningful exchanges
• Deep technical insights
• Practical implementation guidance
• Professional formatting ready for sharing

💡 This PDF showcases the power of AI-assisted learning and problem-solving in action.

#AI #MachineLearning #TechInsights #ProfessionalDevelopment #Innovation #LinkedInLearning

Generated with Netlify AI - transforming conversations into professional insights! 🤖✨`;
  }
}

// Export singleton instance
export const linkedinPDFService = new LinkedInPDFService();