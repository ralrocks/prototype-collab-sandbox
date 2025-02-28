
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
  // Check if API key exists
  const apiKey = localStorage.getItem('PERPLEXITY_API_KEY');
  
  if (!apiKey) {
    console.error('Perplexity API key not found');
    toast.error('API key not configured. Please add it in settings.');
    throw new Error('Perplexity API key not configured.');
  }
  
  try {
    console.log(`Making Perplexity API request with model: ${model}`);
    
    // Reduce timeout to 4 seconds for faster response/failure
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    
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
      const errorData = await response.json().catch(() => ({}));
      console.error('Perplexity API error:', errorData);
      
      if (response.status === 401) {
        toast.error('API key authentication failed. Please check your API key.');
        throw new Error('API key authentication failed');
      }
      
      throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Perplexity API response received:', data);
    
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      throw new Error('No content returned from API');
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Perplexity request aborted due to timeout');
      throw new Error('Request timed out after 4 seconds');
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
    // If not valid JSON, try to extract JSON portion using regex
    try {
      // Improved regex to better detect JSON arrays and objects
      const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/s) || 
                        text.match(/\{\s*"[\s\S]*"\s*:[\s\S]*\}/s);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Try finding JSON within code blocks (```json ... ```)
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        return JSON.parse(codeBlockMatch[1]);
      }
    } catch (extractError) {
      console.error('Error extracting JSON from response:', extractError);
    }
    
    // If all else fails, log the issue and throw an error
    console.error('Could not extract valid JSON from API response:', text);
    throw new Error('Could not extract valid JSON from API response');
  }
};
