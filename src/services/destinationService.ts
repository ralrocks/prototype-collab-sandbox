
import { makePerplexityRequest } from './api/perplexityClient';

/**
 * Get destination information using Perplexity
 */
export const getDestinationInfo = async (destination: string): Promise<string> => {
  console.log(`Getting information about ${destination}`);
  
  try {
    const systemPrompt = 'You are a travel guide assistant. Provide concise, helpful travel information.';
    const userPrompt = `Provide a concise travel guide for ${destination}. Include key attractions, best time to visit, and local food recommendations. Keep it under 500 characters.`;
    
    // Make the API request
    return await makePerplexityRequest(systemPrompt, userPrompt, 0.3, 500);
  } catch (error) {
    console.error('Error fetching destination info:', error);
    return `${destination} is a popular travel destination. You can explore local attractions, try regional cuisine, and experience the unique culture. For specific travel tips and recommendations, consider researching current travel guides or asking locals for suggestions.`;
  }
};
