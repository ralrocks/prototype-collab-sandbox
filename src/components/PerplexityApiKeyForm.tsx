
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApiKey } from '@/contexts/ApiKeyContext';

interface PerplexityApiKeyFormProps {
  isAdminMode?: boolean;
  onKeySubmitted?: () => void;
}

const PerplexityApiKeyForm = ({ isAdminMode = false, onKeySubmitted }: PerplexityApiKeyFormProps) => {
  const { perplexityApiKey, setPerplexityApiKey, removePerplexityApiKey, isValidPerplexityApiKey } = useApiKey();
  const [apiKey, setApiKey] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (perplexityApiKey) {
      // If we have a stored key, mask it with asterisks for security
      setApiKey(isAdminMode ? perplexityApiKey : '••••••••••••••••••••••••••••••••');
      setIsValid(true);
    }
  }, [perplexityApiKey, isAdminMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey) {
      return;
    }
    
    if (isValidPerplexityApiKey(apiKey)) {
      console.log('Setting API key, is admin mode:', isAdminMode);
      setPerplexityApiKey(apiKey);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      if (onKeySubmitted) onKeySubmitted();
    }
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setApiKey(value);
    setIsValid(isValidPerplexityApiKey(value));
  };

  const clearApiKey = () => {
    removePerplexityApiKey();
    setApiKey('');
    setIsValid(false);
  };

  // Automatically set the provided key if this is in admin mode and we don't have a key yet
  useEffect(() => {
    if (isAdminMode && !perplexityApiKey) {
      // Set the key automatically on first load
      const keyToSet = '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';
      if (isValidPerplexityApiKey(keyToSet)) {
        setApiKey(keyToSet);
        setIsValid(true);
        setPerplexityApiKey(keyToSet);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    }
  }, [isAdminMode, perplexityApiKey, setPerplexityApiKey, isValidPerplexityApiKey]);

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <div className="space-y-1">
          <label htmlFor="apiKey" className="text-sm font-medium">
            {isAdminMode ? "Set Centralized Perplexity API Key" : "Your Perplexity API Key"}
          </label>
          <div className="text-xs text-muted-foreground mb-2">
            {isAdminMode ? 
              "As an admin, you can set a centralized API key that all users will use. This eliminates the need for each user to input their own key." :
              "Enter your API key to enable AI-powered search features"
            }
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Input
              id="apiKey"
              value={apiKey}
              onChange={handleKeyChange}
              placeholder={isAdminMode ? "Enter centralized API key" : "Enter your API key"}
              className={`pr-8 ${isValid ? 'border-green-500' : apiKey ? 'border-red-500' : ''}`}
              type={isAdminMode ? "text" : (perplexityApiKey ? "password" : "text")}
            />
            {apiKey && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                {isValid ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            )}
          </div>
          
          <Button type="submit" disabled={!isValid}>
            {perplexityApiKey ? "Update" : "Save"}
          </Button>
          
          {perplexityApiKey && (
            <Button type="button" variant="outline" onClick={clearApiKey}>
              Clear
            </Button>
          )}
        </div>
      </form>
      
      {showSuccess && (
        <div className="bg-green-100 text-green-800 p-2 rounded-md flex items-center">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          <span className="text-sm">API key {perplexityApiKey ? "updated" : "saved"} successfully!</span>
        </div>
      )}
      
      {isAdminMode && perplexityApiKey && (
        <div className="text-xs text-muted-foreground mt-2">
          <p>Current centralized key: {perplexityApiKey.substring(0, 5)}...{perplexityApiKey.substring(perplexityApiKey.length - 5)}</p>
          <p className="mt-1">All users will use this key for AI functionality.</p>
        </div>
      )}
    </div>
  );
};

export default PerplexityApiKeyForm;
