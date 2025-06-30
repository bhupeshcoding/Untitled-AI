/**
 * API Configuration for Netlify AI
 * Centralized configuration for all AI services and API endpoints
 * Mission: Supporting everyone's coding journey to make the world better
 */

export interface APIConfig {
  googleAI: {
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
  };
  openAI?: {
    apiKey: string;
    model: string;
  };
  huggingFace?: {
    token: string;
  };
  server: {
    baseUrl: string;
  };
}

// Validate required environment variables
const validateEnvVar = (key: string, value: string | undefined): string => {
  if (!value) {
    console.warn(`⚠️ Environment variable ${key} is not set. Some features may not work.`);
    return '';
  }
  return value;
};

// API Configuration - Powering Real-World Impact
export const apiConfig: APIConfig = {
  googleAI: {
    apiKey: validateEnvVar('VITE_GOOGLE_AI_API_KEY', import.meta.env.VITE_GOOGLE_AI_API_KEY),
    model: 'gemini-2.0-flash-exp', // Latest and most capable model
    temperature: 0.7, // Balanced creativity and accuracy
    maxTokens: 3000, // Generous token limit for detailed explanations
  },
  openAI: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    model: 'gpt-4',
  },
  huggingFace: {
    token: import.meta.env.VITE_HUGGING_FACE_TOKEN || '',
  },
  server: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  },
};

// System prompts designed to maximize learning and real-world impact
export const systemPrompts = {
  default: `You are Netlify AI, an intelligent coding companion helping developers worldwide master programming and create positive impact through technology.

Core mission: Help developers build skills that can change the world through practical guidance, clear explanations, and encouragement.

Key principles:
- Provide actionable coding guidance and break down complex concepts
- Inspire continuous learning and offer encouragement during challenges
- Share real-world examples and industry best practices
- Foster inclusive learning for developers of all backgrounds
- Focus on empowering developers to create meaningful impact

Always be encouraging, patient, and focused on helping developers grow their skills and confidence.`,

  leetcode: `You are a world-class LeetCode mentor helping developers master problem-solving skills for impactful software careers.

Focus on algorithm analysis, data structure optimization, time/space complexity, coding patterns, and interview preparation. Start with intuition, explain the "why" behind solutions, connect algorithms to real-world applications, and build confidence step by step.

Remember: Every algorithm mastered is a tool for building better software that positively impacts users.`,

  debugging: `You are a debugging specialist helping developers build systematic problem-solving skills.

Focus on systematic analysis, root cause identification, teaching debugging strategies, explaining error messages clearly, identifying common pitfalls, and performance optimization.

Philosophy: Every bug is a learning opportunity that builds stronger debugging skills and cleaner code.`,

  codeReview: `You are a senior software engineer conducting thoughtful code reviews to help developers write production-quality code.

Review for code clarity, performance optimization, security considerations, best practices, maintainability, testing strategies, and documentation.

Provide specific, actionable feedback with reasoning, highlight what's done well, and focus on learning and improvement.`
};

// Feature flags for different capabilities
export const features = {
  streaming: true, // Real-time AI responses for better UX
  pdfAnalysis: true, // Document analysis for learning materials
  codeGeneration: true, // AI-assisted coding
  imageGeneration: !!apiConfig.huggingFace?.token, // Visual learning aids
  voiceInput: typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window),
  offlineMode: false, // Future feature for accessibility
  multiLanguageSupport: true, // Supporting global developers
  collaborativeFeatures: false, // Future team features
};

// Rate limiting configuration for responsible AI usage
export const rateLimits = {
  messagesPerMinute: 50, // Generous limit for learning
  tokensPerHour: 150000, // High limit for detailed explanations
  maxMessageLength: 8000, // Support for complex code questions
  maxHistoryMessages: 100, // Maintain conversation context
  maxPDFSize: 10, // MB limit for document uploads
};

// User-friendly error messages
export const errorMessages = {
  apiKeyMissing: '🔑 API key is not configured. Please add your Google AI API key to start your coding journey!',
  rateLimitExceeded: '⏱️ You\'re learning fast! Please wait a moment before sending another message.',
  networkError: '🌐 Network error occurred. Please check your connection and try again.',
  invalidInput: '❓ Invalid input provided. Please check your message and try again.',
  serviceUnavailable: '🔧 AI service is temporarily unavailable. Please try again later.',
  pdfTooLarge: '📄 PDF file is too large. Please use files smaller than 10MB.',
  unsupportedFileType: '📎 Unsupported file type. Please upload PDF files only.',
};

// Success messages for positive reinforcement
export const successMessages = {
  messageProcessed: '✅ Message processed successfully!',
  pdfAnalyzed: '📄 PDF analyzed successfully! Summary added to conversation.',
  settingsSaved: '⚙️ Settings saved successfully!',
  conversationCleared: '🗑️ Conversation cleared. Ready for new questions!',
};

// Analytics and usage tracking (privacy-focused)
export const analytics = {
  trackUsage: false, // Disabled by default for privacy
  anonymousMetrics: false, // No personal data collection
  performanceMonitoring: true, // Monitor app performance only
};

export default apiConfig;