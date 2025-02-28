
/**
 * Utility functions for making API requests to Perplexity
 */
import { toast } from 'sonner';

/**
 * Make a request to the Perplexity API
 */
export const makePerplexityRequest = async (
  systemPrompt: string, 
  userPrompt: string,
  temperature: number = 0.2,
  maxTokens: number = 2000
): Promise<string> => {
  // Fetch API key from localStorage
  const apiKey = localStorage.getItem('PERPLEXITY_API_KEY');
  
  if (!apiKey) {
    throw new Error('Perplexity API key not found. Please add your API key in settings.');
  }
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Perplexity API error:', errorData);
      throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      throw new Error('No content returned from API');
    }
  } catch (error) {
    console.error('Error making Perplexity request:', error);
    throw error;
  }
};

/**
 * Extract JSON from the API response
 */
export const extractJsonFromResponse = (text: string): any => {
  try {
    // Try to parse the entire text as JSON first
    return JSON.parse(text);
  } catch (error) {
    // If not valid JSON, try to extract JSON portion using regex
    try {
      const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s) || 
                        text.match(/\{\s*".*"\s*:.*\}/s);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (extractError) {
      console.error('Error extracting JSON from response:', extractError);
    }
    
    // If all else fails, log the issue and throw an error
    console.error('Could not extract valid JSON from API response:', text);
    throw new Error('Could not extract valid JSON from API response');
  }
};
