
/**
 * Perplexity API client configuration
 */

// Base API configuration
export const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

/**
 * Get the Perplexity API key from localStorage
 * @returns The API key or throws an error if not found
 */
export const getPerplexityApiKey = (): string => {
  const apiKey = localStorage.getItem('PERPLEXITY_API_KEY');
  
  if (!apiKey) {
    throw new Error('Perplexity API key not found. Please add your API key in settings.');
  }
  
  return apiKey;
};

/**
 * Make a request to the Perplexity API
 */
export const makePerplexityRequest = async (
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0.2,
  maxTokens: number = 2000
): Promise<string> => {
  const apiKey = getPerplexityApiKey();
  
  try {
    const response = await fetch(PERPLEXITY_API_URL, {
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
      let errorMessage = `API error: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Perplexity API error:', errorData);
        if (errorData.error && errorData.error.message) {
          errorMessage = errorData.error.message;
        }
      } catch (e) {
        console.error('Could not parse error response', e);
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error in Perplexity API request:', error);
    throw error;
  }
};

/**
 * Extract JSON from a response string
 */
export const extractJsonFromResponse = (content: string): any => {
  try {
    // First try to parse the entire content as JSON
    try {
      return JSON.parse(content);
    } catch (e) {
      // If that fails, look for JSON array pattern
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // If that also fails, look for JSON object pattern
      const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        return JSON.parse(jsonObjectMatch[0]);
      }
    }
    
    throw new Error('No valid JSON found in response');
  } catch (parseError) {
    console.error('Error parsing JSON from Perplexity:', parseError, content);
    throw new Error('Failed to parse data');
  }
};
