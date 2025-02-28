
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

// Default API key
const DEFAULT_API_KEY = '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';

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [perplexityApiKey, setPerplexityApiKeyState] = useState<string | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  
  // Initialize API key on mount
  useEffect(() => {
    try {
      // Check if we have a stored key first
      const storedKey = localStorage.getItem(LOCAL_STORAGE_KEY);
      
      if (storedKey) {
        console.log('Found stored Perplexity API key');
        setPerplexityApiKeyState(storedKey);
        setApiKeyError(null);
      } else {
        // Set the default key if none is stored
        console.log('No stored key found, using default Perplexity API key');
        localStorage.setItem(LOCAL_STORAGE_KEY, DEFAULT_API_KEY);
        setPerplexityApiKeyState(DEFAULT_API_KEY);
      }
    } catch (error) {
      console.error('Error setting up API key:', error);
      // Set default key as fallback in case of error
      setPerplexityApiKeyState(DEFAULT_API_KEY);
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
  
  // Store API key in state and localStorage
  const storePerplexityApiKey = (key: string): boolean => {
    try {
      // Always allow the default key
      if (key === DEFAULT_API_KEY) {
        localStorage.setItem(LOCAL_STORAGE_KEY, DEFAULT_API_KEY);
        setPerplexityApiKeyState(DEFAULT_API_KEY);
        setApiKeyError(null);
        console.log('Using default Perplexity API key');
        return true;
      }
      
      const trimmedKey = key.trim();
      if (isValidPerplexityApiKey(trimmedKey)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, trimmedKey);
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
      localStorage.setItem(LOCAL_STORAGE_KEY, DEFAULT_API_KEY);
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
    hasPerplexityApiKey: !!perplexityApiKey, // Will be true if we have a key (default or custom)
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
