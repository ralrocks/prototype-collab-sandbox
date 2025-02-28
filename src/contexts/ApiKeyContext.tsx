
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ApiKeyContextType {
  perplexityApiKey: string | null;
  setPerplexityApiKey: (key: string) => void;
  removePerplexityApiKey: () => void;
  hasPerplexityApiKey: boolean;
  isValidPerplexityApiKey: (key: string) => boolean;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'PERPLEXITY_API_KEY';

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [perplexityApiKey, setPerplexityApiKey] = useState<string | null>(null);
  
  // Load key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedKey) {
      setPerplexityApiKey(savedKey);
    }
  }, []);
  
  // Validate a Perplexity API key format
  const isValidPerplexityApiKey = (key: string): boolean => {
    // Perplexity API keys start with 'pplx-' or 'pk-' followed by a long string
    return /^(pk-|pplx-)[A-Za-z0-9]{24,}$/.test(key);
  };
  
  // Store API key in localStorage and state
  const storePerplexityApiKey = (key: string) => {
    if (isValidPerplexityApiKey(key)) {
      localStorage.setItem(LOCAL_STORAGE_KEY, key);
      setPerplexityApiKey(key);
      return true;
    }
    return false;
  };
  
  // Remove API key from localStorage and state
  const removePerplexityApiKey = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setPerplexityApiKey(null);
  };
  
  const value = {
    perplexityApiKey,
    setPerplexityApiKey: storePerplexityApiKey,
    removePerplexityApiKey,
    hasPerplexityApiKey: !!perplexityApiKey,
    isValidPerplexityApiKey,
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
