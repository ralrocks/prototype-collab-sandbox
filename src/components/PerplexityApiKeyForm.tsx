
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { validatePerplexityApiKey, hasPerplexityApiKey, setCentralizedPerplexityApiKey, getPerplexityApiKey } from '@/utils/validateApiKey';

interface PerplexityApiKeyFormProps {
  isAdminMode?: boolean;
  onKeySubmitted?: () => void;
}

const PerplexityApiKeyForm = ({ isAdminMode = false, onKeySubmitted }: PerplexityApiKeyFormProps) => {
  const [apiKey, setApiKey] = useState('');
  const [storedKey, setStoredKey] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const key = getPerplexityApiKey();
    setStoredKey(key);
    
    if (key) {
      // If we have a stored key, we don't show the actual key but a placeholder
      setApiKey(isAdminMode ? key : '••••••••••••••••••••••••••••••••');
      setIsValid(true);
    }
  }, [isAdminMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey) {
      return;
    }
    
    if (validatePerplexityApiKey(apiKey)) {
      console.log('Setting API key in centralized mode:', isAdminMode);
      if (isAdminMode || apiKey === 'pk-admin-centralized-key') {
        const success = setCentralizedPerplexityApiKey(apiKey);
        if (success) {
          setStoredKey(apiKey);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          if (onKeySubmitted) onKeySubmitted();
        }
      } else {
        localStorage.setItem('PERPLEXITY_API_KEY', apiKey);
        setStoredKey(apiKey);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        if (onKeySubmitted) onKeySubmitted();
      }
    }
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setApiKey(value);
    setIsValid(validatePerplexityApiKey(value));
  };

  const clearApiKey = () => {
    localStorage.removeItem('PERPLEXITY_API_KEY');
    setApiKey('');
    setStoredKey(null);
    setIsValid(false);
  };

  // Automatically set the provided key if this is in admin mode and we don't have a key yet
  useEffect(() => {
    if (isAdminMode && !storedKey) {
      // Set the key automatically if on first load
      const keyToSet = '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';
      if (validatePerplexityApiKey(keyToSet)) {
        setApiKey(keyToSet);
        setIsValid(true);
        setCentralizedPerplexityApiKey(keyToSet);
        setStoredKey(keyToSet);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    }
  }, [isAdminMode, storedKey]);

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
              type={isAdminMode ? "text" : (storedKey ? "password" : "text")}
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
            {storedKey ? "Update" : "Save"}
          </Button>
          
          {storedKey && (
            <Button type="button" variant="outline" onClick={clearApiKey}>
              Clear
            </Button>
          )}
        </div>
      </form>
      
      {showSuccess && (
        <div className="bg-green-100 text-green-800 p-2 rounded-md flex items-center">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          <span className="text-sm">API key {storedKey ? "updated" : "saved"} successfully!</span>
        </div>
      )}
      
      {isAdminMode && storedKey && (
        <div className="text-xs text-muted-foreground mt-2">
          <p>Current centralized key: {storedKey.substring(0, 5)}...{storedKey.substring(storedKey.length - 5)}</p>
          <p className="mt-1">All users will use this key for AI functionality.</p>
        </div>
      )}
    </div>
  );
};

export default PerplexityApiKeyForm;
