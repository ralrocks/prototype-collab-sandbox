
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '@/components/PhoneFrame';
import VirtualKeyboard from '@/components/VirtualKeyboard';

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
              <div className="mb-6">
                <img 
                  src="/lovable-uploads/72ddd581-71b8-46ab-8d72-8047203d4783.png" 
                  alt="Map background"
                  className="w-full h-56 object-cover rounded-lg shadow-md opacity-90"
                />
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
