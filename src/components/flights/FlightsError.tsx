
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FlightsErrorProps {
  error: string;
  onRetry: () => void;
}

const FlightsError = ({ error, onRetry }: FlightsErrorProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default FlightsError;
