
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import WebLayout from '@/components/WebLayout';
import { useBookingStore } from '@/stores/bookingStore';
import { Flight } from '@/types';
import { AuthGuard } from '@/components/AuthGuard';

// Custom hooks
import { useFlightFilters } from '@/hooks/useFlightFilters';
import { useFlightSearch } from '@/hooks/useFlightSearch';

// Components
import ApiKeyMissingAlert from '@/components/flights/ApiKeyMissingAlert';
import FlightsLoading from '@/components/flights/FlightsLoading';
import FlightsError from '@/components/flights/FlightsError';
import { FlightHeader } from '@/components/flights/FlightHeader';
import FlightList from '@/components/flights/FlightList';
import FlightFilters from '@/components/flights/FlightFilters';
import MobileFilters from '@/components/flights/MobileFilters';
import TripTypeToggle from '@/components/flights/TripTypeToggle';
import FlightActions from '@/components/flights/FlightActions';

const FlightsPage = () => {
  const navigate = useNavigate();
  const { 
    selectedOutboundFlight, 
    setSelectedOutboundFlight, 
    setIsRoundTrip,
    setSkipHotels
  } = useBookingStore();
  
  const [skipAccommodations, setSkipAccommodations] = useState(false);
  const [isOneWay, setIsOneWay] = useState(false);
  
  const tripTypeFromStorage = localStorage.getItem('tripType') || 'roundtrip';
  const fromName = localStorage.getItem('fromLocationName') || '';
  const toName = localStorage.getItem('toLocationName') || '';
  const departureDate = localStorage.getItem('departureDate') || '';
  const returnDate = localStorage.getItem('returnDate') || '';

  const {
    outboundFlights,
    loading,
    loadingMore,
    error,
    hasMore,
    apiKeyMissing,
    loadMoreFlights,
    setFetchAttempted
  } = useFlightSearch();

  const {
    sortBy,
    setSortBy,
    cabinFilter,
    setCabinFilter,
    maxStops,
    setMaxStops,
    priceRange,
    setPriceRange,
    selectedAirlines,
    setSelectedAirlines,
    airlines,
    filteredAndSortedFlights,
    resetFilters
  } = useFlightFilters(outboundFlights);

  useEffect(() => {
    const isOneWayTrip = tripTypeFromStorage === 'oneway';
    setIsOneWay(isOneWayTrip);
    setIsRoundTrip(!isOneWayTrip);
    
    if (!localStorage.getItem('fromLocation') || 
        !localStorage.getItem('toLocation') || 
        !departureDate) {
      toast.error('Missing flight information', {
        description: 'Please go back to search and provide complete flight details',
        action: {
          label: 'Go to Search',
          onClick: () => navigate('/')
        }
      });
    }
  }, [tripTypeFromStorage, setIsRoundTrip, navigate, departureDate]);

  const handleFlightSelect = (flight: Flight) => {
    setSelectedOutboundFlight(flight);
    toast.success(`Selected ${flight.attribute} flight for outbound journey`);
  };

  const toggleTripType = (checked: boolean) => {
    setIsOneWay(checked);
    localStorage.setItem('tripType', checked ? 'oneway' : 'roundtrip');
    setIsRoundTrip(!checked);
  };

  const formattedDepartureDate = departureDate
    ? new Date(departureDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Selected date';
  
  const formattedReturnDate = returnDate
    ? new Date(returnDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : undefined;

  if (apiKeyMissing) {
    return (
      <WebLayout title="API Key Required" showBackButton>
        <ApiKeyMissingAlert />
      </WebLayout>
    );
  }

  if (loading && outboundFlights.length === 0) {
    return (
      <WebLayout title="Loading Flights..." showBackButton>
        <FlightsLoading />
      </WebLayout>
    );
  }

  if (error && outboundFlights.length === 0) {
    return (
      <WebLayout title="Error" showBackButton>
        <FlightsError 
          error={error} 
          onRetry={() => setFetchAttempted(false)} 
        />
      </WebLayout>
    );
  }

  const filterProps = {
    maxStops,
    setMaxStops,
    cabinFilter,
    setCabinFilter,
    priceRange,
    setPriceRange,
    selectedAirlines,
    setSelectedAirlines,
    airlines,
    resetFilters
  };

  return (
    <AuthGuard>
      <WebLayout title={`Flights: ${fromName} to ${toName}`} showBackButton>
        <div className="max-w-6xl mx-auto">
          <TripTypeToggle isOneWay={isOneWay} toggleTripType={toggleTripType} />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="hidden md:block">
              <div className="bg-white p-4 rounded-md shadow-sm sticky top-4">
                <FlightFilters {...filterProps} />
              </div>
            </div>

            <MobileFilters {...filterProps} />
            
            <div className="md:col-span-3">
              <FlightHeader 
                isRoundTrip={!isOneWay}
                fromName={fromName}
                toName={toName}
                from={localStorage.getItem('fromLocation') || ''}
                to={localStorage.getItem('toLocation') || ''}
                departureDate={formattedDepartureDate}
                returnDate={formattedReturnDate}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
              
              <div className="mb-8">
                <FlightList 
                  flights={filteredAndSortedFlights}
                  direction="outbound"
                  selectedFlight={selectedOutboundFlight}
                  onSelectFlight={(flight) => handleFlightSelect(flight)}
                  fromName={fromName}
                  toName={toName}
                  onLoadMore={loadMoreFlights}
                  hasMore={hasMore}
                  loading={loadingMore}
                />
              </div>
              
              <FlightActions 
                selectedFlight={selectedOutboundFlight}
                isOneWay={isOneWay}
                skipAccommodations={skipAccommodations}
                setSkipAccommodations={(skip) => {
                  setSkipAccommodations(skip);
                  setSkipHotels(skip);
                }}
              />
            </div>
          </div>
        </div>
      </WebLayout>
    </AuthGuard>
  );
};

export default FlightsPage;
