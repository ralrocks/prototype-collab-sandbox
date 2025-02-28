
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';
import WebLayout from '@/components/WebLayout';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/stores/bookingStore';
import { fetchFlights } from '@/services/travelApi';
import { Flight } from '@/types';
import { AuthGuard } from '@/components/AuthGuard';

// New components
import ApiKeyMissingAlert from '@/components/flights/ApiKeyMissingAlert';
import FlightsLoading from '@/components/flights/FlightsLoading';
import FlightsError from '@/components/flights/FlightsError';
import FlightHeader from '@/components/flights/FlightHeader';
import FlightTabs from '@/components/flights/FlightTabs';
import FlightList from '@/components/flights/FlightList';

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
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  // Location and date details
  const from = localStorage.getItem('fromLocation') || 'LAX';
  const to = localStorage.getItem('toLocation') || 'JFK';
  const fromName = localStorage.getItem('fromLocationName') || 'Los Angeles';
  const toName = localStorage.getItem('toLocationName') || 'New York';
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

  useEffect(() => {
    // Check if API key exists
    const apiKey = localStorage.getItem('PERPLEXITY_API_KEY');
    if (!apiKey) {
      setApiKeyMissing(true);
      setLoading(false);
      return;
    }
    
    if (!fetchAttempted) {
      getFlights();
      setFetchAttempted(true);
    }
  }, [fetchAttempted]);

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
      const outboundFlightsData = await fetchFlights(from, to, departureDate, undefined, 'oneway');
      console.log('Outbound flights received:', outboundFlightsData.length);
      setOutboundFlights(outboundFlightsData);
      
      // If round trip, also fetch return flights
      if (tripType === 'roundtrip') {
        const returnDate = localStorage.getItem('returnDate');
        if (returnDate) {
          console.log('Fetching return flights from:', to, 'to:', from, 'on:', returnDate);
          const returnFlightsData = await fetchFlights(to, from, returnDate, undefined, 'oneway');
          console.log('Return flights received:', returnFlightsData.length);
          setReturnFlights(returnFlightsData);
        }
      }
    } catch (err: any) {
      console.error('Error fetching flights:', err);
      if (err.message?.includes('API key not found')) {
        setApiKeyMissing(true);
      } else {
        setError('Failed to load flight data. Please try again.');
        toast.error('Failed to load flights');
      }
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

  // Render functions for different states
  if (apiKeyMissing) {
    return (
      <WebLayout title="API Key Required" showBackButton>
        <ApiKeyMissingAlert />
      </WebLayout>
    );
  }

  if (loading) {
    return (
      <WebLayout title="Loading Flights..." showBackButton>
        <FlightsLoading />
      </WebLayout>
    );
  }

  if (error) {
    return (
      <WebLayout title="Error" showBackButton>
        <FlightsError 
          error={error} 
          onRetry={() => setFetchAttempted(false)} 
        />
      </WebLayout>
    );
  }

  return (
    <AuthGuard>
      <WebLayout title={`Flights: ${fromName} to ${toName}`} showBackButton>
        <div className="max-w-4xl mx-auto">
          <FlightHeader 
            isRoundTrip={isRoundTrip}
            fromName={fromName}
            toName={toName}
            from={from}
            to={to}
            departureDate={departureDate}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
          
          {isRoundTrip ? (
            <FlightTabs 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              outboundFlights={sortedOutboundFlights}
              returnFlights={sortedReturnFlights}
              selectedOutboundFlight={selectedOutboundFlight}
              selectedReturnFlight={selectedReturnFlight}
              handleFlightSelect={handleFlightSelect}
              departureDate={departureDate}
              returnDate={returnDate}
              fromName={fromName}
              toName={toName}
            />
          ) : (
            <div className="mb-8">
              <FlightList 
                flights={sortedOutboundFlights}
                direction="outbound"
                selectedFlight={selectedOutboundFlight}
                onSelectFlight={handleFlightSelect}
                fromName={fromName}
                toName={toName}
              />
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
};

export default FlightsPage;
