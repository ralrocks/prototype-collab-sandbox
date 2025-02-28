
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { hasPerplexityApiKey } from '@/utils/validateApiKey';

interface ApiKeyErrorHandlerProps {
  error: Error | null;
  onRetry: () => void;
}

const ApiKeyErrorHandler = ({ error, onRetry }: ApiKeyErrorHandlerProps) => {
  const navigate = useNavigate();
  const [hasKey, setHasKey] = useState(hasPerplexityApiKey());
  
  useEffect(() => {
    // Check if we have a key
    setHasKey(hasPerplexityApiKey());
  }, []);
  
  if (!error) return null;
  
  const isApiKeyError = error.message.includes('API key') || 
                        error.message.includes('authorization') || 
                        error.message.includes('Authentication') ||
                        error.message.includes('401') ||
                        error.message.includes('403');
  
  if (isApiKeyError && !hasKey) {
    return (
      <div className="max-w-3xl mx-auto py-4">
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-800">Perplexity API Key Required</AlertTitle>
          <AlertDescription className="text-amber-700">
            {error.message}
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4 text-center">
          <p className="text-gray-700">
            To search for real flights and destinations, you need to add your Perplexity API key in the settings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/settings')} className="bg-blue-600 hover:bg-blue-700">
              Go to Settings
            </Button>
            <Button variant="outline" onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center py-4 space-y-4">
      <Alert className="bg-red-50 border-red-200">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <AlertTitle className="text-red-800">Error</AlertTitle>
        <AlertDescription className="text-red-700">
          {error.message}
        </AlertDescription>
      </Alert>
      
      <Button onClick={onRetry}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
};

export default ApiKeyErrorHandler;
