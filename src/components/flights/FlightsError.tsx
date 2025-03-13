
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FlightsErrorProps {
  error: string;
  onRetry: () => void;
}

const FlightsError = ({ error, onRetry }: FlightsErrorProps) => {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="text-center">
          <p className="text-red-500 mb-4 font-medium">{error}</p>
          <p className="text-gray-600 mb-4 text-sm">
            There was a problem loading your flight data. This could be due to network issues, 
            API limits, or invalid location data.
          </p>
          <Button onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlightsError;
