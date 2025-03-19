
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, Plane, Hotel, Car, Briefcase, Search, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ComboboxDestination } from '@/components/ComboboxDestination';
import WebLayout from '@/components/WebLayout';
import { useApiKey } from '@/contexts/ApiKeyContext';

const SearchPage = () => {
  const navigate = useNavigate();
  const { hasPerplexityApiKey, apiKeyError } = useApiKey();
  
  const [searchParams, setSearchParams] = useState({
    tab: 'flights',
    from: '',
    fromCode: '',
    to: '',
    toCode: '',
    departDate: new Date(),
    returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    passengers: 1,
    rooms: 1,
    cabinClass: 'economy'
  });
  
  const [validationErrors, setValidationErrors] = useState<{
    from?: string;
    to?: string;
    departDate?: string;
    returnDate?: string;
  }>({});

  const handleDestinationSelect = (key: 'from' | 'to', value: { code: string; name: string }) => {
    setSearchParams({
      ...searchParams,
      [key]: value.name,
      [`${key}Code`]: value.code
    });
    
    // Clear validation error when a value is selected
    if (validationErrors[key]) {
      setValidationErrors({
        ...validationErrors,
        [key]: undefined
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: {
      from?: string;
      to?: string;
      departDate?: string;
      returnDate?: string;
    } = {};
    
    if (!searchParams.from) {
      errors.from = 'Please select a departure city';
    }
    
    if (!searchParams.to) {
      errors.to = 'Please select a destination city';
    }
    
    if (!searchParams.departDate) {
      errors.departDate = 'Please select a departure date';
    }
    
    setValidationErrors(errors);
    
    // Form is valid if errors object is empty
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPerplexityApiKey) {
      toast.error('Please add a Perplexity API key in settings before searching', {
        description: "This is required to fetch travel data",
        action: {
          label: "Settings",
          onClick: () => navigate('/settings')
        }
      });
      return;
    }
    
    // Validate the form
    if (!validateForm()) {
      // Display validation errors
      Object.entries(validationErrors).forEach(([field, error]) => {
        if (error) {
          toast.error(error);
        }
      });
      return;
    }
    
    if (searchParams.tab === 'flights') {
      // Save flight search parameters to localStorage
      localStorage.setItem('fromLocation', searchParams.fromCode);
      localStorage.setItem('toLocation', searchParams.toCode);
      localStorage.setItem('fromLocationName', searchParams.from);
      localStorage.setItem('toLocationName', searchParams.to);
      localStorage.setItem('departureDate', searchParams.departDate.toISOString());
      
      // Save return date only if it's a valid date
      if (searchParams.returnDate) {
        localStorage.setItem('returnDate', searchParams.returnDate.toISOString());
      } else {
        localStorage.removeItem('returnDate');
      }
      
      navigate('/flights', { state: searchParams });
    } else if (searchParams.tab === 'hotels') {
      if (!searchParams.to) {
        toast.error('Please select a destination');
        return;
      }
      
      // Save hotel search parameters
      localStorage.setItem('hotelDestination', searchParams.toCode);
      localStorage.setItem('hotelDestinationName', searchParams.to);
      localStorage.setItem('checkInDate', searchParams.departDate.toISOString());
      localStorage.setItem('checkOutDate', searchParams.returnDate.toISOString());
      
      navigate('/accommodations', { state: searchParams });
    } else {
      toast.info('This feature is coming soon!');
    }
  };

  return (
    <WebLayout title="Book Travel">
      <div className="bg-gradient-to-b from-blue-600 via-blue-700 to-blue-800 py-20 px-4 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-shadow">Find Your Perfect Trip</h1>
          <p className="text-xl mb-8 text-blue-100">Search flights, hotels, and more at the best prices</p>
          
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 text-left border border-blue-100">
            <Tabs 
              defaultValue="flights" 
              value={searchParams.tab}
              onValueChange={(value) => setSearchParams({...searchParams, tab: value})}
              className="mb-8"
            >
              <TabsList className="grid grid-cols-4 md:w-[400px] mb-6 bg-blue-50 p-1 rounded-lg">
                <TabsTrigger value="flights" className="flex items-center gap-2 rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Plane className="h-4 w-4" />
                  <span className="hidden sm:inline">Flights</span>
                </TabsTrigger>
                <TabsTrigger value="hotels" className="flex items-center gap-2 rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Hotel className="h-4 w-4" />
                  <span className="hidden sm:inline">Hotels</span>
                </TabsTrigger>
                <TabsTrigger value="cars" className="flex items-center gap-2 rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Car className="h-4 w-4" />
                  <span className="hidden sm:inline">Cars</span>
                </TabsTrigger>
                <TabsTrigger value="packages" className="flex items-center gap-2 rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden sm:inline">Packages</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="flights" className="text-gray-700">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-1 text-gray-700">From</label>
                      <ComboboxDestination 
                        placeholder="Departure city or airport"
                        onSelect={(value) => handleDestinationSelect('from', value)}
                        selectedValue={searchParams.from}
                      />
                      {validationErrors.from && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.from}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-1 text-gray-700">To</label>
                      <ComboboxDestination 
                        placeholder="Destination city or airport"
                        onSelect={(value) => handleDestinationSelect('to', value)}
                        selectedValue={searchParams.to}
                      />
                      {validationErrors.to && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.to}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-1 text-gray-700">Departure Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal border-gray-300 hover:bg-gray-50",
                              !searchParams.departDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                            {searchParams.departDate ? format(searchParams.departDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 z-50">
                          <Calendar
                            mode="single"
                            selected={searchParams.departDate}
                            onSelect={(date) => date && setSearchParams({...searchParams, departDate: date})}
                            initialFocus
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      {validationErrors.departDate && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.departDate}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-1 text-gray-700">Return Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal border-gray-300 hover:bg-gray-50",
                              !searchParams.returnDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                            {searchParams.returnDate ? format(searchParams.returnDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 z-50">
                          <Calendar
                            mode="single"
                            selected={searchParams.returnDate}
                            onSelect={(date) => date && setSearchParams({...searchParams, returnDate: date})}
                            initialFocus
                            disabled={(date) => date < searchParams.departDate}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      {validationErrors.returnDate && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.returnDate}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-1 text-gray-700">Passengers</label>
                      <Input 
                        type="number" 
                        min="1" 
                        max="9"
                        value={searchParams.passengers}
                        onChange={(e) => setSearchParams({...searchParams, passengers: parseInt(e.target.value) || 1})}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-1 text-gray-700">Cabin Class</label>
                      <select 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchParams.cabinClass}
                        onChange={(e) => setSearchParams({...searchParams, cabinClass: e.target.value})}
                      >
                        <option value="economy">Economy</option>
                        <option value="premium">Premium Economy</option>
                        <option value="business">Business</option>
                        <option value="first">First Class</option>
                      </select>
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => {
                          setSearchParams({
                            ...searchParams,
                            from: '',
                            fromCode: '',
                            to: '',
                            toCode: '',
                            departDate: new Date(),
                            returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                            passengers: 1,
                            cabinClass: 'economy'
                          });
                          setValidationErrors({});
                        }}
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 rounded-lg shadow-lg transition-all hover:shadow-xl"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Search Flights
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="hotels" className="text-gray-700">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Destination</label>
                    <ComboboxDestination 
                      placeholder="City or specific hotel"
                      onSelect={(value) => handleDestinationSelect('to', value)}
                      selectedValue={searchParams.to}
                    />
                    {validationErrors.to && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.to}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-1 text-gray-700">Check-in Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal border-gray-300 hover:bg-gray-50",
                              !searchParams.departDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                            {searchParams.departDate ? format(searchParams.departDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 z-50">
                          <Calendar
                            mode="single"
                            selected={searchParams.departDate}
                            onSelect={(date) => date && setSearchParams({...searchParams, departDate: date})}
                            initialFocus
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-1 text-gray-700">Check-out Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal border-gray-300 hover:bg-gray-50",
                              !searchParams.returnDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                            {searchParams.returnDate ? format(searchParams.returnDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 z-50">
                          <Calendar
                            mode="single"
                            selected={searchParams.returnDate}
                            onSelect={(date) => date && setSearchParams({...searchParams, returnDate: date})}
                            initialFocus
                            disabled={(date) => date < searchParams.departDate}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-1 text-gray-700">Rooms</label>
                      <Input 
                        type="number" 
                        min="1" 
                        max="9"
                        value={searchParams.rooms}
                        onChange={(e) => setSearchParams({...searchParams, rooms: parseInt(e.target.value) || 1})}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-1 text-gray-700">Guests</label>
                      <Input 
                        type="number" 
                        min="1" 
                        max="20"
                        value={searchParams.passengers}
                        onChange={(e) => setSearchParams({...searchParams, passengers: parseInt(e.target.value) || 1})}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => {
                          setSearchParams({
                            ...searchParams,
                            to: '',
                            toCode: '',
                            departDate: new Date(),
                            returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                            passengers: 1,
                            rooms: 1
                          });
                          setValidationErrors({});
                        }}
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 rounded-lg shadow-lg transition-all hover:shadow-xl"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Search Hotels
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="cars" className="text-gray-700">
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <Car className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-xl font-medium text-gray-700">Car rentals coming soon!</p>
                  <p className="text-gray-500 max-w-md text-center mt-2">We're currently working on adding car rental options to enhance your travel experience.</p>
                  <Button 
                    variant="outline" 
                    className="mt-6 border-blue-300 text-blue-600 hover:bg-blue-50"
                    onClick={() => setSearchParams({...searchParams, tab: 'flights'})}
                  >
                    Back to Flights
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="packages" className="text-gray-700">
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <Briefcase className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-xl font-medium text-gray-700">Travel packages coming soon!</p>
                  <p className="text-gray-500 max-w-md text-center mt-2">Our team is developing comprehensive travel packages that will save you time and money.</p>
                  <Button 
                    variant="outline" 
                    className="mt-6 border-blue-300 text-blue-600 hover:bg-blue-50"
                    onClick={() => setSearchParams({...searchParams, tab: 'flights'})}
                  >
                    Back to Flights
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            
            {apiKeyError && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md text-sm mt-6 flex items-start">
                <div className="flex-1">{apiKeyError}</div>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-blue-600 ml-2 whitespace-nowrap"
                  onClick={() => navigate('/settings')}
                >
                  Go to Settings
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-gray-800">Popular Destinations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[
            { name: "New York", code: "NYC", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
            { name: "Paris", code: "PAR", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
            { name: "Tokyo", code: "TYO", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
            { name: "London", code: "LON", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
            { name: "Rome", code: "ROM", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
            { name: "Sydney", code: "SYD", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
            { name: "Dubai", code: "DXB", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
            { name: "Barcelona", code: "BCN", image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
          ].map((destination) => (
            <div 
              key={destination.code}
              className="group relative rounded-xl overflow-hidden shadow-md h-60 cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
              onClick={() => {
                setSearchParams({...searchParams, to: destination.name, toCode: destination.code});
                navigate('/flights', { state: {...searchParams, to: destination.name, toCode: destination.code} });
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />
              <img src={destination.image} alt={destination.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-xl font-bold">{destination.name}</h3>
                <p className="text-sm opacity-90 flex items-center mt-1">
                  <Search className="h-3 w-3 mr-1" /> Explore deals
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800">Why Book With Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
              <div className="text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Best Price Guarantee</h3>
              <p className="text-gray-600">Find a lower price? We'll match it and give you an additional discount.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
              <div className="text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">No Hidden Fees</h3>
              <p className="text-gray-600">We show the total price upfront with no surprise charges at checkout.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
              <div className="text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">24/7 Customer Support</h3>
              <p className="text-gray-600">Our dedicated team is available around the clock to assist with any questions.</p>
            </div>
          </div>
        </div>
      </div>
    </WebLayout>
  );
};

export default SearchPage;
