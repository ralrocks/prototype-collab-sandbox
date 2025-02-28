
import { Loader2 } from 'lucide-react';

const FlightsLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 size={48} className="animate-spin text-primary mb-4" />
      <p className="text-center text-gray-600">
        Searching for the best flight deals...
      </p>
    </div>
  );
};

export default FlightsLoading;
