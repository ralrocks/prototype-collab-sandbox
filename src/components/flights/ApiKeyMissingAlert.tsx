
import { useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ApiKeyMissingAlert = () => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-3xl mx-auto py-8">
      <Alert className="mb-6 bg-amber-50 border-amber-200">
        <KeyRound className="h-5 w-5 text-amber-600" />
        <AlertTitle className="text-amber-800">Perplexity API Key Required</AlertTitle>
        <AlertDescription className="text-amber-700">
          You need to add your Perplexity API key to use real-time flight search.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-4 text-center">
        <p className="text-gray-700">
          To search for real flights, you need to add your Perplexity API key in the settings.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate('/settings')} className="bg-blue-600 hover:bg-blue-700">
            Go to Settings
          </Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Search
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Don't have a Perplexity API key?{" "}
          <a 
            href="https://docs.perplexity.ai/docs/getting-started" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Get one here
          </a>
        </p>
      </div>
    </div>
  );
};

export default ApiKeyMissingAlert;
