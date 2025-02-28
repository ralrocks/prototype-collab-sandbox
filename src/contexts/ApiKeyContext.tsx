
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

// Hardcoded default API key that will be used for all users
const DEFAULT_API_KEY = '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';

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [perplexityApiKey, setPerplexityApiKey] = useState<string | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  
  // Load key from localStorage on mount, use default key if none exists
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem(LOCAL_STORAGE_KEY);
      
      if (savedKey) {
        setPerplexityApiKey(savedKey);
        console.log('Loaded Perplexity API key from localStorage');
      } else {
        // If no key in localStorage, use the default key and save it
        localStorage.setItem(LOCAL_STORAGE_KEY, DEFAULT_API_KEY);
        setPerplexityApiKey(DEFAULT_API_KEY);
        console.log('Using default Perplexity API key');
      }
      
      setApiKeyError(null);
    } catch (error) {
      console.error('Error loading API key from localStorage:', error);
      // Still set the default key in case of error
      setPerplexityApiKey(DEFAULT_API_KEY);
    }
  }, []);
  
  // Validate a Perplexity API key format
  const isValidPerplexityApiKey = (key: string): boolean => {
    // Perplexity API keys start with 'pplx-' followed by a long string
    // or 'pk-' for newer keys
    return /^(pk-|pplx-)[A-Za-z0-9]{24,}$/.test(key.trim());
  };
  
  // Store API key in localStorage and state
  const storePerplexityApiKey = (key: string): boolean => {
    try {
      const trimmedKey = key.trim();
      
      if (isValidPerplexityApiKey(trimmedKey)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, trimmedKey);
        setPerplexityApiKey(trimmedKey);
        setApiKeyError(null);
        console.log('Valid Perplexity API key saved');
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
  
  // Remove API key from localStorage and state and replace with default
  const removePerplexityApiKey = () => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, DEFAULT_API_KEY);
      setPerplexityApiKey(DEFAULT_API_KEY);
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
    hasPerplexityApiKey: !!perplexityApiKey,
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
