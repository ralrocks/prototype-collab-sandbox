
import { Loader2 } from 'lucide-react';

const FlightsLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 size={40} className="animate-spin text-primary mb-3" />
      <p className="text-center text-gray-600">
        Finding flights...
      </p>
      <p className="text-xs text-gray-400 mt-1">
        Showing preliminary results while searching for the best options
      </p>
      <p className="text-xs text-gray-400 mt-1">
        (This may take up to 10 seconds)
      </p>
    </div>
  );
};

export default FlightsLoading;
