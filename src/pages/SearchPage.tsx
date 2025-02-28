import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import WebLayout from '@/components/WebLayout';
import { Button } from '@/components/ui/button';
import { Search, Plane, MapPin, Calendar, Info, User, RotateCcw, X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { getDestinationInfo, searchCities } from '@/services/travelApi';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useBookingStore } from '@/stores/bookingStore';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';

const popularDestinations = [
  { code: 'JFK', city: 'New York', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
  { code: 'LAX', city: 'Los Angeles', image: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
  { code: 'MIA', city: 'Miami', image: 'https://images.unsplash.com/photo-1535498730771-e735b998cd64?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
  { code: 'ORD', city: 'Chicago', image: 'https://images.unsplash.com/photo-1581373449483-37449f962b9c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
  { code: 'SFO', city: 'San Francisco', image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
];

interface LocationOption {
  code: string;
  name: string;
}

const SearchPage = () => {
  // Form state
  const [fromLocationInput, setFromLocationInput] = useState('');
  const [toLocationInput, setToLocationInput] = useState('');
  const [fromLocationCode, setFromLocationCode] = useState('LAX');
  const [toLocationCode, setToLocationCode] = useState('JFK');
  const [fromLocationName, setFromLocationName] = useState('Los Angeles');
  const [toLocationName, setToLocationName] = useState('New York');
  
  // Search results state
  const [fromOptions, setFromOptions] = useState<LocationOption[]>([]);
  const [toOptions, setToOptions] = useState<LocationOption[]>([]);
  const [isSearchingFrom, setIsSearchingFrom] = useState(false);
  const [isSearchingTo, setIsSearchingTo] = useState(false);
  const [fromPopoverOpen, setFromPopoverOpen] = useState(false);
  const [toPopoverOpen, setToPopoverOpen] = useState(false);

  // Date state
  const [departureDate, setDepartureDate] = useState<Date | undefined>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default: 1 week from now
  );
  const [returnDate, setReturnDate] = useState<Date | undefined>(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // Default: 2 weeks from now
  );
  
  // Other state
  const [destinationInfo, setDestinationInfo] = useState<string>('');
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  
  // Hooks
  const { user } = useAuth();
  const { setIsRoundTrip: setGlobalIsRoundTrip } = useBookingStore();
  const navigate = useNavigate();
  const fromSearchTimeoutRef = useRef<number | null>(null);
  const toSearchTimeoutRef = useRef<number | null>(null);

  // Update global state when round trip option changes
  useEffect(() => {
    setGlobalIsRoundTrip(isRoundTrip);
  }, [isRoundTrip, setGlobalIsRoundTrip]);

  // Debounced search for locations
  const searchFromLocations = (query: string) => {
    setFromLocationInput(query);
    setIsSearchingFrom(true);
    
    if (fromSearchTimeoutRef.current) {
      clearTimeout(fromSearchTimeoutRef.current);
    }

    fromSearchTimeoutRef.current = window.setTimeout(async () => {
      if (query.length > 1) {
        const results = await searchCities(query);
        setFromOptions(results);
      } else {
        setFromOptions([]);
      }
      setIsSearchingFrom(false);
    }, 300);
  };

  const searchToLocations = (query: string) => {
    setToLocationInput(query);
    setIsSearchingTo(true);
    
    if (toSearchTimeoutRef.current) {
      clearTimeout(toSearchTimeoutRef.current);
    }

    toSearchTimeoutRef.current = window.setTimeout(async () => {
      if (query.length > 1) {
        const results = await searchCities(query);
        setToOptions(results);
      } else {
        setToOptions([]);
      }
      setIsSearchingTo(false);
    }, 300);
  };

  // Handle location selection
  const selectFromLocation = (location: LocationOption) => {
    setFromLocationCode(location.code);
    setFromLocationName(location.name);
    setFromLocationInput(location.name);
    setFromPopoverOpen(false);
  };

  const selectToLocation = (location: LocationOption) => {
    setToLocationCode(location.code);
    setToLocationName(location.name);
    setToLocationInput(location.name);
    setToPopoverOpen(false);
  };

  // Clear location selections
  const clearFromLocation = () => {
    setFromLocationInput('');
    setFromLocationCode('');
    setFromLocationName('');
  };

  const clearToLocation = () => {
    setToLocationInput('');
    setToLocationCode('');
    setToLocationName('');
  };

  // Fetch information about a destination using Perplexity API integration
  const fetchDestinationInfo = async (destination: string) => {
    if (!destination) return;
    
    setIsLoading(true);
    try {
      const info = await getDestinationInfo(destination);
      setDestinationInfo(info);
      setSelectedDestination(destination);
    } catch (error) {
      console.error('Error fetching destination info:', error);
      toast.error('Failed to get destination information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDestinationClick = (city: string) => {
    fetchDestinationInfo(city);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fromLocationCode || !toLocationCode) {
      toast.error('Please select both departure and arrival locations');
      return;
    }
    
    if (!departureDate) {
      toast.error('Please select a departure date');
      return;
    }
    
    if (isRoundTrip && !returnDate) {
      toast.error('Please select a return date for round trip');
      return;
    }
    
    if (isRoundTrip && returnDate && departureDate && returnDate < departureDate) {
      toast.error('Return date cannot be before departure date');
      return;
    }
    
    // Store search parameters in localStorage
    localStorage.setItem('fromLocation', fromLocationCode);
    localStorage.setItem('toLocation', toLocationCode);
    localStorage.setItem('fromLocationName', fromLocationName);
    localStorage.setItem('toLocationName', toLocationName);
    localStorage.setItem('departureDate', departureDate.toISOString().split('T')[0]);
    
    if (isRoundTrip && returnDate) {
      localStorage.setItem('returnDate', returnDate.toISOString().split('T')[0]);
      localStorage.setItem('tripType', 'roundtrip');
    } else {
      localStorage.removeItem('returnDate');
      localStorage.setItem('tripType', 'oneway');
    }
    
    toast.success(`Searching flights from ${fromLocationName} to ${toLocationName}`);
    navigate('/flights');
  };

  return (
    <WebLayout>
      <div className="relative min-h-[500px] flex items-center justify-center bg-gradient-to-b from-blue-500 to-blue-700 text-white mb-12">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80" 
            alt="Travel background" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="container mx-auto relative z-10 px-4 py-16">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Your Next Adventure</h1>
            <p className="text-xl text-blue-100">Find and book the perfect trip, all in one place</p>
          </div>
          
          <div className="flex justify-center">
            <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg w-full max-w-3xl">
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Search Flights</h2>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="trip-type" className="text-sm font-medium">Round Trip</Label>
                    <Switch
                      id="trip-type"
                      checked={isRoundTrip}
                      onCheckedChange={setIsRoundTrip}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromLocation">From (City or Airport)</Label>
                    <Popover open={fromPopoverOpen} onOpenChange={setFromPopoverOpen}>
                      <PopoverTrigger asChild>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <Input
                            id="fromLocation"
                            value={fromLocationInput}
                            onChange={(e) => searchFromLocations(e.target.value)}
                            placeholder="Search cities or airports"
                            className="pl-10 pr-10"
                            onClick={() => setFromPopoverOpen(true)}
                          />
                          {fromLocationInput && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                clearFromLocation();
                              }}
                            >
                              <X size={16} />
                            </Button>
                          )}
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="p-0" align="start" sideOffset={5}>
                        <Command>
                          <CommandInput 
                            placeholder="Search cities or airports" 
                            value={fromLocationInput}
                            onValueChange={searchFromLocations}
                            className="h-9"
                          />
                          {isSearchingFrom && <div className="p-2 text-sm text-center">Searching...</div>}
                          {!isSearchingFrom && (
                            <>
                              <CommandEmpty>No locations found</CommandEmpty>
                              <CommandGroup>
                                {fromOptions.map((option) => (
                                  <CommandItem
                                    key={option.code}
                                    value={option.name}
                                    onSelect={() => selectFromLocation(option)}
                                  >
                                    <div className="flex items-center">
                                      <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                                      <span>{option.name}</span>
                                      <Badge variant="outline" className="ml-2">{option.code}</Badge>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </>
                          )}
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {fromLocationCode && !fromLocationInput && (
                      <p className="text-xs text-gray-500 mt-1">Selected: {fromLocationName} ({fromLocationCode})</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="toLocation">To (City or Airport)</Label>
                    <Popover open={toPopoverOpen} onOpenChange={setToPopoverOpen}>
                      <PopoverTrigger asChild>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <Input
                            id="toLocation"
                            value={toLocationInput}
                            onChange={(e) => searchToLocations(e.target.value)}
                            placeholder="Search cities or airports"
                            className="pl-10 pr-10"
                            onClick={() => setToPopoverOpen(true)}
                          />
                          {toLocationInput && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                clearToLocation();
                              }}
                            >
                              <X size={16} />
                            </Button>
                          )}
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="p-0" align="start" sideOffset={5}>
                        <Command>
                          <CommandInput 
                            placeholder="Search cities or airports" 
                            value={toLocationInput}
                            onValueChange={searchToLocations}
                            className="h-9"
                          />
                          {isSearchingTo && <div className="p-2 text-sm text-center">Searching...</div>}
                          {!isSearchingTo && (
                            <>
                              <CommandEmpty>No locations found</CommandEmpty>
                              <CommandGroup>
                                {toOptions.map((option) => (
                                  <CommandItem
                                    key={option.code}
                                    value={option.name}
                                    onSelect={() => selectToLocation(option)}
                                  >
                                    <div className="flex items-center">
                                      <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                                      <span>{option.name}</span>
                                      <Badge variant="outline" className="ml-2">{option.code}</Badge>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </>
                          )}
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {toLocationCode && !toLocationInput && (
                      <p className="text-xs text-gray-500 mt-1">Selected: {toLocationName} ({toLocationCode})</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departureDate">Departure Date</Label>
                    <div className="relative">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal pl-10"
                          >
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            {departureDate ? (
                              format(departureDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={departureDate}
                            onSelect={setDepartureDate}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  {isRoundTrip && (
                    <div className="space-y-2">
                      <Label htmlFor="returnDate">Return Date</Label>
                      <div className="relative">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal pl-10"
                            >
                              <RotateCcw className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                              {returnDate ? (
                                format(returnDate, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={returnDate}
                              onSelect={setReturnDate}
                              initialFocus
                              disabled={(date) => date < (departureDate || new Date())}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <Button 
                    type="submit" 
                    className="w-full"
                    size="lg"
                  >
                    <Search size={18} className="mr-2" />
                    Search Flights
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Popular Destinations</h2>
            <Button variant="outline" onClick={() => navigate(user ? '/settings' : '/auth')}>
              <User size={18} className="mr-2" />
              {user ? 'My Account' : 'Sign In'}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {popularDestinations.map(({ code, city, image }) => (
              <Card 
                key={code} 
                className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => handleDestinationClick(city)}
              >
                <div className="h-40 bg-gray-200 relative overflow-hidden">
                  <img 
                    src={image} 
                    alt={city} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="text-sm font-light">{code}</p>
                    <h3 className="font-medium text-lg">{city}</h3>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {destinationInfo && (
          <div className="mb-16">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-none shadow-md overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start gap-4">
                  <div className="flex-shrink-0 bg-blue-100 text-blue-600 p-3 rounded-full hidden md:block">
                    <Info className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-blue-800">About {selectedDestination}</h3>
                    <p className="text-gray-700 leading-relaxed">{destinationInfo}</p>
                    <Button variant="link" className="p-0 mt-2 text-blue-600">
                      Learn more about {selectedDestination}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Why Choose TravelBooker</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Best Price Guarantee</h3>
                <p className="text-gray-600">Find a lower price? We'll match it and give you an additional discount.</p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Safe & Secure</h3>
                <p className="text-gray-600">Your data is protected with industry-leading encryption and security protocols.</p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.5 12a2.5 2.5 0 15 0 2.5 2.5 0 01-5 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">24/7 Support</h3>
                <p className="text-gray-600">Our dedicated support team is available around the clock to assist you.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </WebLayout>
  );
};

export default SearchPage;
