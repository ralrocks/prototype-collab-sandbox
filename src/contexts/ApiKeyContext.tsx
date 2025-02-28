
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

interface ApiKeyContextType {
  perplexityApiKey: string | null;
  setPerplexityApiKey: (key: string) => boolean;
  removePerplexityApiKey: () => void;
  hasPerplexityApiKey: boolean;
  isValidPerplexityApiKey: (key: string) => boolean;
  apiKeyError: string | null;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'PERPLEXITY_API_KEY';

// Hardcoded API key that will be used for all users
const DEFAULT_API_KEY = 'pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [perplexityApiKey, setPerplexityApiKeyState] = useState<string | null>(DEFAULT_API_KEY);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  
  // Ensure the default API key is always set on mount
  useEffect(() => {
    try {
      // Always use the default API key
      setPerplexityApiKeyState(DEFAULT_API_KEY);
      console.log('Using default Perplexity API key for all users');
      setApiKeyError(null);
    } catch (error) {
      console.error('Error setting up API key:', error);
    }
  }, []);
  
  // Validate a Perplexity API key format
  const isValidPerplexityApiKey = (key: string): boolean => {
    // Always return true for the default key
    if (key === DEFAULT_API_KEY) return true;
    
    // Perplexity API keys start with 'pplx-' followed by a long string
    // or 'pk-' for newer keys
    return /^(pk-|pplx-)[A-Za-z0-9]{24,}$/.test(key.trim());
  };
  
  // Store API key in state - for future flexibility
  const storePerplexityApiKey = (key: string): boolean => {
    try {
      // Always allow the default key
      if (key === DEFAULT_API_KEY) {
        setPerplexityApiKeyState(DEFAULT_API_KEY);
        setApiKeyError(null);
        console.log('Using default Perplexity API key');
        return true;
      }
      
      const trimmedKey = key.trim();
      if (isValidPerplexityApiKey(trimmedKey)) {
        setPerplexityApiKeyState(trimmedKey);
        setApiKeyError(null);
        console.log('Custom Perplexity API key saved');
        toast.success('API key successfully saved');
        return true;
      } else {
        console.error('Invalid Perplexity API key format:', trimmedKey);
        setApiKeyError('Invalid API key format. Perplexity API keys start with "pplx-" or "pk-"');
        toast.error('Invalid API key format');
        return false;
      }
    } catch (error) {
      console.error('Error storing API key:', error);
      toast.error('Failed to save API key');
      return false;
    }
  };
  
  // Reset to default API key
  const removePerplexityApiKey = () => {
    try {
      // Reset to default key
      setPerplexityApiKeyState(DEFAULT_API_KEY);
      setApiKeyError(null);
      console.log('Reset to default Perplexity API key');
      toast.info('Reset to default API key');
    } catch (error) {
      console.error('Error resetting API key:', error);
      toast.error('Failed to reset API key');
    }
  };
  
  const value = {
    perplexityApiKey,
    setPerplexityApiKey: storePerplexityApiKey,
    removePerplexityApiKey,
    hasPerplexityApiKey: !!perplexityApiKey, // Always true since we have a default key
    isValidPerplexityApiKey,
    apiKeyError,
  };
  
  return <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>;
}

export function useApiKey() {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
}
