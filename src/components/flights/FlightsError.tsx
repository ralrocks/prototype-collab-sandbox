
import { RefreshCw } from 'lucide-react';
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
    <Card className="w-full shadow-md">
      <div className="flex flex-col items-center justify-center py-12 px-4 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Flights Found</h3>
          <p className="text-red-500 mb-4">{userFriendlyError}</p>
          <Button onClick={onRetry} variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FlightsError;
