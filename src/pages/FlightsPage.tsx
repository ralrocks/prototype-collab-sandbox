import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight, Filter } from 'lucide-react';
import WebLayout from '@/components/WebLayout';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/stores/bookingStore';
import { fetchFlights } from '@/services/travelApi';
import { Flight } from '@/types';
import { AuthGuard } from '@/components/AuthGuard';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const [sortBy, setSortBy] = useState<'price' | 'time'>('price');
  const [cabinFilter, setCabinFilter] = useState<string | null>(null);
  const [maxStops, setMaxStops] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [skipAccommodations, setSkipAccommodations] = useState(false);
  const [isOneWay, setIsOneWay] = useState(false);
  
  const tripTypeFromStorage = localStorage.getItem('tripType') || 'roundtrip';

  const from = localStorage.getItem('fromLocation') || '';
  const to = localStorage.getItem('toLocation') || '';
  const fromName = localStorage.getItem('fromLocationName') || '';
  const toName = localStorage.getItem('toLocationName') || '';
  const departureDate = localStorage.getItem('departureDate') || '';
  const returnDate = localStorage.getItem('returnDate') || '';

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

  useEffect(() => {
    const isOneWayTrip = tripTypeFromStorage === 'oneway';
    setIsOneWay(isOneWayTrip);
    
    setIsRoundTrip(!isOneWayTrip);
    
    if (!from || !to || !departureDate) {
      toast.error('Missing flight information', {
        description: 'Please go back to search and provide complete flight details',
        action: {
          label: 'Go to Search',
          onClick: () => navigate('/')
        }
      });
      setError('Missing required flight information');
      setLoading(false);
      return;
    }
    
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
  }, [fetchAttempted, navigate, setIsRoundTrip, tripTypeFromStorage, from, to, departureDate]);

  const loadMoreFlights = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      
      const newFlights = await fetchFlights(
        from, 
        to, 
        departureDate, 
        undefined, 
        'oneway',
        nextPage
      );
      
      if (newFlights.length === 0) {
        setHasMore(false);
      } else {
        setOutboundFlights(prev => [...prev, ...newFlights]);
        setPage(nextPage);
      }
    } catch (err: any) {
      console.error('Error loading more flights:', err);
      toast.error('Failed to load more flights');
    } finally {
      setLoadingMore(false);
    }
  }, [from, to, departureDate, page, loadingMore, hasMore]);

  const getFlights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching outbound flights from:', from, 'to:', to, 'on:', departureDate);
      
      const outboundFlightsData = await fetchFlights(from, to, departureDate, undefined, 'oneway', 1);
      console.log('Outbound flights received:', outboundFlightsData.length);
      
      setOutboundFlights(outboundFlightsData);
      setPage(1);
      setHasMore(outboundFlightsData.length >= 10);
    } catch (err: any) {
      console.error('Error fetching flights:', err);
      if (err.message?.includes('API key not found')) {
        setApiKeyMissing(true);
      } else {
        setError(err.message || 'Failed to load flight data. Please try again.');
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
    
    if (!isOneWay) {
      navigate('/return-flights');
      return;
    }
    
    setSkipHotels(skipAccommodations);
    
    if (skipAccommodations) {
      navigate('/checkout');
    } else {
      navigate('/accommodations');
    }
  };

  const filteredAndSortedFlights = () => {
    let filtered = [...outboundFlights];
    
    if (cabinFilter) {
      filtered = filtered.filter(f => 
        f.details?.cabin?.toUpperCase() === cabinFilter
      );
    }
    
    if (maxStops !== null) {
      filtered = filtered.filter(f => 
        f.details?.stops !== undefined && f.details.stops <= maxStops
      );
    }
    
    filtered = filtered.filter(f => 
      f.price >= priceRange[0] && f.price <= priceRange[1]
    );
    
    if (selectedAirlines.length > 0) {
      filtered = filtered.filter(f => 
        selectedAirlines.includes(f.attribute)
      );
    }
    
    return filtered.sort((a, b) => {
      if (sortBy === 'price') {
        return a.price - b.price;
      }
      if (a.details?.departureTime && b.details?.departureTime) {
        return new Date(a.details.departureTime).getTime() - new Date(b.details.departureTime).getTime();
      }
      return 0;
    });
  };

  const sortedOutboundFlights = filteredAndSortedFlights();
  
  const airlines = [...new Set(outboundFlights.map(f => f.attribute))];

  const resetFilters = () => {
    setCabinFilter(null);
    setMaxStops(null);
    setPriceRange([0, 2000]);
    setSelectedAirlines([]);
  };

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

  return (
    <AuthGuard>
      <WebLayout title={`Flights: ${fromName} to ${toName}`} showBackButton>
        <div className="max-w-6xl mx-auto">
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
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="hidden md:block">
              <div className="bg-white p-4 rounded-md shadow-sm sticky top-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">Filters</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetFilters}
                    className="text-xs text-blue-600"
                  >
                    Reset
                  </Button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Stops</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="nonstop" 
                          checked={maxStops === 0}
                          onCheckedChange={(checked) => setMaxStops(checked ? 0 : null)}
                        />
                        <Label htmlFor="nonstop" className="ml-2">Nonstop only</Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox 
                          id="max-1-stop" 
                          checked={maxStops === 1}
                          onCheckedChange={(checked) => setMaxStops(checked ? 1 : null)}
                        />
                        <Label htmlFor="max-1-stop" className="ml-2">Max 1 stop</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Cabin Class</h4>
                    <div className="space-y-2">
                      {['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'].map(cabin => (
                        <div key={cabin} className="flex items-center">
                          <Checkbox 
                            id={`cabin-${cabin}`} 
                            checked={cabinFilter === cabin}
                            onCheckedChange={(checked) => setCabinFilter(checked ? cabin : null)}
                          />
                          <Label htmlFor={`cabin-${cabin}`} className="ml-2">
                            {cabin.replace('_', ' ').charAt(0) + cabin.replace('_', ' ').slice(1).toLowerCase()}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Price Range</h4>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="number" 
                        min="0" 
                        max={priceRange[1]} 
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        className="w-24 p-2 border rounded text-sm"
                      />
                      <span>to</span>
                      <input 
                        type="number" 
                        min={priceRange[0]} 
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 2000])}
                        className="w-24 p-2 border rounded text-sm"
                      />
                    </div>
                  </div>

                  {airlines.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Airlines</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {airlines.map(airline => (
                          <div key={airline} className="flex items-center">
                            <Checkbox 
                              id={`airline-${airline}`} 
                              checked={selectedAirlines.includes(airline)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedAirlines([...selectedAirlines, airline]);
                                } else {
                                  setSelectedAirlines(selectedAirlines.filter(a => a !== airline));
                                }
                              }}
                            />
                            <Label htmlFor={`airline-${airline}`} className="ml-2">{airline}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="md:hidden mb-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <div className="py-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg">Filters</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={resetFilters}
                        className="text-xs text-blue-600"
                      >
                        Reset
                      </Button>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-2">Stops</h4>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Checkbox 
                              id="mobile-nonstop" 
                              checked={maxStops === 0}
                              onCheckedChange={(checked) => setMaxStops(checked ? 0 : null)}
                            />
                            <Label htmlFor="mobile-nonstop" className="ml-2">Nonstop only</Label>
                          </div>
                          <div className="flex items-center">
                            <Checkbox 
                              id="mobile-max-1-stop" 
                              checked={maxStops === 1}
                              onCheckedChange={(checked) => setMaxStops(checked ? 1 : null)}
                            />
                            <Label htmlFor="mobile-max-1-stop" className="ml-2">Max 1 stop</Label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Cabin Class</h4>
                        <div className="space-y-2">
                          {['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'].map(cabin => (
                            <div key={cabin} className="flex items-center">
                              <Checkbox 
                                id={`mobile-cabin-${cabin}`} 
                                checked={cabinFilter === cabin}
                                onCheckedChange={(checked) => setCabinFilter(checked ? cabin : null)}
                              />
                              <Label htmlFor={`mobile-cabin-${cabin}`} className="ml-2">
                                {cabin.replace('_', ' ').charAt(0) + cabin.replace('_', ' ').slice(1).toLowerCase()}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Price Range</h4>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="number" 
                            min="0" 
                            max={priceRange[1]} 
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                            className="w-20 p-2 border rounded text-sm"
                          />
                          <span>to</span>
                          <input 
                            type="number" 
                            min={priceRange[0]} 
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 2000])}
                            className="w-20 p-2 border rounded text-sm"
                          />
                        </div>
                      </div>

                      {airlines.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Airlines</h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {airlines.map(airline => (
                              <div key={airline} className="flex items-center">
                                <Checkbox 
                                  id={`mobile-airline-${airline}`} 
                                  checked={selectedAirlines.includes(airline)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedAirlines([...selectedAirlines, airline]);
                                    } else {
                                      setSelectedAirlines(selectedAirlines.filter(a => a !== airline));
                                    }
                                  }}
                                />
                                <Label htmlFor={`mobile-airline-${airline}`} className="ml-2">{airline}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            <div className="md:col-span-3">
              <FlightHeader 
                isRoundTrip={!isOneWay}
                fromName={fromName}
                toName={toName}
                from={from}
                to={to}
                departureDate={formattedDepartureDate}
                returnDate={formattedReturnDate}
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
                  onLoadMore={loadMoreFlights}
                  hasMore={hasMore}
                  loading={loadingMore}
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
          </div>
        </div>
      </WebLayout>
    </AuthGuard>
  );
};

export default FlightsPage;
