
/**
 * Validates the format of a Perplexity API key
 * @param apiKey The API key to validate
 * @returns Whether the key format is valid
 */
export const validatePerplexityApiKey = (apiKey: string): boolean => {
  // Special case for the centralized admin key
  if (apiKey === 'pk-admin-centralized-key') {
    return true;
  }
  
  // Perplexity API keys start with 'pplx-' or 'pk-' followed by a long string
  const isValid = /^(pk-|pplx-)[A-Za-z0-9]{24,}$/.test(apiKey);
  return isValid;
};

/**
 * Checks if the Perplexity API key exists in localStorage
 * @returns Whether the key exists
 */
export const hasPerplexityApiKey = (): boolean => {
  const apiKey = localStorage.getItem('PERPLEXITY_API_KEY');
  return !!apiKey && apiKey.length > 0;
};

/**
 * Sets a centralized Perplexity API key that all users will use
 * @param apiKey The API key to set
 * @returns Whether the key was successfully set
 */
export const setCentralizedPerplexityApiKey = (apiKey: string): boolean => {
  console.log('Setting centralized API key:', apiKey);
  if (validatePerplexityApiKey(apiKey)) {
    localStorage.setItem('PERPLEXITY_API_KEY', apiKey);
    return true;
  }
  return false;
};

/**
 * Gets the currently stored Perplexity API key
 * @returns The stored API key or null if not found
 */
export const getPerplexityApiKey = (): string | null => {
  return localStorage.getItem('PERPLEXITY_API_KEY');
};
