
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight, Filter, X, ChevronDown, Plane, Clock } from 'lucide-react';
import WebLayout from '@/components/WebLayout';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/stores/bookingStore';
import { fetchFlights } from '@/services/travelApi';
import { Flight, FlightFilter } from '@/types';
import { AuthGuard } from '@/components/AuthGuard';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

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
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'time'>('price');
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [skipAccommodations, setSkipAccommodations] = useState(false);
  const [isOneWay, setIsOneWay] = useState(false);
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FlightFilter>({
    stops: null,
    cabins: null,
    airlines: null,
    priceRange: null,
    departureTimeRange: null
  });
  const [filters, setFilters] = useState<FlightFilter>({
    stops: null,
    cabins: null,
    airlines: null,
    priceRange: null,
    departureTimeRange: null
  });
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [availableAirlines, setAvailableAirlines] = useState<string[]>([]);
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastFlightElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreFlights();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);
  
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

  const getFlights = async (resetPage = true) => {
    try {
      if (resetPage) {
        setLoading(true);
        setPage(1);
        setOutboundFlights([]);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      const fromCode = localStorage.getItem('fromLocation') || 'LAX';
      const toCode = localStorage.getItem('toLocation') || 'JFK';
      const departureDate = localStorage.getItem('departureDate') || '2023-12-10';
      const tripType = localStorage.getItem('tripType') || 'roundtrip';
      
      console.log('Fetching outbound flights from:', fromCode, 'to:', toCode, 'on:', departureDate);
      
      // Fetch outbound flights
      const currentPage = resetPage ? 1 : page;
      const outboundFlightsData = await fetchFlights(fromCode, toCode, departureDate, undefined, 'oneway', currentPage, 10);
      console.log('Outbound flights received:', outboundFlightsData.length);
      
      if (resetPage) {
        setOutboundFlights(outboundFlightsData);
        
        // Extract available airlines for filtering
        const airlines = [...new Set(outboundFlightsData.map(flight => flight.attribute))];
        setAvailableAirlines(airlines);
        
        // Set price range based on data
        if (outboundFlightsData.length > 0) {
          const prices = outboundFlightsData.map(flight => flight.price);
          setMinPrice(Math.min(...prices));
          setMaxPrice(Math.max(...prices));
          setFilters(prev => ({
            ...prev,
            priceRange: [Math.min(...prices), Math.max(...prices)]
          }));
        }
      } else {
        setOutboundFlights(prev => [...prev, ...outboundFlightsData]);
      }
      
      // Check if there are more flights to load
      setHasMore(outboundFlightsData.length === 10);
      
      if (!resetPage) {
        setPage(prev => prev + 1);
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
      setLoadingMore(false);
    }
  };

  const loadMoreFlights = () => {
    if (!loading && !loadingMore && hasMore) {
      getFlights(false);
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

  const sortAndFilterFlights = (flights: Flight[]) => {
    let filtered = [...flights];
    
    // Apply filters
    if (activeFilters.stops && activeFilters.stops.length > 0) {
      filtered = filtered.filter(flight => 
        flight.details && activeFilters.stops?.includes(flight.details.stops)
      );
    }
    
    if (activeFilters.cabins && activeFilters.cabins.length > 0) {
      filtered = filtered.filter(flight => 
        flight.details && activeFilters.cabins?.includes(flight.details.cabin)
      );
    }
    
    if (activeFilters.airlines && activeFilters.airlines.length > 0) {
      filtered = filtered.filter(flight => 
        activeFilters.airlines?.includes(flight.attribute)
      );
    }
    
    if (activeFilters.priceRange) {
      const [min, max] = activeFilters.priceRange;
      filtered = filtered.filter(flight => 
        flight.price >= min && flight.price <= max
      );
    }
    
    // Sort the filtered flights
    return filtered.sort((a, b) => {
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

  const applyFilters = () => {
    setActiveFilters({...filters});
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    setFilters({
      stops: null,
      cabins: null,
      airlines: null,
      priceRange: [minPrice, maxPrice],
      departureTimeRange: null
    });
  };

  const handleStopFilterChange = (value: number) => {
    setFilters(prev => {
      const current = prev.stops || [];
      const newStops = current.includes(value) 
        ? current.filter(stop => stop !== value)
        : [...current, value];
      return {...prev, stops: newStops.length > 0 ? newStops : null};
    });
  };

  const handleCabinFilterChange = (value: string) => {
    setFilters(prev => {
      const current = prev.cabins || [];
      const newCabins = current.includes(value) 
        ? current.filter(cabin => cabin !== value)
        : [...current, value];
      return {...prev, cabins: newCabins.length > 0 ? newCabins : null};
    });
  };

  const handleAirlineFilterChange = (value: string) => {
    setFilters(prev => {
      const current = prev.airlines || [];
      const newAirlines = current.includes(value) 
        ? current.filter(airline => airline !== value)
        : [...current, value];
      return {...prev, airlines: newAirlines.length > 0 ? newAirlines : null};
    });
  };

  const handlePriceRangeChange = (value: number[]) => {
    setFilters(prev => ({...prev, priceRange: [value[0], value[1]]}));
  };

  const countActiveFilters = () => {
    let count = 0;
    if (activeFilters.stops && activeFilters.stops.length > 0) count++;
    if (activeFilters.cabins && activeFilters.cabins.length > 0) count++;
    if (activeFilters.airlines && activeFilters.airlines.length > 0) count++;
    if (activeFilters.priceRange) count++;
    if (activeFilters.departureTimeRange) count++;
    return count;
  };

  const sortedFilteredFlights = sortAndFilterFlights(outboundFlights);
  const activeFilterCount = countActiveFilters();

  // Render functions for different states
  if (apiKeyMissing) {
    return (
      <WebLayout title="API Key Required" showBackButton>
        <ApiKeyMissingAlert />
      </WebLayout>
    );
  }

  if (loading && page === 1) {
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
          
          <div className="mb-4 flex justify-between items-center">
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
            
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="ml-2 relative">
                  <Filter size={16} className="mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="flex justify-between items-center">
                    <span>Filter Flights</span>
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                      Reset
                    </Button>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="py-4">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="stops">
                      <AccordionTrigger>Stops</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="filter-nonstop" 
                              checked={filters.stops?.includes(0)}
                              onCheckedChange={() => handleStopFilterChange(0)}
                            />
                            <Label htmlFor="filter-nonstop">Non-stop</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="filter-onestop" 
                              checked={filters.stops?.includes(1)}
                              onCheckedChange={() => handleStopFilterChange(1)}
                            />
                            <Label htmlFor="filter-onestop">1 stop</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="filter-twostops" 
                              checked={filters.stops?.includes(2)}
                              onCheckedChange={() => handleStopFilterChange(2)}
                            />
                            <Label htmlFor="filter-twostops">2+ stops</Label>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="cabin">
                      <AccordionTrigger>Cabin Class</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="filter-economy" 
                              checked={filters.cabins?.includes('ECONOMY')}
                              onCheckedChange={() => handleCabinFilterChange('ECONOMY')}
                            />
                            <Label htmlFor="filter-economy">Economy</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="filter-premium" 
                              checked={filters.cabins?.includes('PREMIUM_ECONOMY')}
                              onCheckedChange={() => handleCabinFilterChange('PREMIUM_ECONOMY')}
                            />
                            <Label htmlFor="filter-premium">Premium Economy</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="filter-business" 
                              checked={filters.cabins?.includes('BUSINESS')}
                              onCheckedChange={() => handleCabinFilterChange('BUSINESS')}
                            />
                            <Label htmlFor="filter-business">Business</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="filter-first" 
                              checked={filters.cabins?.includes('FIRST')}
                              onCheckedChange={() => handleCabinFilterChange('FIRST')}
                            />
                            <Label htmlFor="filter-first">First</Label>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="price">
                      <AccordionTrigger>Price Range</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <Slider 
                            defaultValue={[minPrice, maxPrice]}
                            min={minPrice}
                            max={maxPrice}
                            step={1}
                            value={filters.priceRange ? [filters.priceRange[0], filters.priceRange[1]] : [minPrice, maxPrice]}
                            onValueChange={handlePriceRangeChange}
                          />
                          <div className="flex justify-between text-sm">
                            <span>${filters.priceRange ? filters.priceRange[0] : minPrice}</span>
                            <span>${filters.priceRange ? filters.priceRange[1] : maxPrice}</span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="airlines">
                      <AccordionTrigger>Airlines</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {availableAirlines.map(airline => (
                            <div key={airline} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`filter-airline-${airline.replace(/\s+/g, '-').toLowerCase()}`}
                                checked={filters.airlines?.includes(airline)}
                                onCheckedChange={() => handleAirlineFilterChange(airline)}
                              />
                              <Label htmlFor={`filter-airline-${airline.replace(/\s+/g, '-').toLowerCase()}`}>
                                {airline}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
                
                <div className="mt-4 space-y-4">
                  <Button onClick={applyFilters} className="w-full">
                    Apply Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          <div className="mb-8">
            {activeFilterCount > 0 && (
              <div className="bg-blue-50 p-3 mb-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-blue-700 mr-2">Active filters:</span>
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.stops && activeFilters.stops.length > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <span>Stops: {activeFilters.stops.map(s => s === 0 ? 'Non-stop' : `${s} stop${s > 1 ? 's' : ''}`).join(', ')}</span>
                        <X 
                          size={14} 
                          className="cursor-pointer" 
                          onClick={() => setActiveFilters(prev => ({...prev, stops: null}))}
                        />
                      </Badge>
                    )}
                    
                    {activeFilters.cabins && activeFilters.cabins.length > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <span>Class: {activeFilters.cabins.join(', ')}</span>
                        <X 
                          size={14} 
                          className="cursor-pointer" 
                          onClick={() => setActiveFilters(prev => ({...prev, cabins: null}))}
                        />
                      </Badge>
                    )}
                    
                    {activeFilters.priceRange && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <span>Price: ${activeFilters.priceRange[0]}-${activeFilters.priceRange[1]}</span>
                        <X 
                          size={14} 
                          className="cursor-pointer" 
                          onClick={() => setActiveFilters(prev => ({...prev, priceRange: null}))}
                        />
                      </Badge>
                    )}
                    
                    {activeFilters.airlines && activeFilters.airlines.length > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <span>Airlines: {activeFilters.airlines.length > 1 ? `${activeFilters.airlines.length} selected` : activeFilters.airlines[0]}</span>
                        <X 
                          size={14} 
                          className="cursor-pointer" 
                          onClick={() => setActiveFilters(prev => ({...prev, airlines: null}))}
                        />
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setActiveFilters({
                  stops: null,
                  cabins: null,
                  airlines: null,
                  priceRange: null,
                  departureTimeRange: null
                })}>
                  Clear All
                </Button>
              </div>
            )}
            
            <FlightList 
              flights={sortedFilteredFlights}
              direction="outbound"
              selectedFlight={selectedOutboundFlight}
              onSelectFlight={(flight) => handleFlightSelect(flight)}
              fromName={fromName}
              toName={toName}
              lastFlightRef={lastFlightElementRef}
            />
            
            {loadingMore && (
              <div className="text-center py-4">
                <div className="flex justify-center items-center gap-2">
                  <Plane className="h-5 w-5 animate-bounce" />
                  <span>Loading more flights...</span>
                </div>
              </div>
            )}
            
            {!loadingMore && !hasMore && sortedFilteredFlights.length > 0 && (
              <div className="text-center py-4 text-gray-500">
                No more flights available for this route
              </div>
            )}
            
            {sortedFilteredFlights.length === 0 && !loading && (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Clock className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <h3 className="text-lg font-medium">No flights match your filters</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filter criteria</p>
                <Button onClick={() => setActiveFilters({
                  stops: null,
                  cabins: null,
                  airlines: null,
                  priceRange: null,
                  departureTimeRange: null
                })}>
                  Clear All Filters
                </Button>
              </div>
            )}
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
