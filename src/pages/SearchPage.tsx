
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WebLayout from '@/components/WebLayout';
import { Button } from '@/components/ui/button';
import { Search, Plane, MapPin, Calendar, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { getDestinationInfo } from '@/services/travelApi';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

const popularDestinations = [
  { code: 'JFK', city: 'New York' },
  { code: 'LAX', city: 'Los Angeles' },
  { code: 'MIA', city: 'Miami' },
  { code: 'ORD', city: 'Chicago' },
  { code: 'SFO', city: 'San Francisco' },
];

const SearchPage = () => {
  const [fromLocation, setFromLocation] = useState('LAX');
  const [toLocation, setToLocation] = useState('JFK');
  const [departureDate, setDepartureDate] = useState<Date | undefined>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default: 1 week from now
  );
  const [destinationInfo, setDestinationInfo] = useState<string>('');
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

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
    
    if (!fromLocation.trim() || !toLocation.trim()) {
      toast.error('Please enter both departure and arrival locations');
      return;
    }
    
    if (!departureDate) {
      toast.error('Please select a departure date');
      return;
    }
    
    // Store search parameters in localStorage
    localStorage.setItem('fromLocation', fromLocation);
    localStorage.setItem('toLocation', toLocation);
    localStorage.setItem('departureDate', departureDate.toISOString().split('T')[0]);
    
    toast.success(`Searching flights from ${fromLocation} to ${toLocation}`);
    navigate('/flights');
  };

  return (
    <WebLayout>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col justify-center space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Find your perfect trip</h1>
              <p className="text-lg text-gray-600">
                Search for flights and accommodations at the best prices
              </p>
            </div>
            
            <form onSubmit={handleSearch} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromLocation">From (Airport Code)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      id="fromLocation"
                      type="text"
                      value={fromLocation}
                      onChange={(e) => setFromLocation(e.target.value.toUpperCase())}
                      placeholder="LAX"
                      className="pl-10"
                      maxLength={3}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="toLocation">To (Airport Code)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      id="toLocation"
                      type="text"
                      value={toLocation}
                      onChange={(e) => setToLocation(e.target.value.toUpperCase())}
                      placeholder="JFK"
                      className="pl-10"
                      maxLength={3}
                    />
                  </div>
                </div>
              </div>

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
              
              <Button 
                type="submit" 
                className="w-full"
                size="lg"
              >
                <Search size={18} className="mr-2" />
                Search Flights
              </Button>
            </form>
          </div>
          
          <div className="hidden md:flex items-center justify-center">
            <div className="relative w-full h-80 bg-gray-200 rounded-lg overflow-hidden shadow-md">
              <div className="absolute inset-0 flex items-center justify-center">
                <Plane size={64} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-6">Popular Destinations</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {popularDestinations.map(({ code, city }) => (
              <Card 
                key={code} 
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleDestinationClick(city)}
              >
                <div className="h-32 bg-gray-200 flex items-center justify-center">
                  <MapPin size={32} className="text-gray-400" />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-lg">{city}</h3>
                  <p className="text-sm text-gray-500 mt-1">{code}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {destinationInfo && (
          <div className="mt-12">
            <Card className="bg-gray-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Info className="text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">About {selectedDestination}</h3>
                    <p className="text-gray-700">{destinationInfo}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </WebLayout>
  );
};

export default SearchPage;
