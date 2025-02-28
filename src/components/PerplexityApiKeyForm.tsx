
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

  // Initialize the form with the existing API key if available
  useEffect(() => {
    console.log('PerplexityApiKeyForm: useEffect triggered, apiKey:', perplexityApiKey ? '[EXISTS]' : '[NONE]');
    
    if (perplexityApiKey) {
      // If we have a stored key, mask it with asterisks for security if not in admin mode
      setApiKey(isAdminMode ? perplexityApiKey : '••••••••••••••••••••••••••••••••');
      setIsValid(true);
    } else {
      setApiKey('');
      setIsValid(false);
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

  const resetToDefaultKey = () => {
    removePerplexityApiKey();
    setApiKey(isAdminMode ? perplexityApiKey || '' : '••••••••••••••••••••••••••••••••');
    setIsValid(true);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <div className="space-y-1">
          <label htmlFor="apiKey" className="text-sm font-medium">
            {isAdminMode ? "Centralized Perplexity API Key" : "Perplexity API Key"}
          </label>
          <div className="text-xs text-muted-foreground mb-2">
            {isAdminMode ? 
              "A default API key is already configured for all users. You can change it here if needed." :
              "A default API key is configured for you. No need to enter your own key."
            }
          </div>
        </div>
        
        {isAdminMode && (
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Input
                id="apiKey"
                value={apiKey}
                onChange={handleKeyChange}
                placeholder="Enter centralized API key"
                className={`pr-8 ${isValid ? 'border-green-500' : apiKey ? 'border-red-500' : ''}`}
                type="text"
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
              Update
            </Button>
            
            <Button type="button" variant="outline" onClick={resetToDefaultKey}>
              Reset to Default
            </Button>
          </div>
        )}
        
        {!isAdminMode && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm text-green-700">
              API key is configured and ready to use. No action needed.
            </span>
          </div>
        )}
      </form>
      
      {showSuccess && (
        <div className="bg-green-100 text-green-800 p-2 rounded-md flex items-center">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          <span className="text-sm">API key updated successfully!</span>
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
