import { LanguageServiceClient } from '@google-cloud/language';

const client = new LanguageServiceClient({
  credentials: {
    client_email: 'your-service-account-email',
    private_key: 'your-private-key',
  },
  projectId: 'your-project-id',
});

export async function analyzeSentiment(text) {
  try {
    const document = {
      content: text,
      type: 'PLAIN_TEXT',
    };

    const [result] = await client.analyzeSentiment({ document });
    const sentiment = result.documentSentiment;
    
    return {
      score: sentiment.score,
      magnitude: sentiment.magnitude,
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw error;
  }
}

export async function analyzeEntities(text) {
  try {
    const document = {
      content: text,
      type: 'PLAIN_TEXT',
    };

    const [result] = await client.analyzeEntities({ document });
    return result.entities;
  } catch (error) {
    console.error('Error analyzing entities:', error);
    throw error;
  }
}

export async function analyzeSyntax(text) {
  try {
    const document = {
      content: text,
      type: 'PLAIN_TEXT',
    };

    const [result] = await client.analyzeSyntax({ document });
    return result.tokens;
  } catch (error) {
    console.error('Error analyzing syntax:', error);
    throw error;
  }
}