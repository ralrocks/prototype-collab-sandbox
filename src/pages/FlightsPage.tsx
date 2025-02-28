
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '@/components/PhoneFrame';
import { ArrowRight } from 'lucide-react';

interface Flight {
  id: number;
  airline: string;
  duration: string;
  price: number;
  selected: boolean;
}

const FlightsPage = () => {
  const navigate = useNavigate();
  
  const [flights, setFlights] = useState<Flight[]>([
    { id: 1, airline: 'Southwest', duration: '8 hr 15 min', price: 220, selected: false },
    { id: 2, airline: 'Alaska', duration: '7 hr 5 min', price: 280, selected: false },
    { id: 3, airline: 'Spirit', duration: '6 hr 3 min', price: 210, selected: false },
    { id: 4, airline: 'JetBlue', duration: '7 hr 30 min', price: 245, selected: false },
  ]);

  const toggleFlightSelection = (id: number) => {
    setFlights(flights.map(flight => 
      flight.id === id ? { ...flight, selected: !flight.selected } : flight
    ));
  };

  const handleContinue = () => {
    if (flights.some(flight => flight.selected)) {
      navigate('/accommodations');
    }
  };

  return (
    <PhoneFrame title="First choose a flight!" showBackButton>
      <div className="p-4 h-full flex flex-col">
        <div className="mb-2 text-xs text-gray-500">
          Flight: Arrive (Destination: Boston)
        </div>

        <div className="mb-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="grid grid-cols-4 text-xs font-semibold text-gray-700 bg-gray-50 border-b">
              <div className="p-2 border-r">Airline</div>
              <div className="p-2 border-r">Duration</div>
              <div className="p-2 border-r">Price <span className="text-[8px]">▼</span></div>
              <div className="p-2"></div>
            </div>
            
            <div className="divide-y divide-gray-200 list-fade-in">
              {flights.map((flight) => (
                <div key={flight.id} className="grid grid-cols-4 text-xs table-row">
                  <div className="p-2 border-r">{flight.airline}</div>
                  <div className="p-2 border-r">{flight.duration}</div>
                  <div className="p-2 border-r">${flight.price}</div>
                  <div className="p-2 flex justify-center items-center">
                    <input
                      type="checkbox"
                      checked={flight.selected}
                      onChange={() => toggleFlightSelection(flight.id)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/25"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-6 gap-1 mt-3 text-center text-[10px] text-gray-500">
          <div>S</div>
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
        </div>
        
        <div className="grid grid-cols-6 gap-1">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="aspect-square flex items-center justify-center text-xs">
              {i + 1}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-6 gap-1 mt-2 text-center text-[10px] text-gray-500">
          <div>10</div>
          <div>12</div>
          <div>AM</div>
        </div>
        
        <div className="grid grid-cols-6 gap-1 mt-1 text-center text-[10px] text-gray-500">
          <div>10</div>
          <div>12</div>
          <div>PM</div>
        </div>
        
        <div className="mt-auto">
          <button
            onClick={handleContinue}
            className="w-full p-2 bg-black text-white rounded-lg flex items-center justify-center text-sm font-medium mt-4 transition-transform active:scale-[0.98] disabled:opacity-70"
            disabled={!flights.some(flight => flight.selected)}
          >
            Continue to Accommodations
            <ArrowRight size={16} className="ml-2" />
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
};

export default FlightsPage;
