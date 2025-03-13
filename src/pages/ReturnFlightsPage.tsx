
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';
import WebLayout from '@/components/WebLayout';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/stores/bookingStore';
import { fetchFlights, generateFallbackFlights } from '@/services/flightService';
import { Flight } from '@/types';
import { AuthGuard } from '@/components/AuthGuard';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

// Components
import ApiKeyMissingAlert from '@/components/flights/ApiKeyMissingAlert';
import FlightsLoading from '@/components/flights/FlightsLoading';
import FlightsError from '@/components/flights/FlightsError';
import FlightHeader from '@/components/flights/FlightHeader';
import FlightList from '@/components/flights/FlightList';

const ReturnFlightsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    selectedReturnFlight,
    setSelectedReturnFlight,
    setIsRoundTrip,
    setSkipHotels
  } = useBookingStore();
  
  const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'time'>('price');
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [skipAccommodations, setSkipAccommodations] = useState(false);
  
  // Location and date details
  const from = localStorage.getItem('fromLocation') || 'LAX';
  const to = localStorage.getItem('toLocation') || 'JFK';
  const fromName = localStorage.getItem('fromLocationName') || 'Los Angeles';
  const toName = localStorage.getItem('toLocationName') || 'New York';
  
  // Get return date from localStorage, if not available, create a default date (today + 7 days)
  let returnDateValue = localStorage.getItem('returnDate');
  if (!returnDateValue) {
    const defaultReturnDate = new Date();
    defaultReturnDate.setDate(defaultReturnDate.getDate() + 7);
    returnDateValue = defaultReturnDate.toISOString().split('T')[0];
    localStorage.setItem('returnDate', returnDateValue);
  }
  
  const returnDate = new Date(returnDateValue).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  useEffect(() => {
    // Set the round trip status in the store
    setIsRoundTrip(true);
    
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
  }, [fetchAttempted, setIsRoundTrip]);

  const getFlights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fromCode = localStorage.getItem('fromLocation') || 'LAX';
      const toCode = localStorage.getItem('toLocation') || 'JFK';
      
      if (!returnDateValue) {
        console.error('Return date missing, using fallback data');
        setReturnFlights(generateFallbackFlights(toCode, fromCode, new Date().toISOString().split('T')[0], 'oneway'));
        setLoading(false);
        return;
      }
      
      console.log('Fetching return flights from:', toCode, 'to:', fromCode, 'on:', returnDateValue);
      const returnFlightsData = await fetchFlights(toCode, fromCode, returnDateValue, undefined, 'oneway');
      console.log('Return flights received:', returnFlightsData.length);
      setReturnFlights(returnFlightsData);
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
    setSelectedReturnFlight(flight);
    toast.success(`Selected ${flight.attribute} flight for return journey`);
  };

  const handleContinue = () => {
    if (!selectedReturnFlight) {
      toast.error("Please select a return flight!");
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
      <WebLayout title="Loading Return Flights..." showBackButton>
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
      <WebLayout title={`Return Flights: ${toName} to ${fromName}`} showBackButton>
        <div className="max-w-4xl mx-auto">
          <FlightHeader 
            isRoundTrip={true}
            fromName={toName}
            toName={fromName}
            from={to}
            to={from}
            departureDate={returnDate}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
          
          <div className="mb-8">
            <FlightList 
              flights={sortedReturnFlights}
              direction="return"
              selectedFlight={selectedReturnFlight}
              onSelectFlight={(flight) => handleFlightSelect(flight)}
              fromName={toName}
              toName={fromName}
            />
          </div>
          
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
          
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => navigate('/flights')}
              className="flex items-center gap-2"
            >
              Back to Outbound Flights
            </Button>
            
            <Button
              onClick={handleContinue}
              className="px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              disabled={!selectedReturnFlight}
            >
              {skipAccommodations ? 'Continue to Checkout' : 'Continue to Accommodations'}
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </WebLayout>
    </AuthGuard>
  );
};

export default ReturnFlightsPage;
