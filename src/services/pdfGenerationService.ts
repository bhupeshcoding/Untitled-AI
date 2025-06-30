import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { ChatMessage } from './geminiChat';

export interface PDFGenerationOptions {
  pageFormat?: 'a4' | 'letter' | 'legal';
  orientation?: 'portrait' | 'landscape';
  margin?: number;
  includeTimestamps?: boolean;
  includeMetadata?: boolean;
  includeHeader?: boolean;
  includeFooter?: boolean;
  compression?: boolean;
  quality?: number;
  maxWidth?: number;
}

export interface PDFGenerationResult {
  success: boolean;
  filename?: string;
  error?: string;
  size?: number;
  pageCount?: number;
}

export class PDFGenerationService {
  private defaultOptions: PDFGenerationOptions = {
    pageFormat: 'letter',
    orientation: 'portrait',
    margin: 20,
    includeTimestamps: true,
    includeMetadata: false,
    includeHeader: false,
    includeFooter: false,
    compression: true,
    quality: 0.8,
    maxWidth: 170
  };

  /**
   * Generate clean PDF from chat messages without background information
   */
  async generatePDF(
    messages: ChatMessage[],
    title: string = 'AI Conversation',
    filename?: string,
    options: Partial<PDFGenerationOptions> = {}
  ): Promise<PDFGenerationResult> {
    try {
      const opts = { ...this.defaultOptions, ...options };
      const pdf = this.createPDFDocument(opts);
      
      // Start with content immediately - no title page
      let currentY = opts.margin! + 20;
      let pageCount = 1;
      
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        const messageHeight = await this.addMessageToPDF(pdf, message, currentY, opts);
        
        currentY += messageHeight + 15;
        
        // Check if we need a new page
        if (currentY > pdf.internal.pageSize.height - opts.margin! - 20) {
          pdf.addPage();
          pageCount++;
          currentY = opts.margin! + 20;
        }
      }
      
      // Only add footers if explicitly requested
      if (opts.includeFooter) {
        this.addFooters(pdf, pageCount, opts);
      }
      
      // Generate filename
      const finalFilename = filename || this.generateFilename(title);
      
      // Save the PDF
      const pdfBlob = pdf.output('blob');
      saveAs(pdfBlob, finalFilename);
      
      return {
        success: true,
        filename: finalFilename,
        size: pdfBlob.size,
        pageCount
      };
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Generate PDF from HTML element
   */
  async generatePDFFromElement(
    element: HTMLElement,
    filename: string,
    options: Partial<PDFGenerationOptions> = {}
  ): Promise<PDFGenerationResult> {
    try {
      const opts = { ...this.defaultOptions, ...options };
      
      // Convert HTML to canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png', opts.quality);
      const pdf = this.createPDFDocument(opts);
      
      // Calculate dimensions
      const imgWidth = opts.maxWidth!;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.height - (opts.margin! * 2);
      
      let heightLeft = imgHeight;
      let position = opts.margin!;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', opts.margin!, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      let pageCount = 1;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + opts.margin!;
        pdf.addPage();
        pageCount++;
        pdf.addImage(imgData, 'PNG', opts.margin!, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Save the PDF
      const pdfBlob = pdf.output('blob');
      saveAs(pdfBlob, filename);
      
      return {
        success: true,
        filename,
        size: pdfBlob.size,
        pageCount
      };
      
    } catch (error) {
      console.error('PDF generation from element failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate PDF from element'
      };
    }
  }

  /**
   * Create PDF document with specified options
   */
  private createPDFDocument(options: PDFGenerationOptions): jsPDF {
    const format = options.pageFormat === 'letter' ? [216, 279] : 
                  options.pageFormat === 'legal' ? [216, 356] : 'a4';
    
    return new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: format,
      compress: options.compression
    });
  }

  /**
   * Add a message to the PDF with minimal formatting
   */
  private async addMessageToPDF(
    pdf: jsPDF,
    message: ChatMessage,
    startY: number,
    options: PDFGenerationOptions
  ): Promise<number> {
    const margin = options.margin!;
    const pageWidth = pdf.internal.pageSize.width;
    const maxWidth = pageWidth - (margin * 2);
    let currentY = startY;
    
    // Message header - simplified
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    
    const sender = message.role === 'user' ? 'You' : 'Netlify AI';
    let headerText = sender;
    
    // Only add timestamp if explicitly requested
    if (options.includeTimestamps) {
      const timestamp = new Date(message.timestamp).toLocaleString();
      headerText += ` - ${timestamp}`;
    }
    
    pdf.text(headerText, margin, currentY);
    currentY += 8;
    
    // Message content - clean and simple
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    
    // Clean content for PDF - minimal processing
    const cleanContent = this.cleanContentForPDF(message.content);
    const contentLines = pdf.splitTextToSize(cleanContent, maxWidth);
    
    // Add content with proper line spacing
    contentLines.forEach((line: string) => {
      pdf.text(line, margin, currentY);
      currentY += 5;
    });
    
    return currentY - startY;
  }

  /**
   * Clean content for PDF generation - minimal processing
   */
  private cleanContentForPDF(content: string): string {
    return content
      // Remove markdown formatting but keep structure
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1') // Italic
      .replace(/`(.*?)`/g, '$1') // Inline code
      .replace(/#{1,6}\s/g, '') // Headers
      .replace(/```[\w]*\n([\s\S]*?)\n```/g, (match, code) => {
        return `\n${code}\n`;
      })
      // Keep emojis and special characters as they are
      // Clean up extra whitespace
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  /**
   * Add minimal footers (only if requested)
   */
  private addFooters(pdf: jsPDF, pageCount: number, options: PDFGenerationOptions): void {
    const pageHeight = pdf.internal.pageSize.height;
    const pageWidth = pdf.internal.pageSize.width;
    const margin = options.margin!;
    
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      
      // Simple page number only
      pdf.setFontSize(8);
      pdf.setTextColor(100);
      pdf.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - margin - 15,
        pageHeight - margin - 5
      );
    }
    
    // Reset colors
    pdf.setTextColor(0);
  }

  /**
   * Generate simple filename
   */
  private generateFilename(title: string): string {
    const cleanTitle = title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    return `${cleanTitle}-${timestamp}.pdf`;
  }

  /**
   * Validate messages before PDF generation
   */
  validateMessages(messages: ChatMessage[]): { valid: boolean; error?: string } {
    if (!messages || messages.length === 0) {
      return { valid: false, error: 'No messages to export' };
    }

    if (messages.length > 1000) {
      return { valid: false, error: 'Too many messages. Please limit to 1000 messages per PDF.' };
    }

    return { valid: true };
  }

  /**
   * Estimate PDF size before generation
   */
  estimatePDFSize(messages: ChatMessage[]): { estimatedPages: number; estimatedSize: string } {
    const avgCharsPerPage = 2500; // Increased since we're removing headers/footers
    const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    const estimatedPages = Math.ceil(totalChars / avgCharsPerPage);
    const estimatedSize = `${Math.round(estimatedPages * 30)}KB - ${Math.round(estimatedPages * 60)}KB`;
    
    return { estimatedPages, estimatedSize };
  }
}

// Export singleton instance
export const pdfGenerationService = new PDFGenerationService();