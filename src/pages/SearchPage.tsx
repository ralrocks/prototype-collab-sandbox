
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WebLayout from '@/components/WebLayout';
import { Button } from '@/components/ui/button';
import { Search, Plane, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const SearchPage = () => {
  const [fromLocation, setFromLocation] = useState('LAX');
  const [toLocation, setToLocation] = useState('JFK');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromLocation.trim() && toLocation.trim()) {
      localStorage.setItem('fromLocation', fromLocation);
      localStorage.setItem('toLocation', toLocation);
      toast.success(`Searching flights from ${fromLocation} to ${toLocation}`);
      navigate('/flights');
    } else {
      toast.error('Please enter both departure and arrival locations');
    }
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
                  <label htmlFor="fromLocation" className="text-sm font-medium text-gray-700 block">
                    From (Airport Code)
                  </label>
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
                  <label htmlFor="toLocation" className="text-sm font-medium text-gray-700 block">
                    To (Airport Code)
                  </label>
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {['New York', 'Los Angeles', 'Miami'].map((city) => (
              <Card key={city} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 bg-gray-200 flex items-center justify-center">
                  <MapPin size={32} className="text-gray-400" />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-lg">{city}</h3>
                  <p className="text-sm text-gray-500 mt-1">Explore flights and hotels</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </WebLayout>
  );
};

export default SearchPage;
