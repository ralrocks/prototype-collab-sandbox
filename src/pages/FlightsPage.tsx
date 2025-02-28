
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Check, ArrowRight, Loader2, Calendar, Clock, Plane, Info, RotateCcw, ArrowLeftRight, RefreshCw } from 'lucide-react';
import WebLayout from '@/components/WebLayout';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/stores/bookingStore';
import { fetchFlights } from '@/services/travelApi';
import { Flight } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthGuard } from '@/components/AuthGuard';

const FlightsPage = () => {
  const navigate = useNavigate();
  const { 
    selectedOutboundFlight, 
    selectedReturnFlight, 
    setSelectedOutboundFlight, 
    setSelectedReturnFlight,
    isRoundTrip
  } = useBookingStore();
  
  const [outboundFlights, setOutboundFlights] = useState<Flight[]>([]);
  const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'time'>('price');
  const [activeTab, setActiveTab] = useState<'outbound' | 'return'>('outbound');

  useEffect(() => {
    getFlights();
  }, []);

  const getFlights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const from = localStorage.getItem('fromLocation') || 'LAX';
      const to = localStorage.getItem('toLocation') || 'JFK';
      const departureDate = localStorage.getItem('departureDate') || '2023-12-10';
      const tripType = localStorage.getItem('tripType') || 'oneway';
      
      console.log('Fetching outbound flights from:', from, 'to:', to, 'on:', departureDate);
      
      // Fetch outbound flights
      const apiOutboundFlightData = await fetchFlights(from, to, departureDate, undefined, 'oneway');
      console.log('Outbound flights received:', apiOutboundFlightData.length);
      setOutboundFlights(apiOutboundFlightData);
      
      // If round trip, also fetch return flights
      if (tripType === 'roundtrip') {
        const returnDate = localStorage.getItem('returnDate');
        if (returnDate) {
          console.log('Fetching return flights from:', to, 'to:', from, 'on:', returnDate);
          const apiReturnFlightData = await fetchFlights(to, from, returnDate, undefined, 'oneway');
          console.log('Return flights received:', apiReturnFlightData.length);
          setReturnFlights(apiReturnFlightData);
        }
      }
    } catch (err) {
      console.error('Error fetching flights:', err);
      setError('Failed to load flight data. Please try again.');
      toast.error('Failed to load flights');
    } finally {
      setLoading(false);
    }
  };

  const handleFlightSelect = (flight: Flight, direction: 'outbound' | 'return') => {
    if (direction === 'outbound') {
      setSelectedOutboundFlight(flight);
      toast.success(`Selected ${flight.attribute} flight for outbound journey`);
      
      // If this is a round trip and we haven't selected a return flight yet, switch to return tab
      if (isRoundTrip && !selectedReturnFlight && returnFlights.length > 0) {
        setActiveTab('return');
      }
    } else {
      setSelectedReturnFlight(flight);
      toast.success(`Selected ${flight.attribute} flight for return journey`);
    }
  };

  const handleContinue = () => {
    if (!selectedOutboundFlight) {
      toast.error("Please select an outbound flight!");
      return;
    }
    
    if (isRoundTrip && !selectedReturnFlight) {
      toast.error("Please select a return flight!");
      setActiveTab('return');
      return;
    }
    
    navigate('/accommodations');
  };

  const sortFlights = (flights: Flight[]) => {
    return [...flights].sort((a, b) => {
      if (sortBy === 'price') {
        return a.price - b.price;
      }
      // Sort by departure time if time is selected
      if (a.details?.departureTime && b.details?.departureTime) {
        return new Date(a.details.departureTime).getTime() - new Date(b.details.departureTime).getTime();
      }
      return 0;
    });
  };

  const sortedOutboundFlights = sortFlights(outboundFlights);
  const sortedReturnFlights = sortFlights(returnFlights);

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
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => getFlights()}>
              <RefreshCw className="mr-2 h-4 w-4" />
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
  
  const returnDate = localStorage.getItem('returnDate') 
    ? new Date(localStorage.getItem('returnDate')!).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) 
    : undefined;

  const formatDuration = (duration: string) => {
    // Simple PT5H30M format parser
    const hours = duration.match(/(\d+)H/)?.[1] || '0';
    const minutes = duration.match(/(\d+)M/)?.[1] || '0';
    return `${hours}h ${minutes}m`;
  };

  return (
    <AuthGuard>
      <WebLayout title={`Flights: ${from} to ${to}`} showBackButton>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold mb-1">Select Your {isRoundTrip ? 'Flights' : 'Flight'}</h2>
                {isRoundTrip ? (
                  <div className="flex items-center text-gray-600 mb-2">
                    <Badge variant="outline" className="mr-2 bg-blue-50">Round Trip</Badge>
                    <ArrowLeftRight className="h-4 w-4 mr-2" />
                    {from} ↔ {to}
                  </div>
                ) : (
                  <p className="text-gray-600 flex items-center">
                    <Calendar className="mr-2" size={16} />
                    Departing {departureDate}
                  </p>
                )}
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
          
          {isRoundTrip ? (
            <Tabs 
              defaultValue="outbound" 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as 'outbound' | 'return')}
              className="mb-8"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="outbound" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  <Plane className="mr-2 h-4 w-4" />
                  Outbound Flight
                  {selectedOutboundFlight && <Check className="ml-2 h-4 w-4 text-green-500" />}
                </TabsTrigger>
                <TabsTrigger value="return" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Return Flight
                  {selectedReturnFlight && <Check className="ml-2 h-4 w-4 text-green-500" />}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="outbound" className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-md mb-4 flex items-center text-blue-700">
                  <Calendar className="mr-2 h-5 w-5" />
                  <span>Outbound: <strong>{departureDate}</strong> - {from} to {to}</span>
                </div>
                
                {renderFlightList(sortedOutboundFlights, 'outbound')}
              </TabsContent>
              
              <TabsContent value="return" className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-md mb-4 flex items-center text-blue-700">
                  <Calendar className="mr-2 h-5 w-5" />
                  <span>Return: <strong>{returnDate}</strong> - {to} to {from}</span>
                </div>
                
                {renderFlightList(sortedReturnFlights, 'return')}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="mb-8">
              {renderFlightList(sortedOutboundFlights, 'outbound')}
            </div>
          )}
          
          <div className="flex justify-end">
            <Button
              onClick={handleContinue}
              className="px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              disabled={!selectedOutboundFlight || (isRoundTrip && !selectedReturnFlight)}
            >
              Continue to Accommodations
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </WebLayout>
    </AuthGuard>
  );
  
  function renderFlightList(flights: Flight[], direction: 'outbound' | 'return') {
    const selectedFlight = direction === 'outbound' ? selectedOutboundFlight : selectedReturnFlight;
    
    if (flights.length === 0) {
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 mb-4">No flights available for this route. Try another search.</p>
            <Button onClick={() => navigate('/')}>
              Back to Search
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="space-y-4">
        {flights.map((flight) => (
          <Card 
            key={flight.id} 
            className={`hover:shadow-lg transition-all cursor-pointer border-2 ${
              selectedFlight?.id === flight.id ? 'border-green-500' : 'border-transparent'
            }`}
            onClick={() => handleFlightSelect(flight, direction)}
          >
            <CardContent className="p-0">
              <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <Plane className="text-blue-600" size={24} />
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
                    <span className="font-medium">{direction === 'outbound' ? from : to}</span>
                    <div className="w-12 h-px bg-gray-300 relative">
                      <div className="absolute w-2 h-2 bg-gray-300 rounded-full -top-[3px] -right-1"></div>
                    </div>
                    <span className="font-medium">{direction === 'outbound' ? to : from}</span>
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
        ))}
      </div>
    );
  }
};

export default FlightsPage;
