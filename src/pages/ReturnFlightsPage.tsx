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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

// Components
import ApiKeyMissingAlert from '@/components/flights/ApiKeyMissingAlert';
import FlightsLoading from '@/components/flights/FlightsLoading';
import FlightsError from '@/components/flights/FlightsError';
import { FlightHeader } from '@/components/flights/FlightHeader';
import FlightList from '@/components/flights/FlightList';

const ReturnFlightsPage = () => {
  const navigate = useNavigate();
  const { 
    selectedReturnFlight,
    setSelectedReturnFlight,
    setIsRoundTrip,
    setSkipHotels
  } = useBookingStore();
  
  // State for flights and pagination
  const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // State for filters and sorting
  const [sortBy, setSortBy] = useState<'price' | 'time'>('price');
  const [cabinFilter, setCabinFilter] = useState<string | null>(null);
  const [maxStops, setMaxStops] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  
  // Other state
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [skipAccommodations, setSkipAccommodations] = useState(false);
  
  // Location and date details
  const from = localStorage.getItem('fromLocation') || '';
  const to = localStorage.getItem('toLocation') || '';
  const fromName = localStorage.getItem('fromLocationName') || '';
  const toName = localStorage.getItem('toLocationName') || '';
  
  // Get return date from localStorage
  const returnDateValue = localStorage.getItem('returnDate') || '';
  
  // Check if a valid return date exists
  const hasReturnDate = !!returnDateValue && !isNaN(new Date(returnDateValue).getTime());
  
  // Formatted return date for display
  const formattedReturnDate = hasReturnDate
    ? new Date(returnDateValue).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Return date';

  // Initialize data
  useEffect(() => {
    // Set the round trip status in the store
    setIsRoundTrip(true);
    
    // Validate required flight data
    if (!from || !to || !returnDateValue) {
      toast.error('Missing return flight information', {
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
  }, [fetchAttempted, navigate, setIsRoundTrip, from, to, returnDateValue]);

  // Handle load more flights
  const loadMoreFlights = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      
      const newFlights = await fetchFlights(
        to, // Swap from/to for return flights
        from,
        returnDateValue, 
        undefined, 
        'oneway',
        nextPage
      );
      
      if (newFlights.length === 0) {
        setHasMore(false);
      } else {
        setReturnFlights(prev => [...prev, ...newFlights]);
        setPage(nextPage);
      }
    } catch (err: any) {
      console.error('Error loading more flights:', err);
      toast.error('Failed to load more flights');
    } finally {
      setLoadingMore(false);
    }
  }, [from, to, returnDateValue, page, loadingMore, hasMore]);

  // Fetch flights function
  const getFlights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!returnDateValue) {
        setError('Return date is missing');
        toast.error('Return date is required for return flights');
        setLoading(false);
        return;
      }
      
      console.log('Fetching return flights from:', to, 'to:', from, 'on:', returnDateValue);
      
      const returnFlightsData = await fetchFlights(to, from, returnDateValue, undefined, 'oneway', 1);
      console.log('Return flights received:', returnFlightsData.length);
      
      setReturnFlights(returnFlightsData);
      setPage(1);
      setHasMore(returnFlightsData.length >= 10);
    } catch (err: any) {
      console.error('Error fetching return flights:', err);
      if (err.message?.includes('API key not found')) {
        setApiKeyMissing(true);
      } else {
        setError(err.message || 'Failed to load flight data. Please try again.');
        toast.error('Failed to load return flights');
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

  // Apply filters and sorting to the flights
  const filteredAndSortedFlights = () => {
    let filtered = [...returnFlights];
    
    // Apply cabin filter
    if (cabinFilter) {
      filtered = filtered.filter(f => 
        f.details?.cabin?.toUpperCase() === cabinFilter
      );
    }
    
    // Apply stops filter
    if (maxStops !== null) {
      filtered = filtered.filter(f => 
        f.details?.stops !== undefined && f.details.stops <= maxStops
      );
    }
    
    // Apply price range filter
    filtered = filtered.filter(f => 
      f.price >= priceRange[0] && f.price <= priceRange[1]
    );
    
    // Apply airline filter
    if (selectedAirlines.length > 0) {
      filtered = filtered.filter(f => 
        selectedAirlines.includes(f.attribute)
      );
    }
    
    // Apply sorting
    return filtered.sort((a, b) => {
      if (sortBy === 'price') {
        return a.price - b.price;
      }
      // Sort by departure time
      if (a.details?.departureTime && b.details?.departureTime) {
        return new Date(a.details.departureTime).getTime() - new Date(b.details.departureTime).getTime();
      }
      return 0;
    });
  };

  const sortedReturnFlights = filteredAndSortedFlights();
  
  // Get unique airlines for filtering
  const airlines = [...new Set(returnFlights.map(f => f.attribute))];

  // Reset filters function
  const resetFilters = () => {
    setCabinFilter(null);
    setMaxStops(null);
    setPriceRange([0, 2000]);
    setSelectedAirlines([]);
  };

  // Render functions for different states
  if (apiKeyMissing) {
    return (
      <WebLayout title="API Key Required" showBackButton>
        <ApiKeyMissingAlert />
      </WebLayout>
    );
  }

  if (loading && returnFlights.length === 0) {
    return (
      <WebLayout title="Loading Return Flights..." showBackButton>
        <FlightsLoading />
      </WebLayout>
    );
  }

  if (error && returnFlights.length === 0) {
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
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Filter Sidebar - Desktop */}
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
                  {/* Stops Filter */}
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

                  {/* Cabin Class Filter */}
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

                  {/* Price Range Filter */}
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

                  {/* Airlines Filter */}
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

            {/* Mobile Filter Button and Drawer */}
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
                      {/* Mobile versions of the same filters */}
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
            
            {/* Main Content */}
            <div className="md:col-span-3">
              <FlightHeader 
                fromName={toName}
                toName={fromName}
                from={to}
                to={from}
                departureDate={formattedReturnDate}
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
                  onLoadMore={loadMoreFlights}
                  hasMore={hasMore}
                  loading={loadingMore}
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
          </div>
        </div>
      </WebLayout>
    </AuthGuard>
  );
};

export default ReturnFlightsPage;
