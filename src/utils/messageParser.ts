import { CodeBlock } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Parse text content to extract code blocks
 * Supported format: ```language\ncode\n```
 */
export const parseCodeBlocks = (content: string): { textContent: string; codeBlocks: CodeBlock[] } => {
  if (!content) {
    return { textContent: '', codeBlocks: [] };
  }

  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)\n```/g;
  const codeBlocks: CodeBlock[] = [];
  let match;
  let lastIndex = 0;
  let textContent = '';

  // Extract all code blocks
  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before this code block
    textContent += content.substring(lastIndex, match.index);
    
    // Add a placeholder for the code block
    textContent += `[Code Block ${codeBlocks.length + 1}]`;
    
    // Save the code block
    codeBlocks.push({
      id: uuidv4(),
      language: match[1] || 'text',
      code: match[2]
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add any remaining text
  textContent += content.substring(lastIndex);

  return { textContent, codeBlocks };
};