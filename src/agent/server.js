import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
import { PythonShell } from 'python-shell';
import { AccessToken } from 'livekit-server-sdk';
import { analyzeSentiment, analyzeEntities, analyzeSyntax } from './nlp.js';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
app.use(express.json());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

const runPythonScript = async (scriptName, args = []) => {
  try {
    const options = {
      mode: 'text',
      pythonPath: 'python3',
      pythonOptions: ['-u'],
      scriptPath: './src/agent/python',
      args: args
    };

    const results = await PythonShell.run(scriptName, options);
    return results;
  } catch (error) {
    console.error('Error running Python script:', error);
    throw error;
  }
};

// PDF Processing Routes
app.post('/api/pdf/extract', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    const pdfData = await pdfParse(req.file.buffer);
    
    res.json({
      text: pdfData.text,
      pageCount: pdfData.numpages,
      info: pdfData.info,
      metadata: pdfData.metadata
    });
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    res.status(500).json({ error: 'Failed to extract text from PDF' });
  }
});

app.post('/api/pdf/analyze', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    const options = req.body.options ? JSON.parse(req.body.options) : {};
    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text;
    
    const analysis = {
      pageCount: pdfData.numpages,
      wordCount: text.split(/\s+/).length,
      characterCount: text.length
    };

    // Generate summary if requested
    if (options.generateSummary !== false) {
      analysis.summary = await generateAISummary(text, options.maxSummaryLength || 500);
    }

    // Extract key points if requested
    if (options.extractKeyPoints !== false) {
      analysis.keyPoints = extractKeyPoints(text, 5);
    }

    // Detect topics if requested
    if (options.detectTopics !== false) {
      analysis.topics = detectTopics(text);
    }

    // Analyze sentiment if requested
    if (options.analyzeSentiment) {
      try {
        const sentiment = await analyzeSentiment(text.substring(0, 5000)); // Limit for API
        analysis.sentiment = sentiment.score > 0.1 ? 'positive' : sentiment.score < -0.1 ? 'negative' : 'neutral';
      } catch (error) {
        console.warn('Sentiment analysis failed:', error);
      }
    }

    // Determine complexity
    analysis.complexity = determineComplexity(text);

    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing PDF:', error);
    res.status(500).json({ error: 'Failed to analyze PDF' });
  }
});

// AI Summarization Routes
app.post('/api/ai/summarize', async (req, res) => {
  try {
    const { text, maxLength = 500, type = 'document' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'No text provided for summarization' });
    }

    const summary = await generateAISummary(text, maxLength, type);
    res.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

app.post('/api/ai/summarize/stream', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'No text provided for summarization' });
    }

    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    // Simulate streaming summary generation
    const summary = await generateAISummary(text, 500);
    const words = summary.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      const token = words[i] + ' ';
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
      await new Promise(resolve => setTimeout(resolve, 50)); // Simulate processing delay
    }
    
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Error streaming summary:', error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to generate summary' })}\n\n`);
    res.end();
  }
});

app.post('/api/ai/extract-points', async (req, res) => {
  try {
    const { text, maxPoints = 5 } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    const keyPoints = extractKeyPoints(text, maxPoints);
    res.json({ keyPoints });
  } catch (error) {
    console.error('Error extracting key points:', error);
    res.status(500).json({ error: 'Failed to extract key points' });
  }
});

app.post('/api/ai/detect-topics', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    const topics = detectTopics(text);
    res.json({ topics });
  } catch (error) {
    console.error('Error detecting topics:', error);
    res.status(500).json({ error: 'Failed to detect topics' });
  }
});

// Helper Functions
async function generateAISummary(text, maxLength = 500, type = 'document') {
  // Simulate AI summarization - replace with actual AI service call
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const wordCount = text.split(/\s+/).length;
  
  // Extract key sentences based on position and length
  const keySentences = [];
  const totalSentences = sentences.length;
  
  // Take first sentence (introduction)
  if (sentences[0]) keySentences.push(sentences[0].trim());
  
  // Take sentences from middle sections
  const middleStart = Math.floor(totalSentences * 0.2);
  const middleEnd = Math.floor(totalSentences * 0.8);
  
  for (let i = middleStart; i < middleEnd && keySentences.length < 4; i += Math.floor((middleEnd - middleStart) / 3)) {
    if (sentences[i] && sentences[i].trim().length > 50) {
      keySentences.push(sentences[i].trim());
    }
  }
  
  // Take last sentence (conclusion)
  if (sentences[totalSentences - 1] && keySentences.length < 5) {
    keySentences.push(sentences[totalSentences - 1].trim());
  }
  
  let summary = `📄 **Document Summary**

**Overview:** This ${wordCount > 1000 ? 'comprehensive' : 'concise'} document contains ${wordCount.toLocaleString()} words across ${Math.ceil(wordCount / 250)} estimated pages.

**Key Content:**
${keySentences.map((sentence, index) => `${index + 1}. ${sentence}.`).join('\n')}

**Analysis:** The document appears to be ${type === 'academic' ? 'academic in nature' : 'informational'} and covers ${wordCount > 2000 ? 'multiple complex topics' : 'focused subject matter'}.

*Summary generated by Netlify AI 🤖*`;

  // Trim to max length if needed
  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength - 3) + '...';
  }
  
  return summary;
}

function extractKeyPoints(text, maxPoints = 5) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 30);
  const keyPoints = [];
  
  // Simple heuristic: longer sentences often contain key information
  const sortedSentences = sentences
    .map(s => ({ text: s.trim(), length: s.trim().length }))
    .sort((a, b) => b.length - a.length)
    .slice(0, maxPoints);
  
  return sortedSentences.map(s => s.text);
}

function detectTopics(text) {
  // Simple keyword-based topic detection
  const topicKeywords = {
    'Technology': ['software', 'computer', 'digital', 'algorithm', 'data', 'programming', 'AI', 'machine learning'],
    'Business': ['market', 'revenue', 'profit', 'strategy', 'management', 'company', 'business'],
    'Science': ['research', 'study', 'analysis', 'experiment', 'hypothesis', 'theory', 'scientific'],
    'Education': ['learning', 'student', 'education', 'teaching', 'academic', 'university', 'school'],
    'Health': ['health', 'medical', 'patient', 'treatment', 'disease', 'therapy', 'clinical'],
    'Finance': ['financial', 'investment', 'money', 'economic', 'banking', 'finance', 'cost']
  };
  
  const lowerText = text.toLowerCase();
  const detectedTopics = [];
  
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    const matches = keywords.filter(keyword => lowerText.includes(keyword)).length;
    if (matches >= 2) {
      detectedTopics.push(topic);
    }
  }
  
  return detectedTopics.length > 0 ? detectedTopics : ['General'];
}

function determineComplexity(text) {
  const wordCount = text.split(/\s+/).length;
  const avgWordLength = text.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / wordCount;
  const sentenceCount = text.split(/[.!?]+/).length;
  const avgSentenceLength = wordCount / sentenceCount;
  
  if (avgWordLength > 6 && avgSentenceLength > 20) {
    return 'high';
  } else if (avgWordLength > 5 || avgSentenceLength > 15) {
    return 'medium';
  } else {
    return 'low';
  }
}

// NLP Routes (existing)
app.post('/api/analyze/sentiment', async (req, res) => {
  try {
    const { text } = req.body;
    const sentiment = await analyzeSentiment(text);
    res.json(sentiment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze sentiment' });
  }
});

app.post('/api/analyze/entities', async (req, res) => {
  try {
    const { text } = req.body;
    const entities = await analyzeEntities(text);
    res.json(entities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze entities' });
  }
});

app.post('/api/analyze/syntax', async (req, res) => {
  try {
    const { text } = req.body;
    const syntax = await analyzeSyntax(text);
    res.json(syntax);
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze syntax' });
  }
});

// Existing routes...
app.post('/api/search-papers', async (req, res) => {
  try {
    const { topic, maxResults = 5 } = req.body;
    const results = await runPythonScript('researchpaper.py', ['search_papers', topic, maxResults.toString()]);
    res.json({ results });
  } catch (error) {
    console.error('Error searching papers:', error);
    res.status(500).json({ error: 'Failed to search papers' });
  }
});

app.post('/api/summarize', async (req, res) => {
  try {
    const { paperId } = req.body;
    const results = await runPythonScript('researchpaper.py', ['extract_info', paperId]);
    res.json({ results });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Create LiveKit access token
const createToken = (roomName, participantName) => {
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: participantName,
      name: participantName,
    }
  );
  at.addGrant({ roomJoin: true, room: roomName });
  return at.toJwt();
};

// Initialize the educational agent
const initializeAgent = async () => {
  try {
    const response = await runPythonScript('roman_empire_agent.py');
    console.log('Agent initialized:', response);
  } catch (error) {
    console.error('Failed to initialize agent:', error);
  }
};

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📄 PDF processing endpoints available`);
  console.log(`🤖 AI summarization ready`);
  initializeAgent();
});