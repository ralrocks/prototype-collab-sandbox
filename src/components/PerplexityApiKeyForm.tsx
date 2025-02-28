import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { validatePerplexityApiKey } from '@/utils/validateApiKey';

interface PerplexityApiKeyFormProps {
  adminMode?: boolean;
}

export function PerplexityApiKeyForm({ adminMode = false }: PerplexityApiKeyFormProps) {
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  useEffect(() => {
    // If in admin mode, we'll use a centralized key from this chat
    if (adminMode) {
      const centralKey = 'pk-admin-centralized-key';
      setApiKey(centralKey);
    } else {
      // Otherwise load from localStorage for individual users
      const savedKey = localStorage.getItem('PERPLEXITY_API_KEY') || '';
      setApiKey(savedKey);
    }
  }, [adminMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePerplexityApiKey(apiKey)) {
      toast.error('Invalid API key format. Perplexity API keys start with "pk-"');
      return;
    }
    
    setIsSaving(true);
    setIsValidating(true);
    
    try {
      // Test the API key with a simple request
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
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
              content: 'You are a helpful assistant.'
            },
            {
              role: 'user',
              content: 'Test API key with a simple hello'
            }
          ],
          max_tokens: 5,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API validation failed: ${errorData.error?.message || response.statusText}`);
      }
      
      // Save to localStorage if validation successful
      localStorage.setItem('PERPLEXITY_API_KEY', apiKey);
      toast.success('API key validated and saved successfully');
    } catch (error: any) {
      console.error('Error validating API key:', error);
      toast.error(error.message || 'Failed to validate API key');
    } finally {
      setIsSaving(false);
      setIsValidating(false);
    }
  };

  const setCentralizedApiKey = (key: string) => {
    if (validatePerplexityApiKey(key)) {
      localStorage.setItem('PERPLEXITY_API_KEY', key);
      setApiKey(key);
      toast.success('Centralized API key set successfully');
    } else {
      toast.error('Invalid API key format. Perplexity API keys start with "pk-"');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="perplexity-api-key">Perplexity API Key</Label>
        <Input
          id="perplexity-api-key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="pk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          className="font-mono"
          disabled={adminMode}
        />
        <p className="text-sm text-gray-500">
          {adminMode 
            ? "Using centralized API key for all users." 
            : "Your API key is stored locally in your browser and is never sent to our servers."}
        </p>
      </div>
      {!adminMode && (
        <Button type="submit" disabled={isSaving || isValidating}>
          {isValidating ? 'Validating...' : isSaving ? 'Saving...' : 'Validate & Save API Key'}
        </Button>
      )}
    </form>
  );
}

// This function can be called from the chat to set a centralized API key
export const setPerplexityApiKey = (key: string) => {
  if (validatePerplexityApiKey(key)) {
    localStorage.setItem('PERPLEXITY_API_KEY', key);
    toast.success('Centralized API key set successfully');
    return true;
  } else {
    console.error('Invalid API key format. Perplexity API keys start with "pk-"');
    return false;
  }
};
