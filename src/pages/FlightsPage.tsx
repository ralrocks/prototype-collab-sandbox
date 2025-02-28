
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Check, ArrowRight, Loader2, Calendar, Clock, Plane, Info } from 'lucide-react';
import WebLayout from '@/components/WebLayout';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/stores/bookingStore';
import { fetchFlights, transformFlightData } from '@/services/travelApi';
import { Flight } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';

const FlightsPage = () => {
  const navigate = useNavigate();
  const { setSelectedFlight, selectedFlight } = useBookingStore();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'time'>('price');

  useEffect(() => {
    const getFlights = async () => {
      try {
        setLoading(true);
        const from = localStorage.getItem('fromLocation') || 'LAX';
        const to = localStorage.getItem('toLocation') || 'JFK';
        const departureDate = localStorage.getItem('departureDate') || '2023-12-10';
        
        const apiFlightData = await fetchFlights(from, to, departureDate);
        setFlights(apiFlightData);
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

  const sortedFlights = [...flights].sort((a, b) => {
    if (sortBy === 'price') {
      return a.price - b.price;
    }
    // Sort by departure time if time is selected
    if (a.details?.departureTime && b.details?.departureTime) {
      return new Date(a.details.departureTime).getTime() - new Date(b.details.departureTime).getTime();
    }
    return 0;
  });

  if (loading) {
    return (
      <WebLayout title="Loading Flights..." showBackButton>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 size={48} className="animate-spin text-primary mb-4" />
          <p className="text-center text-gray-600">
            Searching for the best flight deals...
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
  const departureDate = localStorage.getItem('departureDate') 
    ? new Date(localStorage.getItem('departureDate')!).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) 
    : 'Selected date';

  const formatDuration = (duration: string) => {
    // Simple PT5H30M format parser
    const hours = duration.match(/(\d+)H/)?.[1] || '0';
    const minutes = duration.match(/(\d+)M/)?.[1] || '0';
    return `${hours}h ${minutes}m`;
  };

  return (
    <WebLayout title={`Flights: ${from} to ${to}`} showBackButton>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-1">Select Your Flight</h2>
              <p className="text-gray-600 flex items-center">
                <Calendar className="mr-2" size={16} />
                Departing {departureDate}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant={sortBy === 'price' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSortBy('price')}
              >
                Sort by Price
              </Button>
              <Button 
                variant={sortBy === 'time' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSortBy('time')}
              >
                Sort by Time
              </Button>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 mb-8">
          {sortedFlights.length > 0 ? (
            sortedFlights.map((flight) => (
              <Card 
                key={flight.id} 
                className={`hover:shadow-md transition-all cursor-pointer border-2 ${
                  selectedFlight?.id === flight.id ? 'border-green-500' : 'border-transparent'
                }`}
                onClick={() => handleFlightSelect(flight)}
              >
                <CardContent className="p-0">
                  <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                        <Plane className="text-gray-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-medium">{flight.attribute}</h3>
                        <p className="text-sm text-gray-500">
                          {flight.details?.flightNumber}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="font-medium">{from}</span>
                        <div className="w-12 h-px bg-gray-300 relative">
                          <div className="absolute w-2 h-2 bg-gray-300 rounded-full -top-[3px] -right-1"></div>
                        </div>
                        <span className="font-medium">{to}</span>
                      </div>
                      <div className="flex items-center justify-center mt-1 text-sm text-gray-500">
                        <Clock size={14} className="mr-1" />
                        {flight.details ? formatDuration(flight.details.duration) : "5h 30m"}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold">${flight.price}</span>
                        <p className="text-xs text-gray-500">per person</p>
                      </div>
                      <div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant={selectedFlight?.id === flight.id ? "default" : "outline"}
                                className={selectedFlight?.id === flight.id ? "bg-green-500 hover:bg-green-600" : ""}
                              >
                                {selectedFlight?.id === flight.id ? (
                                  <>
                                    <Check size={16} className="mr-1" />
                                    Selected
                                  </>
                                ) : (
                                  "Select"
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {selectedFlight?.id === flight.id 
                                ? "This flight is selected" 
                                : "Click to select this flight"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                  
                  {flight.details && (
                    <div className="border-t px-4 md:px-6 py-3 bg-gray-50 flex flex-wrap gap-3">
                      <Badge variant="outline" className="bg-white">
                        <Clock size={14} className="mr-1" /> {new Date(flight.details.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </Badge>
                      <Badge variant="outline" className="bg-white">
                        {flight.details.cabin}
                      </Badge>
                      <Badge variant="outline" className="bg-white">
                        {flight.details.stops === 0 ? 'Nonstop' : `${flight.details.stops} stop${flight.details.stops > 1 ? 's' : ''}`}
                      </Badge>
                      <Badge variant="outline" className="bg-white">
                        <Info size={14} className="mr-1" /> Includes 1 carry-on bag
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500 mb-4">No flights available for this route. Try another search.</p>
                <Button onClick={() => navigate('/')}>
                  Back to Search
                </Button>
              </CardContent>
            </Card>
          )}
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
