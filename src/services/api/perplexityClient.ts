
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
  maxTokens: number = 2000,
  model: string = 'llama-3.1-sonar-small-128k-online'
): Promise<string> => {
  // Fetch API key from localStorage
  const apiKey = localStorage.getItem('PERPLEXITY_API_KEY');
  
  if (!apiKey) {
    toast.error('API key required', { description: 'Please add your Perplexity API key in settings' });
    throw new Error('Perplexity API key not found. Please add your API key in settings.');
  }
  
  try {
    console.log(`Making Perplexity API request with model: ${model}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
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
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
      console.error('Perplexity API error:', errorData);
      
      if (response.status === 401) {
        toast.error('API key invalid', { description: 'Please check your Perplexity API key in settings' });
        throw new Error('Invalid API key');
      } else if (response.status === 429) {
        toast.error('Rate limit exceeded', { description: 'Please try again in a few minutes' });
        throw new Error('Rate limit exceeded');
      } else {
        toast.error('API request failed', { description: errorData.error?.message || response.statusText });
        throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
      }
    }
    
    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      toast.error('No content returned from API');
      throw new Error('No content returned from API');
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      toast.error('Request timed out', { description: 'The API request took too long to respond' });
      throw new Error('API request timed out');
    }
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
    console.log('Couldn\'t parse entire response as JSON, trying to extract JSON portion');
    
    try {
      // Try to extract JSON array
      const jsonArrayMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonArrayMatch) {
        return JSON.parse(jsonArrayMatch[0]);
      }
      
      // Try to extract JSON object
      const jsonObjectMatch = text.match(/\{\s*"[\s\S]*"\s*:[\s\S]*\}/);
      if (jsonObjectMatch) {
        return JSON.parse(jsonObjectMatch[0]);
      }
      
      // If we can't find valid JSON, log the response and throw an error
      console.error('Could not extract valid JSON from response:', text);
      toast.error('Invalid response format from API');
      throw new Error('Could not extract valid JSON from API response');
    } catch (extractError) {
      console.error('Error extracting JSON from response:', extractError);
      console.error('Original response:', text);
      toast.error('Error parsing API response');
      throw new Error('Could not parse API response');
    }
  }
};
