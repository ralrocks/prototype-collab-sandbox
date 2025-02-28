
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

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [perplexityApiKey, setPerplexityApiKey] = useState<string | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  
  // Load key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedKey) {
      setPerplexityApiKey(savedKey);
      console.log('Loaded Perplexity API key from localStorage');
    } else {
      console.log('No Perplexity API key found in localStorage');
      setApiKeyError('No API key found. Please add your Perplexity API key in settings.');
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
  };
  
  // Remove API key from localStorage and state
  const removePerplexityApiKey = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setPerplexityApiKey(null);
    setApiKeyError('No API key found. Please add your Perplexity API key in settings.');
    console.log('Perplexity API key removed');
    toast.info('API key removed');
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
