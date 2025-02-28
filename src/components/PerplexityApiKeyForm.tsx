
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { validatePerplexityApiKey } from '@/utils/validateApiKey';

export function PerplexityApiKeyForm() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('PERPLEXITY_API_KEY') || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

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
        />
        <p className="text-sm text-gray-500">
          Your API key is stored locally in your browser and is never sent to our servers.
        </p>
      </div>
      <Button type="submit" disabled={isSaving || isValidating}>
        {isValidating ? 'Validating...' : isSaving ? 'Saving...' : 'Validate & Save API Key'}
      </Button>
    </form>
  );
}
