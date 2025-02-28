
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '@/components/PhoneFrame';
import VirtualKeyboard from '@/components/VirtualKeyboard';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate('/flights');
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
                <div className="w-full h-56 bg-gray-200 rounded-lg shadow-md flex items-center justify-center text-gray-400">
                  <span>Travel Map Placeholder</span>
                </div>
              </div>
              
              <form onSubmit={handleSearch} className="relative mt-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Where would you like to travel?"
                    className="w-full p-3 pr-10 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="absolute right-1 top-1 rounded-full"
                  >
                    <Search size={18} />
                  </Button>
                </div>
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
