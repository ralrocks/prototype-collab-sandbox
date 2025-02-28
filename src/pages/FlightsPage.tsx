
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import WebLayout from '@/components/WebLayout';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/stores/bookingStore';
import { fetchFlights, transformFlightData } from '@/services/travelApi';
import { Flight } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

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
      <WebLayout title="Loading Flights..." showBackButton>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 size={48} className="animate-spin text-primary mb-4" />
          <p className="text-center text-gray-600">
            Fetching available flights...
          </p>
        </div>
      </WebLayout>
    );
  }

  if (error) {
    return (
      <WebLayout title="Error" showBackButton>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </WebLayout>
    );
  }

  const from = localStorage.getItem('fromLocation') || 'LAX';
  const to = localStorage.getItem('toLocation') || 'JFK';

  return (
    <WebLayout title={`Flights: ${from} to ${to}`} showBackButton>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Select Your Flight</h2>
          
          <Card>
            <div className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Airline</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {flights.length > 0 ? (
                    flights.map((flight) => (
                      <tr 
                        key={flight.id} 
                        onClick={() => handleFlightSelect(flight)}
                        className={`hover:bg-gray-50 cursor-pointer ${
                          selectedFlight?.id === flight.id ? 'bg-green-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{flight.attribute}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{flight.question1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">${flight.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <span className={`p-2 rounded-full ${selectedFlight?.id === flight.id ? 'bg-green-100 text-green-600' : 'text-gray-400'}`}>
                            {selectedFlight?.id === flight.id ? (
                              <Check size={18} />
                            ) : ''}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No flights available for this route. Try another search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        
        <div className="flex justify-end">
          <Button
            onClick={handleContinue}
            className="px-6"
            disabled={!selectedFlight}
          >
            Continue to Accommodations
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </WebLayout>
  );
};

export default FlightsPage;
