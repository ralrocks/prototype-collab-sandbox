
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Check, ArrowRight } from 'lucide-react';
import PhoneFrame from '@/components/PhoneFrame';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/stores/bookingStore';

interface Flight {
  id: number;
  attribute: string;
  question1: string;
  price: number;
}

const FlightsPage = () => {
  const navigate = useNavigate();
  const { setSelectedFlight, selectedFlight } = useBookingStore();
  
  const [flights] = useState<Flight[]>([
    { id: 1, attribute: 'Delta Airlines', question1: 'Non-stop', price: 220 },
    { id: 2, attribute: 'Alaska Airlines', question1: '1 stop', price: 180 },
    { id: 3, attribute: 'Spirit', question1: 'Non-stop', price: 210 },
    { id: 4, attribute: 'JetBlue', question1: '2 stops', price: 150 },
  ]);

  const handleFlightSelect = (flight: Flight) => {
    setSelectedFlight(flight);
  };

  const handleContinue = () => {
    if (!selectedFlight) {
      toast.error("Please select a flight first!");
      return;
    }
    navigate('/accommodations');
  };

  return (
    <PhoneFrame title="Select a Flight" showBackButton>
      <div className="p-4 h-full flex flex-col">
        <div className="mb-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="grid grid-cols-3 text-xs font-semibold text-gray-700 bg-gray-50 border-b">
              <div className="p-2 border-r">Flight Attribute</div>
              <div className="p-2 border-r">Question 1</div>
              <div className="p-2">Pizza (Price)</div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {flights.map((flight) => (
                <div 
                  key={flight.id} 
                  onClick={() => handleFlightSelect(flight)}
                  className={`grid grid-cols-3 text-xs table-row cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedFlight?.id === flight.id 
                      ? 'bg-green-50 border-2 border-green-500' 
                      : ''
                  }`}
                >
                  <div className="p-2 border-r">{flight.attribute}</div>
                  <div className="p-2 border-r">{flight.question1}</div>
                  <div className="p-2 flex items-center justify-between">
                    ${flight.price}
                    {selectedFlight?.id === flight.id && (
                      <Check size={16} className="text-green-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-auto">
          <Button
            onClick={handleContinue}
            className="w-full p-2 bg-black text-white rounded-lg flex items-center justify-center text-sm font-medium transition-all"
            disabled={!selectedFlight}
          >
            Next Step
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </PhoneFrame>
  );
};

export default FlightsPage;
