
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface FlightsErrorProps {
  error: string;
  onRetry: () => void;
}

const FlightsError = ({ error, onRetry }: FlightsErrorProps) => {
  // Make error message more user-friendly
  const userFriendlyError = error.includes('API key') 
    ? 'Please add your API key in settings to search for flights'
    : error.includes('parse') || error.includes('JSON') || error.includes('extract')
    ? 'We encountered an issue processing the flight data. The API response couldn\'t be parsed correctly. Please try again.'
    : error.includes('Invalid') || error.includes('format')
    ? 'The flight search returned data in an unexpected format. Please try again with different search criteria.'
    : error;
  
  return (
    <Card className="w-full shadow-md border border-red-100">
      <div className="flex flex-col items-center justify-center py-12 px-6 space-y-6">
        <div className="rounded-full bg-red-50 p-4">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>
        
        <div className="text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-3">No Flights Found</h3>
          <p className="text-red-600 mb-6 max-w-md">{userFriendlyError}</p>
          
          <Button 
            onClick={onRetry} 
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 transition-colors px-6"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FlightsError;
