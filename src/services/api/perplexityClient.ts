
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
    console.log('API Response received:', data);
    
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
  console.log('Attempting to extract JSON from response:', text.substring(0, 200) + '...');
  
  try {
    // Try to parse the entire text as JSON first
    return JSON.parse(text);
  } catch (error) {
    console.log('Couldn\'t parse entire response as JSON, trying to extract JSON portion');
    
    try {
      // Look for JSON content within markdown code blocks with better regex
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        const jsonContent = codeBlockMatch[1].trim();
        console.log('Found JSON in code block:', jsonContent.substring(0, 200) + '...');
        try {
          return JSON.parse(jsonContent);
        } catch (innerError) {
          console.error('Error parsing JSON from code block:', innerError);
        }
      }
      
      // Try to extract JSON array with more robust regex
      const jsonArrayMatch = text.match(/\[\s*\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\}\s*(?:,\s*\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\}\s*)*\]/);
      if (jsonArrayMatch) {
        const arrayContent = jsonArrayMatch[0];
        console.log('Found JSON array:', arrayContent.substring(0, 200) + '...');
        try {
          return JSON.parse(arrayContent);
        } catch (innerError) {
          console.error('Error parsing JSON array:', innerError);
        }
      }
      
      // Try to extract JSON object with more robust regex
      const jsonObjectMatch = text.match(/\{\s*"[^"]*"(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\}/);
      if (jsonObjectMatch) {
        const objectContent = jsonObjectMatch[0];
        console.log('Found JSON object:', objectContent.substring(0, 200) + '...');
        try {
          return JSON.parse(objectContent);
        } catch (innerError) {
          console.error('Error parsing JSON object:', innerError);
        }
      }
      
      // If we're here, try more aggressive approaches:
      
      // 1. Try to find anything that looks like an array of objects
      const fixArrayAttempt = text.match(/\[\s*(\{.*\})\s*\]/s);
      if (fixArrayAttempt) {
        try {
          console.log('Attempting to fix and parse array...');
          return JSON.parse(fixArrayAttempt[0]);
        } catch (e) {
          console.error('Failed to fix array:', e);
        }
      }
      
      // 2. Try to fix malformed JSON with missing closing brackets
      if (text.includes('[') && text.includes('{')) {
        try {
          console.log('Attempting aggressive JSON repair...');
          
          // Count opening and closing brackets to check if any are missing
          const openBrackets = (text.match(/\[/g) || []).length;
          const closeBrackets = (text.match(/\]/g) || []).length;
          const openCurly = (text.match(/\{/g) || []).length;
          const closeCurly = (text.match(/\}/g) || []).length;
          
          console.log(`Bracket counts: [ = ${openBrackets}, ] = ${closeBrackets}, { = ${openCurly}, } = ${closeCurly}`);
          
          let repairedJson = text;
          
          // Try to fix the most common case - truncated JSON array
          if (openBrackets > closeBrackets) {
            console.log('Missing closing array brackets, attempting to add them');
            repairedJson = repairedJson + ']'.repeat(openBrackets - closeBrackets);
          }
          
          // Fix missing closing curly braces
          if (openCurly > closeCurly) {
            console.log('Missing closing curly braces, attempting to add them');
            repairedJson = repairedJson + '}'.repeat(openCurly - closeCurly);
          }
          
          // Try to extract just what looks like valid JSON
          const jsonStart = repairedJson.indexOf('[');
          if (jsonStart >= 0) {
            repairedJson = repairedJson.substring(jsonStart);
            console.log('Extracted potential JSON from position', jsonStart);
          }
          
          // Check if we have valid JSON now
          return JSON.parse(repairedJson);
        } catch (e) {
          console.error('Failed aggressive JSON repair:', e);
        }
      }

      // 3. As a last resort, create a minimal valid array
      console.error('Could not extract valid JSON from response:', text);
      console.log('Returning minimal fallback array');
      return [];
    } catch (extractError) {
      console.error('Error extracting JSON from response:', extractError);
      console.error('Original response text (truncated):', text.substring(0, 500));
      toast.error('Error parsing API response');
      throw new Error('Could not parse API response');
    }
  }
};
