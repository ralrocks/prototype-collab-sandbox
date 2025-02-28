
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import PhoneFrame from '@/components/PhoneFrame';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/stores/bookingStore';
import { fetchFlights, transformFlightData } from '@/services/travelApi';

const FlightsPage = () => {
  const navigate = useNavigate();
  const { setSelectedFlight, selectedFlight } = useBookingStore();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getFlights = async () => {
      try {
        setLoading(true);
        const from = localStorage.getItem('fromLocation') || 'LAX';
        const to = localStorage.getItem('toLocation') || 'JFK';
        
        const apiFlightData = await fetchFlights(from, to);
        const transformedFlights = transformFlightData(apiFlightData);
        
        setFlights(transformedFlights);
        setError(null);
      } catch (err) {
        console.error('Error fetching flights:', err);
        setError('Failed to load flight data. Please try again.');
        toast.error('Failed to load flights');
      } finally {
        setLoading(false);
      }
    };

    getFlights();
  }, []);

  const handleFlightSelect = (flight: Flight) => {
    setSelectedFlight(flight);
    toast.success(`Selected ${flight.attribute} flight`);
  };

  const handleContinue = () => {
    if (!selectedFlight) {
      toast.error("Please select a flight first!");
      return;
    }
    navigate('/accommodations');
  };

  if (loading) {
    return (
      <PhoneFrame title="Loading Flights..." showBackButton>
        <div className="h-full flex flex-col items-center justify-center p-4">
          <Loader2 size={48} className="animate-spin text-primary mb-4" />
          <p className="text-center text-gray-600">
            Fetching available flights...
          </p>
        </div>
      </PhoneFrame>
    );
  }

  if (error) {
    return (
      <PhoneFrame title="Error" showBackButton>
        <div className="h-full flex flex-col items-center justify-center p-4">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </PhoneFrame>
    );
  }

  const from = localStorage.getItem('fromLocation') || 'LAX';
  const to = localStorage.getItem('toLocation') || 'JFK';

  return (
    <PhoneFrame title={`Flights: ${from} to ${to}`} showBackButton>
      <div className="p-4 h-full flex flex-col">
        <div className="mb-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="grid grid-cols-3 text-xs font-semibold text-gray-700 bg-gray-50 border-b">
              <div className="p-2 border-r">Airline</div>
              <div className="p-2 border-r">Route</div>
              <div className="p-2">Price</div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {flights.length > 0 ? (
                flights.map((flight) => (
                  <div 
                    key={flight.id} 
                    onClick={() => handleFlightSelect(flight)}
                    className={`grid grid-cols-3 text-xs cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedFlight?.id === flight.id 
                        ? 'bg-green-50 border-l-4 border-green-500' 
                        : ''
                    }`}
                  >
                    <div className="p-2 border-r">{flight.attribute}</div>
                    <div className="p-2 border-r">{flight.question1}</div>
                    <div className="p-2 flex items-center justify-between">
                      ${flight.price}
                      {selectedFlight?.id === flight.id && (
                        <Check size={16} className="text-green-600" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No flights available for this route. Try another search.
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-auto">
          <Button
            onClick={handleContinue}
            className="w-full p-2 bg-black text-white rounded-lg flex items-center justify-center text-sm font-medium transition-all"
            disabled={!selectedFlight}
          >
            Next Step
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </PhoneFrame>
  );
};

export default FlightsPage;
