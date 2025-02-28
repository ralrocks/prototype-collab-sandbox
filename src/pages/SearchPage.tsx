
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '@/components/PhoneFrame';
import VirtualKeyboard from '@/components/VirtualKeyboard';
import { Button } from '@/components/ui/button';
import { Search, Plane } from 'lucide-react';
import { toast } from 'sonner';

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
    <PhoneFrame>
      <div className="h-full flex flex-col">
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-xs animate-slide-up">
              <h1 className="text-2xl font-bold mb-6 text-center">Travel Booking</h1>
              
              <div className="mb-6">
                <div className="w-full h-56 bg-gray-200 rounded-lg shadow-md flex items-center justify-center">
                  <Plane size={48} className="text-gray-400" />
                </div>
              </div>
              
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <label htmlFor="fromLocation" className="text-sm font-medium text-gray-700 mb-1 block">
                    From (Airport Code)
                  </label>
                  <input
                    id="fromLocation"
                    type="text"
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value.toUpperCase())}
                    placeholder="LAX"
                    className="w-full p-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                    maxLength={3}
                  />
                </div>
                
                <div className="relative">
                  <label htmlFor="toLocation" className="text-sm font-medium text-gray-700 mb-1 block">
                    To (Airport Code)
                  </label>
                  <input
                    id="toLocation"
                    type="text"
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value.toUpperCase())}
                    placeholder="JFK"
                    className="w-full p-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                    maxLength={3}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full mt-4"
                >
                  <Search size={18} className="mr-2" />
                  Search Flights
                </Button>
              </form>
            </div>
          </div>
        </div>
        
        <VirtualKeyboard />
      </div>
    </PhoneFrame>
  );
};

export default SearchPage;
