
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
    const errorData = await response.json();
    console.error('Perplexity API error:', errorData);
    throw new Error(`API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
};

/**
 * Extract JSON from a response string
 */
export const extractJsonFromResponse = (content: string): any => {
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No valid JSON found in response');
  } catch (parseError) {
    console.error('Error parsing JSON from Perplexity:', parseError, content);
    throw new Error('Failed to parse data');
  }
};
