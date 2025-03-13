
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

// Components
import ApiKeyMissingAlert from '@/components/flights/ApiKeyMissingAlert';
import FlightsLoading from '@/components/flights/FlightsLoading';
import FlightsError from '@/components/flights/FlightsError';
import FlightHeader from '@/components/flights/FlightHeader';
import FlightList from '@/components/flights/FlightList';

const FlightsPage = () => {
  const navigate = useNavigate();
  const { 
    selectedOutboundFlight, 
    setSelectedOutboundFlight, 
    setIsRoundTrip,
    setSkipHotels
  } = useBookingStore();
  
  const [outboundFlights, setOutboundFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'time'>('price');
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [skipAccommodations, setSkipAccommodations] = useState(false);
  const [isOneWay, setIsOneWay] = useState(false);
  
  // Get trip type from localStorage or default to round trip
  const tripTypeFromStorage = localStorage.getItem('tripType') || 'roundtrip';
  const isRoundTrip = tripTypeFromStorage === 'roundtrip';

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
    // Initialize one-way flag based on localStorage
    setIsOneWay(tripTypeFromStorage === 'oneway');
    
    // Set the round trip status in the store
    setIsRoundTrip(isRoundTrip);
    
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
  }, [fetchAttempted, isRoundTrip, setIsRoundTrip, tripTypeFromStorage]);

  const getFlights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fromCode = localStorage.getItem('fromLocation') || 'LAX';
      const toCode = localStorage.getItem('toLocation') || 'JFK';
      const departureDate = localStorage.getItem('departureDate') || '2023-12-10';
      const tripType = localStorage.getItem('tripType') || 'roundtrip';
      
      console.log('Fetching outbound flights from:', fromCode, 'to:', toCode, 'on:', departureDate);
      
      // Fetch outbound flights
      const outboundFlightsData = await fetchFlights(fromCode, toCode, departureDate, undefined, 'oneway');
      console.log('Outbound flights received:', outboundFlightsData.length);
      setOutboundFlights(outboundFlightsData);
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

  const handleFlightSelect = (flight: Flight) => {
    setSelectedOutboundFlight(flight);
    toast.success(`Selected ${flight.attribute} flight for outbound journey`);
  };

  const toggleTripType = (checked: boolean) => {
    setIsOneWay(checked);
    localStorage.setItem('tripType', checked ? 'oneway' : 'roundtrip');
    setIsRoundTrip(!checked);
  };

  const handleContinue = () => {
    if (!selectedOutboundFlight) {
      toast.error("Please select an outbound flight!");
      return;
    }
    
    // If this is a round trip, navigate to return flights
    if (!isOneWay) {
      navigate('/return-flights');
      return;
    }
    
    // Set skip hotels preference in the store
    setSkipHotels(skipAccommodations);
    
    // Navigate to accommodations or directly to checkout if skipping
    if (skipAccommodations) {
      navigate('/checkout');
    } else {
      navigate('/accommodations');
    }
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
          <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-md shadow-sm">
            <span className="font-medium">Trip Type:</span>
            <div className="flex items-center space-x-2">
              <span className={!isOneWay ? "font-medium text-blue-600" : "text-gray-500"}>Round Trip</span>
              <Switch 
                checked={isOneWay} 
                onCheckedChange={toggleTripType}
              />
              <span className={isOneWay ? "font-medium text-blue-600" : "text-gray-500"}>One Way</span>
            </div>
          </div>
          
          <FlightHeader 
            isRoundTrip={!isOneWay}
            fromName={fromName}
            toName={toName}
            from={from}
            to={to}
            departureDate={departureDate}
            returnDate={returnDate}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
          
          <div className="mb-8">
            <FlightList 
              flights={sortedOutboundFlights}
              direction="outbound"
              selectedFlight={selectedOutboundFlight}
              onSelectFlight={(flight) => handleFlightSelect(flight)}
              fromName={fromName}
              toName={toName}
            />
          </div>
          
          {isOneWay && (
            <div className="mb-6 flex items-center space-x-2">
              <Checkbox 
                id="skip-accommodations" 
                checked={skipAccommodations}
                onCheckedChange={(checked) => setSkipAccommodations(checked === true)}
              />
              <Label 
                htmlFor="skip-accommodations" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Skip hotel selection and proceed directly to checkout
              </Label>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              Change Search
            </Button>
            
            <Button
              onClick={handleContinue}
              className="px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              disabled={!selectedOutboundFlight}
            >
              {isOneWay 
                ? (skipAccommodations ? 'Continue to Checkout' : 'Continue to Accommodations') 
                : 'Continue to Return Flights'}
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </WebLayout>
    </AuthGuard>
  );
};

export default FlightsPage;
